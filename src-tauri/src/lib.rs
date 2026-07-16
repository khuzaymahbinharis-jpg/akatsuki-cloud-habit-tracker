use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::time::Duration;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_wallpaper::{AttachRequest, WallpaperExt};

const PANEL_LABEL: &str = "habit-panel";
const CLOUD_PREFIX: &str = "cloud-";
const BASE_CLOUD_WIDTH: f64 = 200.0;
const BASE_CLOUD_HEIGHT: f64 = 120.0;
const PANEL_MARGIN: i32 = 48;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudWindowSpec {
  pub id: String,
  pub x: f64,
  pub y: f64,
  pub variant: i32,
  pub scale: f64,
  pub rotation: f64,
  pub opacity: Option<f64>,
  pub flipped: Option<bool>,
}

fn cloud_label(id: &str) -> String {
  format!("{CLOUD_PREFIX}{id}")
}

fn primary_work_area(app: &AppHandle) -> Option<(i32, i32, u32, u32)> {
  let monitor = app.primary_monitor().ok().flatten()?;
  let pos = monitor.position();
  let size = monitor.size();
  Some((pos.x, pos.y, size.width, size.height))
}

fn attach_window(app: &AppHandle, label: &str) {
  if let Err(err) = app.wallpaper().attach(AttachRequest::new(label)) {
    eprintln!("Failed to attach window '{label}' to desktop: {err}");
  }
}

fn attach_cloud_widgets(app: &AppHandle) {
  for (label, _) in app.webview_windows() {
    if label.starts_with(CLOUD_PREFIX) {
      attach_window(app, &label);
    }
  }
}

fn position_panel(app: &AppHandle) {
  let Some(panel) = app.get_webview_window(PANEL_LABEL) else {
    return;
  };
  let Some((mx, my, _mw, mh)) = primary_work_area(app) else {
    return;
  };
  let Ok(size) = panel.outer_size() else {
    return;
  };
  let x = mx + PANEL_MARGIN;
  let y = my + mh as i32 - size.height as i32 - PANEL_MARGIN;
  let _ = panel.set_position(PhysicalPosition::new(x, y.max(my + PANEL_MARGIN)));
}

fn cloud_window_geometry(
  app: &AppHandle,
  cloud: &CloudWindowSpec,
) -> Option<(i32, i32, u32, u32, f64)> {
  let monitor = app.primary_monitor().ok().flatten()?;
  let pos = monitor.position();
  let size = monitor.size();
  let scale_factor = monitor.scale_factor();
  let (mx, my, mw, mh) = (pos.x, pos.y, size.width, size.height);

  let scale = cloud.scale.clamp(0.7, 1.4);
  let width = (BASE_CLOUD_WIDTH * scale * scale_factor).round().max(120.0) as u32;
  let height = (BASE_CLOUD_HEIGHT * scale * scale_factor).round().max(72.0) as u32;
  let cx = mx as f64 + (mw as f64) * (cloud.x / 100.0);
  let cy = my as f64 + (mh as f64) * (cloud.y / 100.0);
  let x = (cx - width as f64 / 2.0).round() as i32;
  let y = (cy - height as f64 / 2.0).round() as i32;
  Some((x, y, width, height, scale_factor))
}

fn cloud_init_script(cloud: &CloudWindowSpec) -> Result<String, String> {
  let json = serde_json::to_string(cloud).map_err(|e| e.to_string())?;
  // Inject before page scripts so React can read window.__CLOUD_DATA__ on boot.
  Ok(format!("Object.defineProperty(window, '__CLOUD_DATA__', {{ value: {json}, writable: false }});"))
}

