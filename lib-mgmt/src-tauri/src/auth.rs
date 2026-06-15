use std::collections::BTreeSet;
use std::sync::Arc;

use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AuthUser {
    pub username: String,
    pub display_name: String,
    pub idno: Option<String>,
    pub email: Option<String>,
    pub primary_role: String,
    pub roles: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserSession {
    pub user: AuthUser,
    pub permissions: Vec<String>,
    pub expires_at: i64,
}

#[derive(Default)]
pub struct SessionState {
    pub current: Arc<Mutex<Option<UserSession>>>,
}

struct PasswordRecord {
    username: String,
    password: Option<String>,
}

struct UserProfileRecord {
    display_name: String,
    idno: Option<String>,
    email: Option<String>,
}

#[derive(Debug)]
struct PermissionSnapshot {
    roles: Vec<String>,
    permissions: Vec<String>,
    linked_idno: Option<String>,
}

#[tauri::command]
pub async fn login(
    username: String,
    password: String,
    state: tauri::State<'_, crate::db::DbState>,
    session_state: tauri::State<'_, SessionState>,
) -> Result<UserSession, String> {
    let username = username.trim().to_string();
    let password = password.trim().to_string();

    if username.is_empty() || password.is_empty() {
        return Err("Username and password are required.".to_string());
    }

    let pool = state.get_pool().await?;
    let auth_record = load_password_record(&pool, &username).await?;

    match auth_record.password {
        Some(stored_password) if stored_password == password => {}
        _ => return Err("Invalid username or password.".to_string()),
    }

    let permission_snapshot = load_permission_snapshot(&pool, &username).await?;
    let profile = load_user_profile(&pool, &username, permission_snapshot.linked_idno.as_deref()).await?;
    let primary_role = pick_primary_role(&permission_snapshot.roles);
    let expires_at = (Utc::now() + Duration::hours(8)).timestamp_millis();

    let user = AuthUser {
        username: auth_record.username,
        display_name: profile
            .as_ref()
            .map(|record| record.display_name.clone())
            .unwrap_or_else(|| username.clone()),
        idno: profile.as_ref().and_then(|record| record.idno.clone()),
        email: profile.and_then(|record| record.email),
        primary_role,
        roles: permission_snapshot.roles,
    };

    let session = UserSession {
        user,
        permissions: permission_snapshot.permissions,
        expires_at,
    };

    let mut guard = session_state.current.lock().await;
    *guard = Some(session.clone());

    Ok(session)
}

#[tauri::command]
pub async fn logout(session_state: tauri::State<'_, SessionState>) -> Result<(), String> {
    let mut guard = session_state.current.lock().await;
    *guard = None;
    Ok(())
}

#[tauri::command]
pub async fn get_current_session(
    session_state: tauri::State<'_, SessionState>,
) -> Result<Option<UserSession>, String> {
    let mut guard = session_state.current.lock().await;

    if let Some(session) = guard.as_ref() {
        if session.expires_at > Utc::now().timestamp_millis() {
            return Ok(Some(session.clone()));
        }
    }

    *guard = None;
    Ok(None)
}

pub async fn require_permission(
    session_state: &SessionState,
    required_permission: &str,
) -> Result<UserSession, String> {
    let mut guard = session_state.current.lock().await;

    let Some(session) = guard.as_ref() else {
        return Err("Unauthorized. Please log in.".to_string());
    };

    if session.expires_at <= Utc::now().timestamp_millis() {
        *guard = None;
        return Err("Session expired. Please log in again.".to_string());
    }

    if !session.permissions.iter().any(|permission| permission == required_permission) {
        return Err(format!("Missing permission: {required_permission}"));
    }

    Ok(session.clone())
}

async fn load_password_record(pool: &PgPool, username: &str) -> Result<PasswordRecord, String> {
    let row = sqlx::query(
        r#"
        SELECT "username", "passwrd"
        FROM "public"."tblPassword"
        WHERE "username" = $1
        LIMIT 1
        "#,
    )
    .bind(username)
    .fetch_optional(pool)
    .await
    .map_err(|error| error.to_string())?;

    let Some(row) = row else {
        return Err("Invalid username or password.".to_string());
    };

    Ok(PasswordRecord {
        username: row.try_get("username").unwrap_or_default(),
        password: row.try_get::<Option<String>, _>("passwrd").unwrap_or(None),
    })
}

async fn load_permission_snapshot(pool: &PgPool, username: &str) -> Result<PermissionSnapshot, String> {
    let rows = sqlx::query(
        r#"
        SELECT
          r."RoleName" AS role_name,
          p."PermName" AS perm_name,
          ur."Idno" AS linked_idno
        FROM "public"."tblUserRoles" ur
        INNER JOIN "public"."tblRoles" r
          ON r."RoleID" = ur."RoleID"
        LEFT JOIN "public"."tblRolePermissions" rp
          ON rp."RoleID" = r."RoleID"
        LEFT JOIN "public"."tblPermissions" p
          ON p."PermID" = rp."PermID"
        WHERE ur."username" = $1 OR ur."Idno" = $1
        "#,
    )
    .bind(username)
    .fetch_all(pool)
    .await
    .map_err(|error| error.to_string())?;

    let mut roles = BTreeSet::new();
    let mut permissions = BTreeSet::new();
    let mut linked_idno = None;

    for row in rows {
        if let Ok(role_name) = row.try_get::<String, _>("role_name") {
            roles.insert(role_name);
        }

        if let Ok(Some(permission_name)) = row.try_get::<Option<String>, _>("perm_name") {
            permissions.insert(permission_name);
        }

        if linked_idno.is_none() {
            linked_idno = row.try_get::<Option<String>, _>("linked_idno").unwrap_or(None);
        }
    }

    if roles.is_empty() {
        return Err("No RBAC role is assigned to this account.".to_string());
    }

    Ok(PermissionSnapshot {
        roles: roles.into_iter().collect(),
        permissions: permissions.into_iter().collect(),
        linked_idno,
    })
}

async fn load_user_profile(
    pool: &PgPool,
    username: &str,
    linked_idno: Option<&str>,
) -> Result<Option<UserProfileRecord>, String> {
    let row = sqlx::query(
        r#"
        SELECT "Name", "Idno", "Email"
        FROM "public"."tblUser"
        WHERE "Idno" = $1 OR "Idno" = $2
        LIMIT 1
        "#,
    )
    .bind(username)
    .bind(linked_idno.unwrap_or_default())
    .fetch_optional(pool)
    .await
    .map_err(|error| error.to_string())?;

    Ok(row.map(|record| UserProfileRecord {
        display_name: record
            .try_get::<Option<String>, _>("Name")
            .unwrap_or(None)
            .unwrap_or_else(|| username.to_string()),
        idno: record.try_get::<Option<String>, _>("Idno").unwrap_or(None),
        email: record.try_get::<Option<String>, _>("Email").unwrap_or(None),
    }))
}

fn pick_primary_role(roles: &[String]) -> String {
    if roles.iter().any(|role| role == "Admin") {
        return "Admin".to_string();
    }

    if roles.iter().any(|role| role == "Librarian") {
        return "Librarian".to_string();
    }

    roles.first().cloned().unwrap_or_else(|| "Patron".to_string())
}
