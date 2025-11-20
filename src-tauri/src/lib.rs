use font_kit::source::SystemSource;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_fonts() -> Result<Vec<String>, String> {
  let source = SystemSource::new();
  let families = source.all_families().map_err(|e| e.to_string())?;

  // Convert to Vec and sort alphabetically
  let mut result: Vec<String> = families.into_iter().collect();
  result.sort();

  Ok(result)
}

#[tauri::command]
fn open_devtools(window: tauri::WebviewWindow) {
  window.open_devtools();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_window_state::Builder::new().build())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_process::init())
    .invoke_handler(tauri::generate_handler![
      greet,
      get_system_fonts,
      open_devtools
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
