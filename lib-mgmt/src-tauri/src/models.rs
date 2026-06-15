use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Author {
    pub author: String,
    pub author_code: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subject {
    pub subject: String,
    pub subject_code: i32,
}

#[allow(dead_code)]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateCatalogRecordInput {
    pub controlno: String,
    pub title: String,
    pub author: Option<String>,
    pub isbn: Option<String>,
    pub callno: Option<String>,
    pub publisher: Option<String>,
    pub pubplace: Option<String>,
    pub date: Option<String>,
    pub physdesc: Option<String>,
    pub edition: Option<String>,
    pub subject1: Option<String>,
    pub subject2: Option<String>,
    pub subject3: Option<String>,
    pub addedtitle: Option<String>,
    pub series: Option<String>,
    pub addedauthor1: Option<String>,
    pub addedauthor2: Option<String>,
    pub addedauthor3: Option<String>,
    pub notes: Option<String>,
    pub material: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Holdings {
    pub controlno: String,
    pub accession: String,
    pub copy: String,
    pub location: String,
    pub due_date: Option<chrono::DateTime<chrono::Utc>>,
    pub status: String,
    pub last_audit: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogRecord {
    pub id: i32,
    pub controlno: String,
    pub title: String,
    pub author: String,
    pub callno: Option<String>,
    pub year: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Patron {
    pub name: String,
    pub idno: String,
    pub group_name: String,
    pub expiry: Option<chrono::DateTime<chrono::Utc>>,
    pub dept: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub unpaid_fine: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Circulation {
    pub accession: String,
    pub dte_borrow: chrono::DateTime<chrono::Utc>,
    pub dte_due: chrono::DateTime<chrono::Utc>,
    pub dte_return: Option<chrono::DateTime<chrono::Utc>>,
    pub fine_code: Option<i32>,
    pub idno: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CirculationStats {
    pub total_active: i64,
    pub total_overdue: i64,
    pub total_fines: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OverdueItem {
    pub accession: String,
    pub title: String,
    pub patron_name: String,
    pub idno: String,
    pub due_date: chrono::DateTime<chrono::Utc>,
    pub days_overdue: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditResult {
    pub accession: String,
    pub title: String,
    pub location: String,
    pub status: String,
    pub last_audit: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FinancialSummary {
    pub total_collected: i32,
    pub total_outstanding: i32,
    pub recent_payments: Vec<PaymentRecord>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentRecord {
    pub amount_pay: i32,
    pub idno: String,
    pub dte_pay: chrono::DateTime<chrono::Utc>,
    pub cashier: String,
    pub patron_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AcquisitionRecord {
    pub accession: String,
    pub title: String,
    pub author: String,
    pub date_acquired: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reservation {
    pub rec_number: i32,
    pub idno: String,
    pub accession: String,
    pub date_reserve: chrono::DateTime<chrono::Utc>,
    pub reserve_until: chrono::DateTime<chrono::Utc>,
    pub is_served: String,
    pub patron_name: Option<String>,
    pub item_title: Option<String>,
}
