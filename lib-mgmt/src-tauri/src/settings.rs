use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use image::{GenericImageView, ImageFormat};

use crate::auth::{self, SessionState};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessOptions {
    pub rotate: i32,
    pub flip_h: bool,
    pub flip_v: bool,
    pub auto_crop: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub app_logo: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            database_url: "postgres://postgres:password@localhost:5432/infolib".to_string(),
            app_logo: None,
        }
    }
}

pub fn get_settings_path(app: &AppHandle) -> PathBuf {
    let config_dir = app.path().app_config_dir().expect("failed to get config dir");
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).expect("failed to create config dir");
    }
    config_dir.join("db_config.json")
}

pub fn load_config(app: &AppHandle) -> AppConfig {
    // DEV MODE BYPASS: If DEV_DATABASE_URL is set, use it directly
    // This allows `bunx tauri dev` to work without NSIS installer setup
    if let Ok(dev_url) = std::env::var("DEV_DATABASE_URL") {
        println!("[Settings] DEV MODE: Using DEV_DATABASE_URL bypass");
        let mut config = AppConfig::default();
        config.database_url = dev_url;

        // Still load logo from config file if it exists
        let path = get_settings_path(app);
        if path.exists() {
            if let Ok(data) = fs::read_to_string(&path) {
                if let Ok(file_config) = serde_json::from_str::<AppConfig>(&data) {
                    config.app_logo = file_config.app_logo;
                }
            }
        }
        return config;
    }

    let path = get_settings_path(app);
    if path.exists() {
        let data = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = get_settings_path(app);
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_db_config(app: AppHandle) -> Result<AppConfig, String> {
    Ok(load_config(&app))
}

#[tauri::command]
pub fn save_db_config(
    app: AppHandle,
    config: AppConfig,
) -> Result<(), String> {
    save_config(&app, &config)
}

#[tauri::command]
pub async fn upload_logo(
    app: AppHandle,
    source_path: String,
    session: tauri::State<'_, SessionState>,
) -> Result<String, String> {
    auth::require_permission(&session, "settings:write").await?;
    let config_dir = app.path().app_config_dir().expect("failed to get config dir");
    let ext = std::path::Path::new(&source_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png");
    
    let target_filename = format!("logo.{}", ext);
    let target_path = config_dir.join(&target_filename);
    
    fs::copy(&source_path, &target_path).map_err(|e| e.to_string())?;
    
    let mut config = load_config(&app);
    config.app_logo = Some(target_filename.clone());
    save_config(&app, &config)?;
    
    Ok(target_filename)
}

#[tauri::command]
pub async fn process_logo(
    app: AppHandle,
    source_path: String,
    options: ProcessOptions,
    session: tauri::State<'_, SessionState>,
) -> Result<String, String> {
    auth::require_permission(&session, "settings:write").await?;
    let mut img = image::open(&source_path).map_err(|e| e.to_string())?;

    if options.auto_crop {
        let (w, h) = img.dimensions();
        let size = w.min(h);
        let x = (w - size) / 2;
        let y = (h - size) / 2;
        img = img.crop_imm(x, y, size, size);
    }

    match options.rotate {
        90 => img = img.rotate90(),
        180 => img = img.rotate180(),
        270 => img = img.rotate270(),
        _ => {}
    }

    if options.flip_h { img = img.fliph(); }
    if options.flip_v { img = img.flipv(); }

    if img.width() > 512 || img.height() > 512 {
        img = img.resize(512, 512, image::imageops::FilterType::Lanczos3);
    }

    let config_dir = app.path().app_config_dir().expect("failed to get config dir");

    // Delete old logo to prevent file accumulation
    let old_config = load_config(&app);
    if let Some(old_logo) = &old_config.app_logo {
        let old_path = config_dir.join(old_logo);
        let _ = fs::remove_file(&old_path); // best-effort, ignore if locked
    }

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let target_filename = format!("logo_{}.webp", timestamp);
    let target_path = config_dir.join(&target_filename);

    img.save_with_format(&target_path, ImageFormat::WebP).map_err(|e| e.to_string())?;

    let mut config = load_config(&app);
    config.app_logo = Some(target_filename.clone());
    save_config(&app, &config)?;

    Ok(target_filename)
}

#[tauri::command]
pub fn get_logo_path(app: AppHandle) -> Result<Option<String>, String> {
    let config = load_config(&app);
    if let Some(logo) = config.app_logo {
        let path = app.path().app_config_dir().expect("failed to get config dir").join(logo);
        Ok(Some(path.to_string_lossy().to_string()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn export_settings(
    app: AppHandle,
    export_path: String,
) -> Result<(), String> {
    let config = load_config(&app);
    let data = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(export_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn import_settings(
    app: AppHandle,
    import_path: String,
) -> Result<(), String> {
    let data = fs::read_to_string(import_path).map_err(|e| e.to_string())?;
    let config: AppConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    save_config(&app, &config)?;
    Ok(())
}
