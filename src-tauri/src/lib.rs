#[cfg(desktop)]
use http_range::HttpRange;
#[cfg(desktop)]
use std::collections::HashMap;
#[cfg(desktop)]
use std::io::{Read, Seek, SeekFrom};
#[cfg(desktop)]
use std::sync::{Arc, Mutex};
use tauri::http::Response;

#[cfg(desktop)]
use tauri::Manager;

/// 已加载资源的缓存条目
#[cfg(desktop)]
struct CachedAsset {
  bytes: Arc<Vec<u8>>,
  mime: String,
}

/// 根据文件扩展名猜测 MIME 类型（避免引入额外依赖）
#[cfg(desktop)]
fn mime_from_ext(path: &str) -> &'static str {
  match path.rsplit('.').next().unwrap_or("").to_lowercase().as_str() {
    "mp4" => "video/mp4",
    "webm" => "video/webm",
    "mp3" => "audio/mpeg",
    "ogg" => "audio/ogg",
    "wav" => "audio/wav",
    "png" => "image/png",
    "jpg" | "jpeg" => "image/jpeg",
    "gif" => "image/gif",
    "webp" => "image/webp",
    "svg" => "image/svg+xml",
    "vtt" => "text/vtt",
    "srt" => "text/plain",
    "json" => "application/json",
    _ => "application/octet-stream",
  }
}

#[tauri::command]
fn exit_app(app_handle: tauri::AppHandle) {
  app_handle.exit(0);
}

/// 小文件阈值：小于此大小的文件读全量并缓存；大于此的按 Range 按需读取。
#[cfg(desktop)]
const SMALL_FILE_THRESHOLD: u64 = 2 * 1024 * 1024; // 2 MB

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[cfg(desktop)]
  let asset_cache: Arc<Mutex<HashMap<String, CachedAsset>>> = Arc::default();

  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![exit_app])
    .register_asynchronous_uri_scheme_protocol("stream", move |ctx, request, responder| {
      let uri_path = request.uri().path();
      let path = percent_encoding::percent_decode_str(uri_path)
        .decode_utf8_lossy()
        .to_string();

      // ── 移动端 ─────────────────────────────────────────────────────────
      #[cfg(mobile)]
      {
        let _ = (ctx, path);
        responder.respond(
          Response::builder()
            .status(404)
            .header("Access-Control-Allow-Origin", "*")
            .body(b"stream protocol not available on mobile; use server URL".to_vec())
            .unwrap(),
        );
      }

      // ── 桌面端 ─────────────────────────────────────────────────────────
      #[cfg(desktop)]
      {
        let cache = asset_cache.clone();

        // 先查缓存（不在阻塞任务里做，减少锁竞争）
        let cached = {
          let lock = cache.lock().unwrap();
          lock.get(&path).map(|e| (e.bytes.clone(), e.mime.clone()))
        };

        if let Some((bytes, mime)) = cached {
          let file_len = bytes.len() as u64;
          let range_header = request
            .headers()
            .get("range")
            .and_then(|v| v.to_str().ok());
          let resp = build_response(&bytes, &mime, file_len, range_header);
          responder.respond(resp);
          return;
        }

        // 解析资源目录（非 I/O 操作，不阻塞）
        let resource_dir = match ctx.app_handle().path().resource_dir() {
          Ok(d) => d,
          Err(e) => {
            responder.respond(
              Response::builder()
                .status(500)
                .header("Access-Control-Allow-Origin", "*")
                .body(format!("Failed to resolve resource dir: {e}").into_bytes())
                .unwrap(),
            );
            return;
          }
        };
        let rel = path.trim_start_matches('/');
        let file_path = resource_dir.join(rel);
        let range_header = request
          .headers()
          .get("range")
          .and_then(|v| v.to_str().ok())
          .map(|s| s.to_string());

        // 将阻塞的文件 I/O 放到 spawn_blocking 线程池，避免阻塞异步运行时
        tauri::async_runtime::spawn_blocking(move || {
          let resp = serve_file_blocking(&cache, &file_path, &path, range_header.as_deref());
          responder.respond(resp);
        });
      }
    })
    .setup(|app| {
      app.handle().plugin(
        tauri_plugin_log::Builder::default()
          .level(log::LevelFilter::Debug)
          .targets([
            tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
            tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
              file_name: None,
            }),
          ])
          .max_file_size(5_000_000)
          .build(),
      )?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// 在阻塞线程中读取文件并构建 HTTP 响应。
