# Library Management System - Database Schema Documentation

## Overview
This document describes the database schema for the Library Management System, based on the legacy PostgreSQL database (`glDB.postgres.sql`). The new application will maintain parity with this schema while modernizing the structure for better performance and maintainability.

## Technology Stack

### Database
- **Database:** PostgreSQL 14+
- **Connection:** Native Rust PostgreSQL connection (tokio-postgres or sqlx)
- **ORM:** None (native SQL queries)
- **Sync:** Firebase (via cron job)

### Backend
- **Language:** Rust
- **Framework:** Tauri v2
- **Database Driver:** tokio-postgres or sqlx
- **Authentication:** JWT (generated in Rust)

### Frontend
- **Framework:** React 18+ with TypeScript
- **Desktop Framework:** Tauri v2
- **Communication:** Native Tauri invoke commands (no HTTP/Axios)

## Core Tables

### 1. tblAuthor
**Purpose:** Stores author information for catalog entries.

| Column | Type | Description |
|--------|------|-------------|
| Author | TEXT | Full name of the author |
| AuthorCode | INTEGER | Primary key, unique author identifier |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Author {
    pub author: String,
    pub author_code: i32,
}
```

**Notes:**
- AuthorCode is used as a foreign key in tblCat
- Supports multiple authors per catalog entry (AEAuthor1Code, AEAuthor2Code, AEAuthor3Code)

### 2. tblCat (Catalog)
**Purpose:** Main catalog table storing bibliographic information.

| Column | Type | Description |
|--------|------|-------------|
| controlno | TEXT | Primary key, unique control number |
| Title | TEXT | Title of the material |
| Callno | TEXT | Call number for classification |
| AuthorCode | INTEGER | Foreign key to tblAuthor |
| Edition | TEXT | Edition information |
| Pagination | TEXT | Number of pages |
| Publisher | TEXT | Publisher name |
| Pubplace | TEXT | Place of publication |
| Copyright | TEXT | Copyright year |
| ISBN | TEXT | ISBN number |
| Subject1Code | INTEGER | Foreign key to tblSubject (primary subject) |
| Subject2Code | INTEGER | Foreign key to tblSubject (secondary subject) |
| Subject3Code | INTEGER | Foreign key to tblSubject (tertiary subject) |
| SeriesTitle | TEXT | Series title if applicable |
| AEntryTitle | TEXT | Analytic entry title |
| AEAuthor1Code | INTEGER | Foreign key to tblAuthor (analytic entry author 1) |
| AEAuthor2Code | INTEGER | Foreign key to tblAuthor (analytic entry author 2) |
| AEAuthor3Code | INTEGER | Foreign key to tblAuthor (analytic entry author 3) |
| Material | TEXT | Material type |
| xNotes | TEXT | Additional notes |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogEntry {
    pub controlno: String,
    pub title: String,
    pub callno: Option<String>,
    pub author_code: i32,
    pub edition: Option<String>,
    pub pagination: Option<String>,
    pub publisher: Option<String>,
    pub pubplace: Option<String>,
    pub copyright: Option<String>,
    pub isbn: Option<String>,
    pub subject1_code: Option<i32>,
    pub subject2_code: Option<i32>,
    pub subject3_code: Option<i32>,
    pub series_title: Option<String>,
    pub a_entry_title: Option<String>,
    pub ae_author1_code: Option<i32>,
    pub ae_author2_code: Option<i32>,
    pub ae_author3_code: Option<i32>,
    pub material: Option<String>,
    pub x_notes: Option<String>,
}
```

**Notes:**
- controlno is the primary identifier for catalog entries
- Supports up to 3 subjects per entry
- Supports analytic entries with separate authors

### 3. tblHoldings
**Purpose:** Tracks physical copies of catalog items.

