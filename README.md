# 🎞️ Video Encoder & Streaming Backend (Next.js + FFmpeg + worker_threads + Cloudinary + Docker)

An advanced, modular, and multithreaded video processing platform built with **Next.js (App Router)**, **FFmpeg**, and **Cloudinary**. This system supports uploading, resizing, format conversion, HLS streaming, and subtitle integration using **Node.js Worker Threads** to enable efficient and scalable processing.

> 🧠 **Multithreaded architecture using `worker_threads` ensures non-blocking, parallel FFmpeg operations.**

---

## 🧩 This project separates **upload**, **processing**, and **delivery** using **modular components** and **isolated threads**.

---

## 🚀 Key Features

✅ Drag-and-drop file uploads  
✅ Upload videos and subtitle files (.srt, .vtt, .ass)  
✅ Resize videos using dynamic width/height  
✅ Convert videos to other formats (MP4, WebM, etc.)  
✅ Generate HLS streams (`.m3u8 + .ts`) for adaptive playback  
✅ Burn or attach subtitles to video  
✅ Upload processed output to Cloudinary  
✅ Real-time feedback via logs/progress states  
✅ Modular design — separate utilities for FFmpeg, Cloudinary, threads  
✅ 🔄 Multithreaded FFmpeg execution via `worker_threads`  
✅ 🧼 Cleanup temporary files after processing

---

## 🧪 Live Demo

> link to live deployment here, [https://yourproject-demo.vercel.app/upload](https://video-encoder-production.up.railway.app/)

---

## 🛠️ Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| Frontend     | Next.js App Router, Tailwind CSS, Framer Motion, React Dropzone |
| Backend      | Next.js API Route, FFmpeg, FFprobe, Worker Threads              |
| Video Engine | FFmpeg (resize, convert, HLS, subtitles)                        |
| Storage/CDN  | Cloudinary                                                      |
| Threads      | Node.js `worker_threads` for background processing              |
| Validation   | Zod, FormData                                                   |

---

## 📂 Project Structure

- `src/app/tool/` — UI pages for each tool
- `src/app/api/` — API routes for video processing (server-side)
- `src/app/worker/` — Worker scripts for FFmpeg operations
- `src/components/` — UI components
- `public/` — Static assets

---

## 🧵 Multithreading in Node.js

### Problem:

FFmpeg processing is **CPU-intensive** and **blocking**. If you run it directly in an API route, the server becomes unresponsive under load.

### Solution:

We offload all FFmpeg work to a **Worker Thread** using Node's `worker_threads` module.

### How it Works:

- The API route stores uploaded files temporarily.
- A new **thread** is spawned to:
  - Probe the input file using `ffprobe`
  - Dynamically generate FFmpeg commands
  - Run FFmpeg in the background
- The main thread returns early and **remains free for other users**.

> ✅ Scalable  
> ✅ Non-blocking  
> ✅ Parallel video processing supported

### Worker Entry Example:

```ts
// workers/ffmpegWorker.js
parentPort.on("message", async (job) => {
  const result = await processWithFFmpeg(job); // resize/convert/hls
  parentPort.postMessage({ success: true, result });
});
```

## 🐳 Docker

Build and run with Docker (FFmpeg included):

```bash
docker build -t video-encoder .
docker run -p 3000:3000 --env-file .env.local video-encoder
```

## ⚙️ Configuration

- **Cloudinary**: Required for HLS streaming/upload. Set `CLOUDNAME`, `CLOUDAPIKEY`, and `CLOUDSECRET` in your environment.
- **FFmpeg**: Automatically installed in Docker. For local dev, ensure `ffmpeg` is in your PATH.

## 📝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
