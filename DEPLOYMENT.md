## Deployment Checklist

### Pre-Deployment
- [x] Backend: FastAPI with YOLOv8 + Cloudinary verified
- [x] Frontend: React + Vite, captures images, calls API
- [x] CORS: Updated to support Vercel domains (`*.vercel.app`)
- [x] `.gitignore`: Excludes `.env`, `node_modules`, `venv`, etc.
- [x] Git repo initialized and committed

### GitHub Push
1. Create a GitHub repo (e.g., `github.com/yourname/luit`)
2. Add remote and push:
```bash
git remote add origin https://github.com/yourname/luit.git
git branch -M main
git push -u origin main
```

### Railway Backend Deployment
1. Go to [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub** → Select `luit` repo
3. **Root Directory**: `backend`
4. **Environment Variables**:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY` (copy exact string with `\n` escapes)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (set once Vercel domain is ready)
5. **Procfile** will auto-run: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Copy deployed Railway URL (e.g., `https://luit-prod.railway.app`)
7. **Keep-Alive**: Set UptimeRobot to ping `/health` every 10 min

### Vercel Frontend Deployment
1. Go to [vercel.com](https://vercel.com)
2. **Import Project** → Select `luit` repo, framework = **Vite**
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Paste the Railway backend URL from step 6 above
6. Deploy
7. Copy Vercel URL (e.g., `https://luit.vercel.app`)
8. Go back to Railway dashboard, update `FRONTEND_URL` env var with Vercel URL

### Test Deployed App
1. Open `https://luit.vercel.app` on mobile
2. Allow camera + location
3. Capture garbage photo
4. Verify response shows garbage detection
5. Check image uploaded to Cloudinary
6. Submit report and verify in Firestore

### Troubleshooting

**"Cannot reach backend from Vercel?"**
- Check backend `/health` endpoint responds: `curl https://luit-prod.railway.app/health`
- Verify `FRONTEND_URL` is set in Railway env
- Check frontend `.env.local` was updated to deployed backend URL

**"Image verification returns 500?"**
- Check Railway logs for errors
- Ensure YOLOv8 model downloads (first call takes 30s)
- Fallback to basic CV if YOLO fails

**"Keep-alive not working?"**
- Railway free tier sleeps after 15 min of inactivity
- Set UptimeRobot.com monitor on backend `/health` (free plan allows 1 monitor)
- Or use a Cron service to call `/health` every 10 min

---

**Once deployed, share the public URL and enjoy!** 🚀