| Column | Type | Description |
|--------|------|-------------|
| controlno | TEXT | Foreign key to tblCat |
| Accession | TEXT | Accession number (unique per copy) |
| Copy | TEXT | Copy number |
| Location | TEXT | Physical location |
| DueDate | TIMESTAMP | Due date if checked out |
| Status | TEXT | Current status (Available, Checked Out, etc.) |
| last_audit | TIMESTAMP | Last time the item was physically verified |
| date_acquired | TIMESTAMP | Date the item was added to the collection |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Holdings {
    pub controlno: String,
    pub accession: String,
    pub copy: String,
    pub location: String,
    pub due_date: Option<DateTime<Utc>>,
    pub status: String,
    pub last_audit: Option<DateTime<Utc>>,
}
```

### 4. tblUser
**Purpose:** Stores patron/user information.

| Column | Type | Description |
|--------|------|-------------|
| Name | TEXT | Full name of the user |
| Idno | TEXT | Unique user ID number |
| GroupName | TEXT | User group (links to tblGroup) |
| Expiry | TIMESTAMP | Account expiration date |
| Dept | TEXT | Department |
| Phone | TEXT | Phone number |
| Email | TEXT | Email address |
| UnpaidFine | INTEGER | Outstanding fine amount |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub name: String,
    pub idno: String,
    pub group_name: String,
    pub expiry: Option<DateTime<Utc>>,
    pub dept: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub unpaid_fine: i32,
}
```

### 5. tblGroup
**Purpose:** Defines user groups and their privileges.

| Column | Type | Description |
|--------|------|-------------|
| Groupname | TEXT | Group name |
| GrpFine | INTEGER | Fine rate per day |
| GrpDuration | INTEGER | Loan duration in days |
| GrpLimit | INTEGER | Maximum items allowed |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserGroup {
    pub groupname: String,
    pub grp_fine: i32,
    pub grp_duration: i32,
    pub grp_limit: i32,
}
```

### 6. tblRent (Circulation)
**Purpose:** Tracks borrowing/rental transactions.

| Column | Type | Description |
|--------|------|-------------|
| Accession | TEXT | Foreign key to tblHoldings |
| dteBorrow | TIMESTAMP | Date borrowed |
| dteDue | TIMESTAMP | Due date |
| dteReturn | TIMESTAMP | Date returned |
| FineCode | INTEGER | Foreign key to tblFineCode |
| Idno | TEXT | Foreign key to tblUser |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Circulation {
    pub accession: String,
    pub dte_borrow: DateTime<Utc>,
    pub dte_due: DateTime<Utc>,
    pub dte_return: Option<DateTime<Utc>>,
    pub fine_code: Option<i32>,
    pub idno: String,
}
```

### 7. tblFineCode
**Purpose:** Records fine payments.

| Column | Type | Description |
|--------|------|-------------|
| AmountPay | INTEGER | Amount paid |
| Idno | TEXT | Foreign key to tblUser |
| dtePay | TIMESTAMP | Payment date |
| Cashier | TEXT | Cashier who processed payment |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Fine {
    pub amount_pay: i32,
    pub idno: String,
    pub dte_pay: DateTime<Utc>,
    pub cashier: String,
}
```

### 8. tblReserve
**Purpose:** Manages item reservations.

| Column | Type | Description |
|--------|------|-------------|
| RecNumber | INTEGER | Primary key, auto-increment |
| Idno | TEXT | Foreign key to tblUser |
| Accession | TEXT | Foreign key to tblHoldings |
| DateReserve | TIMESTAMP | Reservation date |
| ReserveUntil | TIMESTAMP | Reservation valid until |
| IsServed | TEXT | Reservation status |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reservation {
    pub rec_number: i32,
    pub idno: String,
    pub accession: String,
    pub date_reserve: DateTime<Utc>,
    pub reserve_until: DateTime<Utc>,
    pub is_served: String,
}
```

### 9. tblSubject
**Purpose:** Subject classification system.

| Column | Type | Description |
|--------|------|-------------|
| subject | TEXT | Subject name |
| SubjectCode | INTEGER | Primary key, unique subject code |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subject {
    pub subject: String,
    pub subject_code: i32,
}
```

### 10. tblLocation
**Purpose:** Defines library locations.

| Column | Type | Description |
|--------|------|-------------|
| Location | TEXT | Location name |
| LocCode | INTEGER | Location code |
| LocationCode | INTEGER | Alternative location code |
| Allowed | INTEGER | Access permissions |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Location {
    pub location: String,
    pub loc_code: i32,
    pub location_code: i32,
    pub allowed: i32,
}
```

### 11. tblMaterial
**Purpose:** Defines material types.