///
/// 策略：
/// - 小文件（< 2MB）：读全量，缓存，可快速响应后续 Range 请求
/// - 大文件（≥ 2MB）：用 seek+read 仅读取 Range 所需的字节，不缓存
#[cfg(desktop)]
fn serve_file_blocking(
  cache: &Arc<Mutex<HashMap<String, CachedAsset>>>,
  file_path: &std::path::Path,
  path: &str,
  range_header: Option<&str>,
) -> Response<Vec<u8>> {
  let mime = mime_from_ext(path);

  // 打开文件获取元数据
  let mut file = match std::fs::File::open(file_path) {
    Ok(f) => f,
    Err(e) => {
      return Response::builder()
        .status(404)
        .header("Access-Control-Allow-Origin", "*")
        .body(format!("Asset not found: {path} ({e})").into_bytes())
        .unwrap();
    }
  };

  let file_len = match file.metadata() {
    Ok(m) => m.len(),
    Err(e) => {
      return Response::builder()
        .status(500)
        .header("Access-Control-Allow-Origin", "*")
        .body(format!("Failed to read metadata: {e}").into_bytes())
        .unwrap();
    }
  };

  // ── 小文件：读全量并缓存 ──
  if file_len < SMALL_FILE_THRESHOLD {
    let mut data = Vec::with_capacity(file_len as usize);
    if let Err(e) = file.read_to_end(&mut data) {
      return Response::builder()
        .status(500)
        .header("Access-Control-Allow-Origin", "*")
        .body(format!("Failed to read file: {e}").into_bytes())
        .unwrap();
    }

    let bytes = Arc::new(data);
    // 缓存
    {
      let mut lock = cache.lock().unwrap();
      while lock.len() >= 50 {
        if let Some(key) = lock.keys().next().cloned() {
          lock.remove(&key);
        }
      }
      lock.insert(
        path.to_string(),
        CachedAsset {
          bytes: bytes.clone(),
          mime: mime.to_string(),
        },
      );
    }

    return build_response(&bytes, mime, file_len, range_header);
  }

  // ── 大文件：按 Range 按需读取，不缓存 ──
  if let Some(range_str) = range_header {
    let ranges = match HttpRange::parse(range_str, file_len) {
      Ok(r) => r,
      Err(_) => {
        return Response::builder()
          .status(416)
          .header("Content-Range", format!("bytes */{file_len}"))
          .header("Access-Control-Allow-Origin", "*")
          .body(Vec::new())
          .unwrap();
      }
    };
    let r = &ranges[0];
    let start = r.start;
    let length = r.length;

    if let Err(e) = file.seek(SeekFrom::Start(start)) {
      return Response::builder()
        .status(500)
        .header("Access-Control-Allow-Origin", "*")
        .body(format!("Seek failed: {e}").into_bytes())
        .unwrap();
    }

    let mut buf = vec![0u8; length as usize];
    if let Err(e) = file.read_exact(&mut buf) {
      return Response::builder()
        .status(500)
        .header("Access-Control-Allow-Origin", "*")
        .body(format!("Read failed: {e}").into_bytes())
        .unwrap();
    }

    let end = start + length - 1;
    return Response::builder()
      .status(206)
      .header("Content-Type", mime)
      .header("Accept-Ranges", "bytes")
      .header("Access-Control-Allow-Origin", "*")
      .header("Access-Control-Expose-Headers", "content-range")
      .header("Content-Range", format!("bytes {start}-{end}/{file_len}"))
      .header("Content-Length", length.to_string())
      .body(buf)
      .unwrap();
  }

  // 大文件无 Range 请求（少见，但处理：回退为读全量，不缓存）
  let mut data = Vec::with_capacity(file_len as usize);
  if let Err(e) = file.read_to_end(&mut data) {
    return Response::builder()
      .status(500)
      .header("Access-Control-Allow-Origin", "*")
      .body(format!("Failed to read file: {e}").into_bytes())
      .unwrap();
  }

  let bytes = Arc::new(data);
  build_response(&bytes, mime, file_len, None)
}

/// 从完整字节数组构建 Response，处理 Range / 非 Range 两种情况。
#[cfg(desktop)]
fn build_response(
  bytes: &[u8],
  mime: &str,
  file_len: u64,
  range_header: Option<&str>,
) -> Response<Vec<u8>> {
  match range_header {
    Some(range_str) => {
      let ranges = match HttpRange::parse(range_str, file_len) {
        Ok(r) => r,
        Err(_) => {
          return Response::builder()
            .status(416)
            .header("Content-Range", format!("bytes */{file_len}"))
            .header("Access-Control-Allow-Origin", "*")
            .body(Vec::new())
            .unwrap();
        }
      };
      let r = &ranges[0];
      let start = r.start as usize;
      let len = r.length as usize;
      let end = start + len - 1;

      Response::builder()
        .status(206)
        .header("Content-Type", mime)
        .header("Accept-Ranges", "bytes")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Expose-Headers", "content-range")
        .header("Content-Range", format!("bytes {start}-{end}/{file_len}"))
        .header("Content-Length", len.to_string())
        .body(bytes[start..start + len].to_vec())
        .unwrap()
    }
    None => Response::builder()
      .status(200)
      .header("Content-Type", mime)
      .header("Accept-Ranges", "bytes")
      .header("Access-Control-Allow-Origin", "*")
      .header("Content-Length", file_len.to_string())
      .body(bytes.to_vec())
      .unwrap(),
  }
}
