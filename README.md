# SafetySpeak - 60-Day English Challenge

This is a React + TypeScript + Vite application for learning Occupational Safety English.

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

3. Add your Firebase configuration to `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables in Vercel:
   - Go to "Settings" → "Environment Variables"
   - Add all `VITE_FIREBASE_*` variables from your `.env.local`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   vercel env add VITE_FIREBASE_MEASUREMENT_ID
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Security Notes

- **Never commit `.env.local`** - it's already in `.gitignore`
- All API keys are stored as environment variables
- Firebase configuration is loaded from environment variables at build time
- Use Vercel's environment variable management for production deployments