| Column | Type | Description |
|--------|------|-------------|
| Material | TEXT | Material type name |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub material: String,
}
```

### 12. tblPassword
**Purpose:** User authentication credentials and identities.

| Column | Type | Description |
|--------|------|-------------|
| username | TEXT | Username |
| passwrd | TEXT | Password (hashed) - nullable for social users |
| usergroup | TEXT | User group for permissions |
| auth_provider | TEXT | Authentication provider (e.g., 'local', 'google') |
| social_id | TEXT | Unique ID from social provider (nullable) |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Password {
    pub username: String,
    pub passwrd: Option<String>,
    pub usergroup: String,
    pub auth_provider: String,
    pub social_id: Option<String>,
}
```

### 13. tblMessage
**Purpose:** OPAC/system messages.

| Column | Type | Description |
|--------|------|-------------|
| OpacMsg | TEXT | Message text |

**Rust Model:**
```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub opac_msg: String,
}
```

## Relationships

```
tblAuthor (1) ----< (N) tblCat
tblSubject (1) ----< (N) tblCat
tblCat (1) ----< (N) tblHoldings
tblHoldings (1) ----< (N) tblRent
tblUser (1) ----< (N) tblRent
tblGroup (1) ----< (N) tblUser
tblUser (1) ----< (N) tblReserve
tblHoldings (1) ----< (N) tblReserve
tblUser (1) ----< (N) tblFineCode
```

## Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_cat_author ON tblCat(AuthorCode);
CREATE INDEX idx_cat_subject1 ON tblCat(Subject1Code);
CREATE INDEX idx_cat_subject2 ON tblCat(Subject2Code);
CREATE INDEX idx_cat_subject3 ON tblCat(Subject3Code);
CREATE INDEX idx_cat_title ON tblCat(Title);
CREATE INDEX idx_holdings_accession ON tblHoldings(Accession);
CREATE INDEX idx_holdings_controlno ON tblHoldings(controlno);
CREATE INDEX idx_rent_accession ON tblRent(Accession);
CREATE INDEX idx_rent_idno ON tblRent(Idno);
CREATE INDEX idx_user_idno ON tblUser(Idno);
CREATE INDEX idx_user_group ON tblUser(GroupName);
CREATE INDEX idx_reserve_accession ON tblReserve(Accession);
CREATE INDEX idx_reserve_idno ON tblReserve(Idno);
```

## Data Migration Notes

1. **Author Codes:** Preserve existing AuthorCode values for data continuity
2. **Control Numbers:** Maintain existing controlno format
3. **Subject Codes:** Preserve existing classification system
4. **User Groups:** Map existing groups to new permission system

## Rust Database Connection

### Using tokio-postgres

```rust
// src-tauri/src/database/connection.rs
use tokio_postgres::{NoTls, Row, PgConnection};
use tokio_postgres::config::Host;
use tokio_postgres::config::ConnectionParams;

pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPool::new(database_url).await?;
        Ok(Database { pool })
    }

    pub async fn get_connection(&self) -> Result<PgConnection, sqlx::Error> {
        self.pool.acquire().await
    }
}

// Example usage
let db = Database::new("postgresql://localhost:5432/lib_mgmt").await?;
let conn = db.get_connection().await?;
```

### Using sqlx

```rust
// src-tauri/src/database/connection.rs
use sqlx::{Pool, Postgres, Connection, Row};
use sqlx::postgres::PgPoolOptions;

pub struct Database {
    pool: Pool<Postgres>,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        Ok(Database { pool })
    }

    pub async fn get_connection(&self) -> Result<Connection, sqlx::Error> {
        self.pool.acquire().await
    }
}
```

## Firebase Sync Architecture

### Sync Strategy

```rust
// src-tauri/src/firebase/sync.rs
use firebase_rs::auth::User as FirebaseUser;
use firebase_rs::auth::Credential;
use firebase_rs::auth::Auth;

pub struct FirebaseSync {
    auth: Auth,
}

impl FirebaseSync {
    pub fn new() -> Self {
        let auth = Auth::new();
        Self { auth }
    }

