use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tauri::AppHandle;
use crate::settings;
use std::sync::Arc;
use tokio::sync::Mutex;

const PHASE11_RBAC_MIGRATION: &str = include_str!("../migrations/phase11_rbac.sql");

pub struct DbState {
    pub pool: Arc<Mutex<Option<PgPool>>>,
}

impl DbState {
    pub async fn get_pool(&self) -> Result<PgPool, String> {
        let lock = self.pool.lock().await;
        lock.clone().ok_or_else(|| "Database not connected. Please complete setup.".to_string())
    }
}

pub async fn init_db(app: &AppHandle) -> Result<PgPool, sqlx::Error> {
    let config = settings::load_config(app);
    let database_url = config.database_url;

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    // Migration: Add last_audit column if it doesn't exist
    sqlx::query(r#"ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS last_audit TIMESTAMP"#)
        .execute(&pool)
        .await?;

    // Migration: Add date_acquired column if it doesn't exist
    sqlx::query(r#"ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS date_acquired TIMESTAMP DEFAULT NOW()"#)
        .execute(&pool)
        .await?;

    // M006-S01-T01: Enable pgvector extension
    sqlx::query("CREATE EXTENSION IF NOT EXISTS vector")
        .execute(&pool)
        .await?;

    // M006-S01-T02: Add embedding column to tblCat
    sqlx::query(r#"ALTER TABLE "public"."tblCat" ADD COLUMN IF NOT EXISTS embedding vector(768)"#)
        .execute(&pool)
        .await?;

    run_phase11_rbac_migration(&pool).await?;

    Ok(pool)
}

async fn run_phase11_rbac_migration(pool: &PgPool) -> Result<(), sqlx::Error> {
    for statement in PHASE11_RBAC_MIGRATION
        .split("\n-- statement-break\n")
        .map(str::trim)
        .filter(|statement| !statement.is_empty())
    {
        sqlx::query(statement).execute(pool).await?;
    }

    Ok(())
}
