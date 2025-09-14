# ChoreoAI Deployment Guide

This guide explains how to deploy the Flask backend to Render and the static frontend to Vercel.

## 1. Prerequisites
- GitHub repository with this project (Render pulls from GitHub)
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- (Optional) GPU hosting provider if Render free tier CPU is too slow for generation

## 2. Backend (Render)
### Files Already Present
- `render.yaml` (in repo root) defines the web service
- `wsgi.py` exposes `app` for Gunicorn
- `requirements.txt` includes `gunicorn` and `python-dotenv`
- `dance_server.py` reads dynamic `PORT` and supports CORS restricted by `FRONTEND_ORIGIN`

### Create Service
1. Push latest changes to `main` (or a branch you will deploy).
2. In Render dashboard: New + Web Service.
3. Select repository.
4. Auto-detected settings:
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 600`
5. Set Environment Variables:
   - `FRONTEND_ORIGIN` = `https://<your-vercel-domain>` (e.g. `https://choreo-ai.vercel.app`)
   - (Optional) `FLASK_DEBUG` = `0`
   - (Optional) `PYTHON_VERSION` if not auto-matched (3.10)
6. Create Service.

### Verify Deployment
- Wait for build to complete.
- Open `https://<render-service>.onrender.com/api/health` → should return JSON `{"status":"ok"}`.
- Test generation endpoints manually (replace SERVICE_URL):
```bash
curl -F "audio=@samples/example.wav" https://SERVICE_URL/api/upload
curl -X POST -H 'Content-Type: application/json' \
  -d '{"upload_id":"<returned_upload_id>","dance_style":"hiphop","skill_level":3}' \
  https://SERVICE_URL/api/generate
```
- Poll status:
```bash
curl https://SERVICE_URL/api/status/<generation_id>
```
- Download:
```bash
curl -O https://SERVICE_URL/api/download/<generation_id>/video
```

### Performance Notes
- CPU-only hosting will be slow. Consider reducing diffusion steps further or moving model inference to a GPU host (Lambda Labs, RunPod, Modal, etc.). You can keep this Render instance as a lightweight orchestration/proxy if offloading heavy compute.

## 3. Frontend (Vercel)
### Deploy
1. Import GitHub repo into Vercel.
2. Root directory: `ChoreoAI` if repository root includes only this project; otherwise configure accordingly.
3. Build settings: Static (no framework build needed). Vercel will serve `index.html`.
4. After deploy, note the domain (e.g. `https://choreo-ai.vercel.app`).

### Point Frontend to Backend
The frontend script `simple-demo-service.js` selects backend URL:
- Localhost dev: `http://localhost:5001`
- Production: value from `localStorage.BACKEND_URL` or default `https://choreoai-backend.onrender.com`

Update steps:
1. After backend deploy, visit the site.
2. Open browser console and run:
```js
localStorage.setItem('BACKEND_URL','https://<render-service>.onrender.com');
```
3. Refresh page – generation requests will target the deployed backend.

(Optionally) Hardcode the final Render URL in `simple-demo-service.js` if stable.

## 4. Optional: External GPU Worker
If you need GPU acceleration:
1. Host model inference script on a GPU provider exposing a minimal API (e.g. `/infer`).
2. Modify `dance_server.py` generation thread to POST audio features to the GPU worker and stream back results.
3. Keep Render as control plane (upload, status, download). Store produced video/motion files in a shared object store (S3, R2) accessible to both services.

## 5. Troubleshooting
- CORS errors: Ensure `FRONTEND_ORIGIN` matches the exact origin (scheme + domain). No trailing `/`.
- 502/Timeouts: Increase `--timeout` in Gunicorn or optimize model load (lazy load first request).
- Large model cold start: Preload model in `dance_server.py` global scope when process starts.
- Memory errors: Reduce batch size or model precision (enable torch autocast / half precision if GPU present).

## 6. Future Hardening (Not Yet Implemented)
- Authentication & rate limiting (e.g. API key header)
- Persistent storage (S3) instead of local `outputs/`
- Logging aggregation (Render logs → external service)
- Health + readiness split endpoints
- Structured JSON logging

---
De-scope note: FBX generation removed from active flow; related utilities remain available for future reactivation.