    pub async fn sync_to_firebase(&self, users: Vec<User>) -> Result<(), Box<dyn std::error::Error>> {
        // Sync users to Firebase Authentication
        for user in users {
            let user_record = self.auth.create_user(&user.email, &user.password).await?;
            // Update user record with Firebase UID
        }
        Ok(())
    }

    pub async fn sync_from_firebase(&self) -> Result<Vec<User>, Box<dyn std::error::Error>> {
        // Fetch users from Firebase
        let users = self.auth.list_users().await?;
        Ok(users.users)
    }
}
```

### Cron Job for Auto Sync

```rust
// src-tauri/src/sync/cron.rs
use tokio::time;
use crate::firebase::sync::FirebaseSync;

pub async fn run_sync_job() {
    let sync = FirebaseSync::new();
    
    // Run sync every 5 minutes
    loop {
        match sync.sync_from_firebase().await {
            Ok(users) => {
                println!("Synced {} users from Firebase", users.len());
            }
            Err(e) => {
                eprintln!("Sync failed: {}", e);
            }
        }
        
        time::sleep(tokio::time::Duration::from_secs(300)).await;
    }
}
```

## Security Considerations

### Password Hashing

```rust
use bcrypt::{hash, verify, DEFAULT_COST};

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}
```

### SQL Injection Prevention

```rust
// Use parameterized queries
let result = sqlx::query!(
    "SELECT * FROM tblCat WHERE title = $1"
)
    .bind(&title)
    .fetch_all(&mut conn)
    .await?;
```

### Connection Pooling

```rust
// Configure connection pool
let pool = PgPoolOptions::new()
    .max_connections(10)
    .min_connections(2)
    .acquire_timeout(Duration::from_secs(30))
    .idle_timeout(Duration::from_secs(600))
    .max_lifetime(Duration::from_secs(3600));
```

## Performance Optimization

### Query Optimization

```rust
// Use prepared statements
let stmt = conn.prepare(
    "SELECT * FROM tblCat WHERE AuthorCode = $1"
).await?;

let rows = stmt.query(&[author_code])
    .fetch_all(&mut conn)
    .await?;
```

### Connection Management

```rust
// Use connection pool efficiently
async fn get_author_by_code(code: i32) -> Result<Option<Author>, sqlx::Error> {
    let mut conn = db.get_connection().await?;
    
    let author = sqlx::query_as!(
        "SELECT * FROM tblAuthor WHERE AuthorCode = $1"
    )
    .bind(&code)
    .fetch_optional(&mut conn)
    .await?;
    
    Ok(author)
}
```

## Data Types Mapping

### PostgreSQL to Rust Type Mapping

| PostgreSQL | Rust | Notes |
|-----------|------|-------|
| TEXT | String | Text fields |
| INTEGER | i32 | Integer fields |
| TIMESTAMP | DateTime<Utc> | Timestamp fields |
| BOOLEAN | bool | Boolean fields |
| DATE | chrono::NaiveDate | Date fields (if needed) |

### JSON Serialization

```rust
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CatalogEntry {
    pub controlno: String,
    pub title: String,
    // ... other fields
}

// For API responses
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
    pub error: Option<String>,
}
```

## Migration Strategy

### Initial Setup

```sql
-- Create database
CREATE DATABASE lib_mgmt;

-- Connect to database
\c lib_mgmt

-- Run legacy schema
\i docs/legacy-database/glDB.postgres.sql
```

### Data Import

```rust
// Import legacy data
async fn import_legacy_data(conn: &mut PgConnection) -> Result<(), sqlx::Error> {
    // Read from legacy database
    let legacy_conn = PgPool::new("postgresql://localhost:5432/legacy_db").await?;
    
    // Copy data to new database
    // ... migration logic
}
```

## Backup and Recovery

### Backup Strategy

```bash
# PostgreSQL backup
pg_dump -h localhost -U lib_mgmt > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U lib_mgmt < backup_20240101.sql
```

### Point-in-Time Recovery

```sql
-- Configure WAL
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_size = '1GB';
```

## Monitoring

### Connection Monitoring

```rust
// Monitor connection pool
async fn monitor_pool() {
    let pool = db.pool;
    // Log pool statistics
}
```

### Query Performance

```rust
// Log slow queries
async fn log_slow_queries(threshold_ms: u64) {
    // Log queries exceeding threshold
}
```