fn create_or_update_cloud(app: &AppHandle, cloud: &CloudWindowSpec) -> Result<(), String> {
  let label = cloud_label(&cloud.id);
  let Some((x, y, width, height, scale_factor)) = cloud_window_geometry(app, cloud) else {
    return Err("No primary monitor available".into());
  };
  let logical_w = width as f64 / scale_factor;
  let logical_h = height as f64 / scale_factor;
  let logical_x = x as f64 / scale_factor;
  let logical_y = y as f64 / scale_factor;

  if let Some(existing) = app.get_webview_window(&label) {
    let _ = existing.set_position(PhysicalPosition::new(x, y));
    let _ = existing.set_size(PhysicalSize::new(width, height));
    let _ = existing.set_ignore_cursor_events(true);
    attach_window(app, &label);
    return Ok(());
  }

  let init = cloud_init_script(cloud)?;
  let url = WebviewUrl::App("index.html".into());

  let window = WebviewWindowBuilder::new(app, &label, url)
    .title("Cloud")
    .inner_size(logical_w, logical_h)
    .position(logical_x, logical_y)
    .decorations(false)
    .transparent(true)
    .always_on_top(false)
    .skip_taskbar(true)
    .resizable(false)
    .visible(true)
    .shadow(false)
    .initialization_script(&init)
    .build()
    .map_err(|e| {
      eprintln!("Failed to create cloud window '{label}': {e}");
      e.to_string()
    })?;

  let _ = window.set_ignore_cursor_events(true);

  // Let WebView2 composite, then parent under WorkerW (behind desktop icons).
  let app_handle = app.clone();
  let label_owned = label.clone();
  std::thread::spawn(move || {
    std::thread::sleep(Duration::from_millis(500));
    attach_window(&app_handle, &label_owned);
  });

  Ok(())
}

/// Must be async on Windows — sync commands deadlock when creating WebView2 windows.
#[tauri::command]
async fn sync_cloud_windows(app: AppHandle, clouds: Vec<CloudWindowSpec>) -> Result<(), String> {
  let desired: HashSet<String> = clouds.iter().map(|c| cloud_label(&c.id)).collect();

  let open_cloud_labels: Vec<String> = app
    .webview_windows()
    .into_keys()
    .filter(|label| label.starts_with(CLOUD_PREFIX))
    .collect();

  for label in open_cloud_labels {
    if !desired.contains(&label) {
      if let Some(win) = app.get_webview_window(&label) {
        let _ = win.close();
      }
    }
  }

  for cloud in &clouds {
    create_or_update_cloud(&app, cloud)?;
  }

  Ok(())
}

#[tauri::command]
async fn reattach_widgets(app: AppHandle) {
  attach_cloud_widgets(&app);
  position_panel(&app);
}

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
  let show = MenuItem::with_id(app, "show", "Show Panel", true, None::<&str>)?;
  let hide = MenuItem::with_id(app, "hide", "Hide Panel", true, None::<&str>)?;
  let reattach = MenuItem::with_id(app, "reattach", "Re-attach Widgets", true, None::<&str>)?;
  let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&show, &hide, &reattach, &quit])?;

  let icon = app
    .default_window_icon()
    .cloned()
    .ok_or_else(|| tauri::Error::FailedToReceiveMessage)?;

  TrayIconBuilder::with_id("main-tray")
    .icon(icon)
    .tooltip("Akatsuki Cloud Habit Tracker")
    .menu(&menu)
    .on_menu_event(|app, event| match event.id().as_ref() {
      "show" => {
        if let Some(panel) = app.get_webview_window(PANEL_LABEL) {
          let _ = panel.show();
          let _ = panel.set_focus();
          position_panel(app);
        }
      }
      "hide" => {
        if let Some(panel) = app.get_webview_window(PANEL_LABEL) {
          let _ = panel.hide();
        }
      }
      "reattach" => {
        attach_cloud_widgets(app);
        position_panel(app);
      }
      "quit" => {
        app.exit(0);
      }
      _ => {}
    })
    .build(app)?;

  Ok(())
}

fn spawn_reattach_watcher(app: AppHandle) {
  std::thread::spawn(move || {
    loop {
      std::thread::sleep(Duration::from_secs(45));
      attach_cloud_widgets(&app);
    }
  });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_wallpaper::init())
    .invoke_handler(tauri::generate_handler![sync_cloud_windows, reattach_widgets])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      setup_tray(app.handle())?;
      position_panel(app.handle());

      let handle = app.handle().clone();
      std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(400));
        position_panel(&handle);
      });

      spawn_reattach_watcher(app.handle().clone());

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
