// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Load .env for dev mode. In this repo the file lives one level above
  // `src-tauri`, so explicitly probe that path if the default lookup misses it.
  let _ = dotenvy::dotenv();

  if std::env::var_os("DEV_DATABASE_URL").is_none() {
    let repo_env = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
      .parent()
      .map(|path| path.join(".env"));

    if let Some(path) = repo_env {
      let _ = dotenvy::from_path(path);
    }
  }

  app_lib::run();
}
