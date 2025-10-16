# Deployment Instructions

## Backend (Render)

1. Deploy backend to Render
2. Get your backend URL (e.g., `https://your-app-name.onrender.com`)
3. Set environment variables in Render:
   - `GEMINI_API_KEY=your_gemini_key`
   - `DATABASE_URL=your_postgres_url`

## Frontend (Vercel)

1. Update `.env.production` with your backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. Deploy to Vercel
3. The frontend will automatically use the production API URL

## Local Development

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Uses `.env` file with local API URL

## CORS Configuration

Backend automatically allows:
- localhost (development)
- Vercel domains (production)
- Your custom domains