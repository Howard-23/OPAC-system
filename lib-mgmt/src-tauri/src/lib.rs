mod models;
mod db;
mod ai;
mod settings;
mod import;
mod auth;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  Manager,
};
use db::DbState;
use ai::AiState;
use auth::SessionState;
use models::{CatalogRecord, CatalogEntry, CreateCatalogRecordInput, Holdings, Patron, Circulation, CirculationStats, OverdueItem, AuditResult, FinancialSummary, AcquisitionRecord, Author, Subject, Reservation};
use chrono::Utc;
use sqlx::{PgPool, Row};

#[tauri::command]
async fn get_catalog_records(
  page: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<CatalogRecord>, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let offset = (page - 1) * 20;
  let rows = sqlx::query(
    r#"
    SELECT 
      c."controlno", 
      c."Title" as title, 
      a."Author" as author, 
      c."Callno" as callno, 
      c."Copyright" as year
    FROM "public"."tblCat" c
    LEFT JOIN "public"."tblAuthor" a ON c."AuthorCode" = a."AuthorCode"
    LIMIT 20 OFFSET $1
    "#
  )
  .bind(offset)
  .fetch_all(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  let records = rows.into_iter().enumerate().map(|(i, row)| CatalogRecord {
    id: i as i32 + 1,
    controlno: row.try_get("controlno").unwrap_or_default(),
    title: row.try_get("title").unwrap_or_default(),
    author: row.try_get::<Option<String>, _>("author").unwrap_or_default().unwrap_or_else(|| "Unknown".to_string()),
    callno: row.try_get("callno").unwrap_or_default(),
    year: row.try_get("year").unwrap_or_default(),
  }).collect();

  Ok(records)
}

#[tauri::command]
async fn get_catalog_count(
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<i64, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let row = sqlx::query(r#"SELECT COUNT(*) as count FROM "public"."tblCat""#)
    .fetch_one(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  
  Ok(row.try_get("count").unwrap_or(0))
}

#[tauri::command]
async fn create_catalog_record(
  payload: CreateCatalogRecordInput,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "catalog:write").await?;
  let pool = state.get_pool().await?;

  let author_code = ensure_author_code(&pool, payload.author.as_deref()).await?;
  let subject1_code = ensure_subject_code(&pool, payload.subject1.as_deref()).await?;
  let subject2_code = ensure_subject_code(&pool, payload.subject2.as_deref()).await?;
  let subject3_code = ensure_subject_code(&pool, payload.subject3.as_deref()).await?;
  let ae_author1_code = ensure_author_code(&pool, payload.addedauthor1.as_deref()).await?;
  let ae_author2_code = ensure_author_code(&pool, payload.addedauthor2.as_deref()).await?;
  let ae_author3_code = ensure_author_code(&pool, payload.addedauthor3.as_deref()).await?;

  sqlx::query(
    r#"
    INSERT INTO "public"."tblCat" (
      "controlno", "Title", "Callno", "AuthorCode", "Edition", "Pagination",
      "Publisher", "Pubplace", "Copyright", "ISBN", "Subject1Code", "Subject2Code",
      "Subject3Code", "SeriesTitle", "AEntryTitle", "AEAuthor1Code", "AEAuthor2Code",
      "AEAuthor3Code", "Material", "xNotes"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17,
      $18, $19, $20
    )
    "#
  )
  .bind(payload.controlno)
  .bind(payload.title)
  .bind(payload.callno)
  .bind(author_code)
  .bind(payload.edition)
  .bind(payload.physdesc)
  .bind(payload.publisher)
  .bind(payload.pubplace)
  .bind(payload.date)
  .bind(payload.isbn)
  .bind(subject1_code)
  .bind(subject2_code)
  .bind(subject3_code)
  .bind(payload.series)
  .bind(payload.addedtitle)
  .bind(if ae_author1_code == 0 { None } else { Some(ae_author1_code) })
  .bind(if ae_author2_code == 0 { None } else { Some(ae_author2_code) })
  .bind(if ae_author3_code == 0 { None } else { Some(ae_author3_code) })
  .bind(payload.material.unwrap_or_else(|| "Book".to_string()))
  .bind(payload.notes)
  .execute(&pool)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn delete_catalog_record(
  controlno: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "catalog:delete").await?;
  sqlx::query(r#"DELETE FROM "public"."tblCat" WHERE "controlno" = $1"#)
    .bind(controlno)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn get_patrons(
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Patron>, String> {
  auth::require_permission(&session, "patrons:read").await?;
  let rows = sqlx::query(
    r#"
    SELECT 
      "Name" as name, 
      "Idno" as idno, 
      "GroupName" as group_name, 
      "Expiry" as expiry, 
      "Dept" as dept, 
      "Phone" as phone, 
      "Email" as email, 
      COALESCE("UnpaidFine", 0) as unpaid_fine
    FROM "public"."tblUser"
    "#
  )
  .fetch_all(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  let patrons = rows.into_iter().map(|row| Patron {
    name: row.try_get::<Option<String>, _>("name").unwrap_or_default().unwrap_or_default(),
    idno: row.try_get::<Option<String>, _>("idno").unwrap_or_default().unwrap_or_default(),
    group_name: row.try_get::<Option<String>, _>("group_name").unwrap_or_default().unwrap_or_default(),
    expiry: None, // Simplified, date parsing can be tricky
    dept: row.try_get("dept").unwrap_or_default(),
    phone: row.try_get("phone").unwrap_or_default(),
    email: row.try_get("email").unwrap_or_default(),
    unpaid_fine: row.try_get("unpaid_fine").unwrap_or(0),
  }).collect();

  Ok(patrons)
}

#[tauri::command]
async fn add_patron(
  patron: Patron,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "patrons:write").await?;
  sqlx::query(
    r#"
    INSERT INTO "public"."tblUser" ("Name", "Idno", "GroupName", "Dept", "Phone", "Email", "UnpaidFine")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    "#
  )
  .bind(patron.name)
  .bind(patron.idno)
  .bind(patron.group_name)
  .bind(patron.dept)
  .bind(patron.phone)
  .bind(patron.email)
  .bind(patron.unpaid_fine)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn update_patron(
  patron: Patron,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "patrons:write").await?;
  sqlx::query(
    r#"
    UPDATE "public"."tblUser" 
    SET "Name" = $1, "GroupName" = $2, "Dept" = $3, "Phone" = $4, "Email" = $5, "UnpaidFine" = $6
    WHERE "Idno" = $7
    "#
  )
  .bind(patron.name)
  .bind(patron.group_name)
  .bind(patron.dept)
  .bind(patron.phone)
  .bind(patron.email)
  .bind(patron.unpaid_fine)
  .bind(patron.idno)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn delete_patron(
  idno: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "patrons:delete").await?;
  sqlx::query(r#"DELETE FROM "public"."tblUser" WHERE "Idno" = $1"#)
    .bind(idno)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn check_out_item(
  accession: String,
  idno: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "circulation:write").await?;
  let now = Utc::now();
  let due = now + chrono::Duration::days(7); // default 7 days
  sqlx::query(
    r#"INSERT INTO "public"."tblRent" ("Accession", "dteBorrow", "dteDue", "Idno") VALUES ($1, $2, $3, $4)"#
  )
  .bind(&accession)
  .bind(now)
  .bind(due)
  .bind(idno)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"UPDATE "public"."tblHoldings" SET "Status" = 'Checked Out' WHERE "Accession" = $1"#)
  .bind(&accession)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
async fn return_item(
  accession: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "circulation:write").await?;
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblRent" SET "dteReturn" = $1 WHERE "Accession" = $2 AND "dteReturn" IS NULL"#)
  .bind(now)
  .bind(&accession)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"UPDATE "public"."tblHoldings" SET "Status" = 'Available' WHERE "Accession" = $1"#)
  .bind(&accession)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn get_active_loans(
  _state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Circulation>, String> {
  auth::require_permission(&session, "circulation:read").await?;
  Ok(vec![]) // simplified for now
}

#[tauri::command]
async fn get_circulation_stats(
  _state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<CirculationStats, String> {
  auth::require_permission(&session, "circulation:read").await?;
  Ok(CirculationStats {
    total_active: 0,
    total_overdue: 0,
    total_fines: 0,
  })
}

#[tauri::command]
async fn get_overdue_items(
  _state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<OverdueItem>, String> {
  auth::require_permission(&session, "circulation:read").await?;
  Ok(vec![])
}

#[tauri::command]
async fn audit_item(
  accession: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<AuditResult, String> {
  auth::require_permission(&session, "inventory:audit").await?;
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblHoldings" SET last_audit = $1, "Status" = CASE WHEN "Status" = 'Missing' THEN 'Available' ELSE "Status" END WHERE "Accession" = $2"#)
  .bind(now)
  .bind(&accession)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(AuditResult {
      accession: accession.clone(),
      title: "Scanned Item".to_string(),
      location: "Library".to_string(),
      status: "Available".to_string(),
      last_audit: Some(now),
  })
}

#[tauri::command]
async fn pay_fine(
  idno: String,
  amount: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "circulation:write").await?;
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblUser" SET "UnpaidFine" = GREATEST(0, COALESCE("UnpaidFine", 0) - $1) WHERE "Idno" = $2"#)
  .bind(amount)
  .bind(&idno)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"INSERT INTO "public"."tblFineCode" ("AmountPay", "Idno", "dtePay", "Cashier") VALUES ($1, $2, $3, 'System')"#)
  .bind(amount)
  .bind(&idno)
  .bind(now)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
async fn get_financial_reports(
  _state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<FinancialSummary, String> {
  auth::require_permission(&session, "reports:read").await?;
  Ok(FinancialSummary {
      total_collected: 0,
      total_outstanding: 0,
      recent_payments: vec![],
  })
}

#[tauri::command]
async fn get_acquisitions_report(
  _start_date: Option<String>,
  _end_date: Option<String>,
  _state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<AcquisitionRecord>, String> {
  auth::require_permission(&session, "reports:read").await?;
  Ok(vec![])
}

#[tauri::command]
async fn get_authors(
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Author>, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let rows = sqlx::query(r#"SELECT "Author", "AuthorCode" FROM "public"."tblAuthor" ORDER BY "Author" ASC"#)
    .fetch_all(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  
  let authors = rows.into_iter().map(|row| Author {
      author: row.try_get("Author").unwrap_or_default(),
      author_code: row.try_get("AuthorCode").unwrap_or(0),
  }).collect();
  Ok(authors)
}

#[tauri::command]
async fn update_author(
  code: i32,
  name: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "authorities:write").await?;
  sqlx::query(r#"UPDATE "public"."tblAuthor" SET "Author" = $1 WHERE "AuthorCode" = $2"#)
    .bind(name)
    .bind(code)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn delete_author(
  code: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "authorities:write").await?;
  sqlx::query(r#"DELETE FROM "public"."tblAuthor" WHERE "AuthorCode" = $1"#)
    .bind(code)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn get_subjects(
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Subject>, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let rows = sqlx::query(r#"SELECT "subject", "SubjectCode" FROM "public"."tblSubject" ORDER BY "subject" ASC"#)
    .fetch_all(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  
  let subjects = rows.into_iter().map(|row| Subject {
      subject: row.try_get("subject").unwrap_or_default(),
      subject_code: row.try_get("SubjectCode").unwrap_or(0),
  }).collect();
  Ok(subjects)
}

#[tauri::command]
async fn update_subject(
  code: i32,
  name: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "authorities:write").await?;
  sqlx::query(r#"UPDATE "public"."tblSubject" SET "subject" = $1 WHERE "SubjectCode" = $2"#)
    .bind(name)
    .bind(code)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn delete_subject(
  code: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "authorities:write").await?;
  sqlx::query(r#"DELETE FROM "public"."tblSubject" WHERE "SubjectCode" = $1"#)
    .bind(code)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn get_reservations(
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Reservation>, String> {
  auth::require_permission(&session, "circulation:read").await?;
  let rows = sqlx::query(
    r#"
    SELECT r."RecNumber", r."Idno", r."Accession",
           r."DateReserve", r."ReserveUntil", r."IsServed",
           u."Name" as patron_name,
           h."controlno"
    FROM "public"."tblReserve" r
    LEFT JOIN "public"."tblUser" u ON r."Idno" = u."Idno"
    LEFT JOIN "public"."tblHoldings" h ON r."Accession" = h."Accession"
    WHERE r."IsServed" = 'N'
    ORDER BY r."DateReserve" ASC
    "#
  )
  .fetch_all(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  let reservations = rows.into_iter().map(|row| Reservation {
    rec_number: row.try_get("RecNumber").unwrap_or(0),
    idno: row.try_get::<Option<String>, _>("Idno").unwrap_or_default().unwrap_or_default(),
    accession: row.try_get::<Option<String>, _>("Accession").unwrap_or_default().unwrap_or_default(),
    date_reserve: row.try_get("DateReserve").unwrap_or_else(|_| Utc::now()),
    reserve_until: row.try_get("ReserveUntil").unwrap_or_else(|_| Utc::now()),
    is_served: row.try_get::<Option<String>, _>("IsServed").unwrap_or_default().unwrap_or_else(|| "N".to_string()),
    patron_name: row.try_get("patron_name").unwrap_or_default(),
    item_title: row.try_get::<Option<String>, _>("controlno").unwrap_or_default(),
  }).collect();

  Ok(reservations)
}

#[tauri::command]
async fn add_reservation(
  idno: String,
  accession: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "reservations:write").await?;
  let now = Utc::now();
  let until = now + chrono::Duration::days(7);

  // Generate next RecNumber
  let max_row = sqlx::query(r#"SELECT COALESCE(MAX("RecNumber"), 0) as max_rec FROM "public"."tblReserve""#)
    .fetch_one(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  let max_rec: i32 = max_row.try_get("max_rec").unwrap_or(0);
  let next_rec = max_rec + 1;

  sqlx::query(
    r#"INSERT INTO "public"."tblReserve" ("RecNumber", "Idno", "Accession", "DateReserve", "ReserveUntil", "IsServed")
       VALUES ($1, $2, $3, $4, $5, 'N')"#
  )
  .bind(next_rec)
  .bind(idno)
  .bind(accession)
  .bind(now)
  .bind(until)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn serve_reservation(
  rec_number: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "reservations:write").await?;
  sqlx::query(r#"UPDATE "public"."tblReserve" SET "IsServed" = 'Y' WHERE "RecNumber" = $1"#)
    .bind(rec_number)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn cancel_reservation(
  rec_number: i32,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "reservations:write").await?;
  sqlx::query(r#"DELETE FROM "public"."tblReserve" WHERE "RecNumber" = $1"#)
    .bind(rec_number)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn get_catalog_entry(
  controlno: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<CatalogEntry, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let row = sqlx::query(
    r#"SELECT * FROM "public"."tblCat" WHERE "controlno" = $1"#
  )
  .bind(controlno)
  .fetch_one(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(CatalogEntry {
    controlno: row.try_get("controlno").unwrap_or_default(),
    title: row.try_get("Title").unwrap_or_default(),
    callno: row.try_get("Callno").ok(),
    author_code: row.try_get("AuthorCode").unwrap_or(0),
    edition: row.try_get("Edition").ok(),
    pagination: row.try_get("Pagination").ok(),
    publisher: row.try_get("Publisher").ok(),
    pubplace: row.try_get("Pubplace").ok(),
    copyright: row.try_get("Copyright").ok(),
    isbn: row.try_get("ISBN").ok(),
    subject1_code: row.try_get("Subject1Code").ok(),
    subject2_code: row.try_get("Subject2Code").ok(),
    subject3_code: row.try_get("Subject3Code").ok(),
    series_title: row.try_get("SeriesTitle").ok(),
    a_entry_title: row.try_get("AEntryTitle").ok(),
    ae_author1_code: row.try_get("AEAuthor1Code").ok(),
    ae_author2_code: row.try_get("AEAuthor2Code").ok(),
    ae_author3_code: row.try_get("AEAuthor3Code").ok(),
    material: row.try_get("Material").ok(),
    x_notes: row.try_get("xNotes").ok(),
  })
}

async fn ensure_author_code(pool: &PgPool, author_name: Option<&str>) -> Result<i32, String> {
  let Some(author_name) = author_name.map(str::trim).filter(|value| !value.is_empty()) else {
    return Ok(0);
  };

  if let Some(existing) = sqlx::query(r#"SELECT "AuthorCode" FROM "public"."tblAuthor" WHERE LOWER("Author") = LOWER($1) LIMIT 1"#)
    .bind(author_name)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())? {
    return Ok(existing.try_get("AuthorCode").unwrap_or(0));
  }

  let next_row = sqlx::query(r#"SELECT COALESCE(MAX("AuthorCode"), 0) + 1 AS next_code FROM "public"."tblAuthor""#)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;
  let next_code: i32 = next_row.try_get("next_code").unwrap_or(0);

  sqlx::query(r#"INSERT INTO "public"."tblAuthor" ("AuthorCode", "Author") VALUES ($1, $2)"#)
    .bind(next_code)
    .bind(author_name)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

  Ok(next_code)
}

async fn ensure_subject_code(pool: &PgPool, subject_name: Option<&str>) -> Result<Option<i32>, String> {
  let Some(subject_name) = subject_name.map(str::trim).filter(|value| !value.is_empty()) else {
    return Ok(None);
  };

  if let Some(existing) = sqlx::query(r#"SELECT "SubjectCode" FROM "public"."tblSubject" WHERE LOWER("subject") = LOWER($1) LIMIT 1"#)
    .bind(subject_name)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())? {
    return Ok(existing.try_get("SubjectCode").ok());
  }

  let next_row = sqlx::query(r#"SELECT COALESCE(MAX("SubjectCode"), 0) + 1 AS next_code FROM "public"."tblSubject""#)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;
  let next_code: i32 = next_row.try_get("next_code").unwrap_or(0);

  sqlx::query(r#"INSERT INTO "public"."tblSubject" ("SubjectCode", "subject") VALUES ($1, $2)"#)
    .bind(next_code)
    .bind(subject_name)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

  Ok(Some(next_code))
}

#[tauri::command]
async fn update_catalog_record(
  entry: CatalogEntry,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "catalog:write").await?;
  sqlx::query(
    r#"
    UPDATE "public"."tblCat"
    SET "Title" = $1, "Callno" = $2, "AuthorCode" = $3, "Edition" = $4, "Pagination" = $5,
        "Publisher" = $6, "Pubplace" = $7, "Copyright" = $8, "ISBN" = $9,
        "Subject1Code" = $10, "Subject2Code" = $11, "Subject3Code" = $12,
        "SeriesTitle" = $13, "AEntryTitle" = $14, "AEAuthor1Code" = $15,
        "AEAuthor2Code" = $16, "AEAuthor3Code" = $17, "Material" = $18, "xNotes" = $19
    WHERE "controlno" = $20
    "#
  )
  .bind(entry.title)
  .bind(entry.callno)
  .bind(entry.author_code)
  .bind(entry.edition)
  .bind(entry.pagination)
  .bind(entry.publisher)
  .bind(entry.pubplace)
  .bind(entry.copyright)
  .bind(entry.isbn)
  .bind(entry.subject1_code)
  .bind(entry.subject2_code)
  .bind(entry.subject3_code)
  .bind(entry.series_title)
  .bind(entry.a_entry_title)
  .bind(entry.ae_author1_code)
  .bind(entry.ae_author2_code)
  .bind(entry.ae_author3_code)
  .bind(entry.material)
  .bind(entry.x_notes)
  .bind(entry.controlno)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn get_holdings(
  controlno: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<Vec<Holdings>, String> {
  auth::require_permission(&session, "catalog:read").await?;
  let rows = sqlx::query(
    r#"SELECT * FROM "public"."tblHoldings" WHERE "controlno" = $1"#
  )
  .bind(controlno)
  .fetch_all(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  let holdings = rows.into_iter().map(|row| Holdings {
    controlno: row.try_get("controlno").unwrap_or_default(),
    accession: row.try_get("Accession").unwrap_or_default(),
    copy: row.try_get("Copy").unwrap_or_default(),
    location: row.try_get("Location").unwrap_or_default(),
    due_date: row.try_get("DueDate").ok(), // Note: column name from schema
    status: row.try_get("Status").unwrap_or_else(|_| "Available".to_string()),
    last_audit: row.try_get("last_audit").ok(),
  }).collect();

  Ok(holdings)
}

#[tauri::command]
async fn add_holding(
  holding: Holdings,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "catalog:write").await?;
  sqlx::query(
    r#"
    INSERT INTO "public"."tblHoldings" ("controlno", "Accession", "Copy", "Location", "Status")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT ("Accession") DO UPDATE 
    SET "Location" = EXCLUDED."Location", "Copy" = EXCLUDED."Copy", "Status" = EXCLUDED."Status"
    "#
  )
  .bind(holding.controlno)
  .bind(holding.accession)
  .bind(holding.copy)
  .bind(holding.location)
  .bind(holding.status)
  .execute(&state.get_pool().await?)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn delete_holding(
  accession: String,
  state: tauri::State<'_, DbState>,
  session: tauri::State<'_, SessionState>,
) -> Result<(), String> {
  auth::require_permission(&session, "catalog:delete").await?;
  sqlx::query(r#"DELETE FROM "public"."tblHoldings" WHERE "Accession" = $1"#)
    .bind(accession)
    .execute(&state.get_pool().await?)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn check_db_connection(app: tauri::AppHandle, state: tauri::State<'_, DbState>) -> Result<String, String> {
  // Try existing pool first
  {
    let lock = state.pool.lock().await;
    if let Some(pool) = &*lock {
      if let Ok(_) = sqlx::query("SELECT 1").fetch_one(pool).await {
        return Ok("Connected to PostgreSQL".to_string());
      }
    }
  }

  // If failed or missing, try re-initializing
  match db::init_db(&app).await {
    Ok(pool) => {
      let mut lock = state.pool.lock().await;
      *lock = Some(pool);
      Ok("Connected to PostgreSQL (Re-initialized)".to_string())
    }
    Err(e) => Err(format!("Database connection failed: {}", e)),
  }
}

#[tauri::command]
async fn maximize_window(window: tauri::Window) {
  window.set_resizable(true).unwrap();
  window.maximize().unwrap();
}

#[tauri::command]
async fn reset_window_size(window: tauri::Window) {
  window.unmaximize().unwrap();
  window.set_resizable(false).unwrap();
  window.set_size(tauri::LogicalSize::new(400.0, 500.0)).unwrap();
  window.center().unwrap();
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
  app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AiState::default())
    .manage(SessionState::default())
    .plugin(tauri_plugin_log::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      auth::login,
      auth::logout,
      auth::get_current_session,
      create_catalog_record,
      get_catalog_records,
      get_catalog_count,
      delete_catalog_record,
      get_patrons,
      add_patron,
      update_patron,
      delete_patron,
      check_out_item,
      get_active_loans,
      return_item,
      get_circulation_stats,
      get_overdue_items,
      audit_item,
      pay_fine,
      get_financial_reports,
      get_acquisitions_report,
      get_authors,
      update_author,
      delete_author,
      get_subjects,
      update_subject,
      delete_subject,
      get_reservations,
      add_reservation,
      serve_reservation,
      cancel_reservation,
      get_catalog_entry,
      update_catalog_record,
      get_holdings,
      add_holding,
      delete_holding,
      check_db_connection,
      maximize_window,
      reset_window_size,
      quit_app,
      ai::search_catalog_semantic,
      ai::chat_with_ai,
      ai::check_ollama_model,
      ai::pull_ollama_model,
      settings::get_db_config,
      settings::save_db_config,
      settings::upload_logo,
      settings::process_logo,
      settings::get_logo_path,
      settings::export_settings,
      settings::import_settings,
      import::import_mdb_database
    ])
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      use tauri_plugin_shell::ShellExt;
      let handle = app.handle().clone();

      // Spawn Ollama Sidecar
      if let Ok(command) = app.shell().sidecar("ollama") {
        tauri::async_runtime::spawn(async move {
          let _ = command.spawn();
        });
      }

      // Start PostgreSQL Service
      if let Ok(command) = app.shell().sidecar("pg_ctl") {
        let command = command.args(["start", "-D", "pgsql/data"]);
        tauri::async_runtime::spawn(async move {
          let _ = command.spawn();
        });
      }

      let pool_arc = std::sync::Arc::new(tokio::sync::Mutex::new(None));
      let pool_for_setup = pool_arc.clone();

      tauri::async_runtime::spawn(async move {
        if let Ok(pool) = db::init_db(&handle).await {
          let mut lock = pool_for_setup.lock().await;
          *lock = Some(pool);
        } else {
          eprintln!("Initial database connection failed. App will start in Setup Mode.");
        }
      });

      app.manage(DbState { pool: pool_arc });

      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let show_i = MenuItem::with_id(app, "show", "Show infoLib", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

      let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          "show" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
          _ => {}
        })
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
