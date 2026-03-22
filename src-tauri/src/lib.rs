use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String,
    pub headers: Vec<Header>,
    pub body: Option<String>,
    pub body_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Header {
    pub key: String,
    pub value: String,
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

fn default_enabled() -> bool {
    true
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
    pub time: u64,
    pub size: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[tauri::command]
async fn send_http_request(request: HttpRequest) -> Result<HttpResponse, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let start = Instant::now();

    let method = match request.method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "PATCH" => reqwest::Method::PATCH,
        "DELETE" => reqwest::Method::DELETE,
        "HEAD" => reqwest::Method::HEAD,
        "OPTIONS" => reqwest::Method::OPTIONS,
        _ => reqwest::Method::GET,
    };

    let mut req = client.request(method, &request.url);

    for header in &request.headers {
        if header.enabled && !header.key.is_empty() {
            req = req.header(&header.key, &header.value);
        }
    }

    if let Some(body) = request.body {
        if !body.is_empty() {
            let body_type = request.body_type.as_deref().unwrap_or("raw");

            match body_type {
                "json" => {
                    req = req.header("Content-Type", "application/json").body(body);
                }
                "x-www-form-urlencoded" => {
                    req = req.header("Content-Type", "application/x-www-form-urlencoded").body(body);
                }
                "form-data" => {
                    let mut form = reqwest::multipart::Form::new();
                    if let Ok(parsed) = serde_json::from_str::<HashMap<String, String>>(&body) {
                        for (k, v) in parsed {
                            form = form.text(k, v);
                        }
                    }
                    req = req.multipart(form);
                }
                _ => {
                    req = req.body(body);
                }
            }
        }
    }

    let response = req.send().await.map_err(|e| e.to_string())?;

    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("").to_string();

    let headers: Vec<(String, String)> = response
        .headers()
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();

    let body_bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let size = body_bytes.len();

    let body = String::from_utf8_lossy(&body_bytes).to_string();

    let time = start.elapsed().as_millis() as u64;

    Ok(HttpResponse {
        status,
        status_text,
        headers,
        body,
        time,
        size,
        error: None,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![send_http_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
