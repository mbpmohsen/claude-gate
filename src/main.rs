use serde::Deserialize;
use std::{process::Command, time::Duration};

#[derive(Deserialize)]
struct IpReply {
    country_code: Option<String>,
}

#[tauri::command]
async fn check_location() -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    // Query two independent services. A detected Iranian address takes precedence.
    let mut saw_other = false;
    for url in ["https://ipapi.co/json/", "https://ipwho.is/"] {
        if let Ok(response) = client.get(url).send().await {
            if let Ok(data) = response.json::<IpReply>().await {
                if let Some(code) = data.country_code {
                    if code.eq_ignore_ascii_case("IR") {
                        return Ok("iran".into());
                    }
                    if code.len() == 2 {
                        saw_other = true;
                    }
                }
            }
        }
    }
    if saw_other { Ok("other".into()) } else { Err("موقعیت IP مشخص نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.".into()) }
}

#[tauri::command]
fn open_claude() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        return Command::new("open").args(["-a", "Claude"]).spawn()
            .map(|_| ()).map_err(|_| "اپلیکیشن Claude پیدا نشد. ابتدا آن را نصب کنید.".into());
    }
    #[cfg(target_os = "windows")]
    {
        // Covers the current packaged Windows app registered in the Start menu.
        let result = Command::new("powershell.exe")
            .args(["-NoProfile", "-Command", "Get-StartApps | Where-Object { $_.Name -eq 'Claude' } | Select-Object -First 1 -ExpandProperty AppID"])
            .output().map_err(|e| e.to_string())?;
        let id = String::from_utf8_lossy(&result.stdout).trim().to_owned();
        if !id.is_empty() {
            return Command::new("explorer.exe")
                .arg(format!("shell:AppsFolder\\{id}"))
                .spawn().map(|_| ()).map_err(|e| e.to_string());
        }
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            let path = std::path::Path::new(&local).join("Programs").join("Claude").join("Claude.exe");
            if path.is_file() {
                return Command::new(path).spawn().map(|_| ()).map_err(|e| e.to_string());
            }
        }
        return Err("اپلیکیشن Claude پیدا نشد. ابتدا نسخهٔ دسکتاپ آن را نصب کنید.".into());
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    Err("این نسخه فقط ویندوز و مک را پشتیبانی می‌کند.".into())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_location, open_claude])
        .run(tauri::generate_context!())
        .expect("failed to run Claude Gate");
}
