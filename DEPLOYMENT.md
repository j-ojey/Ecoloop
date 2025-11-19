# EcoLoop Deployment Guide

This guide will walk you through deploying the EcoLoop application with the frontend on Vercel and the backend on Render.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)
- MongoDB Atlas account for production database (https://www.mongodb.com/cloud/atlas)

## Part 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
```bash
cd /home/froggy/Documents/EcoLoop
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Part 2: Deploy Backend to Render

### Step 1: Set Up MongoDB Atlas (Production Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user with username and password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/ecoloop`)

### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** and select **"Web Service"**
3. **Connect your GitHub repository** (EcoLoop)
4. **Configure the service**:
   - **Name**: `ecoloop-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables** (click "Advanced" then "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=4000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoloop
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   GEMINI_API_KEY=your-gemini-api-key-optional
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

6. **Click "Create Web Service"**

7. **Note your backend URL**: After deployment, you'll get a URL like `https://ecoloop-backend.onrender.com`

### Step 3: Seed the Database (Optional)

Once deployed, you can seed the database by accessing:
```
https://ecoloop-backend.onrender.com/api/seed
```
Or use Render's shell to run:
```bash
npm run seed
```

## Part 3: Deploy Frontend to Vercel

### Step 1: Prepare Frontend Configuration

1. **Update the API base URL** in your frontend to use the Render backend URL.

   Create a `.env.production` file in the `frontend` directory:
   ```bash
   cd frontend
   echo "VITE_API_BASE=https://ecoloop-backend.onrender.com" > .env.production
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the frontend directory**:
   ```bash
   cd /home/froggy/Documents/EcoLoop/frontend
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **ecoloop-frontend** (or your preferred name)
   - In which directory is your code located? **./** (current directory)
   - Override settings? **N**

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..."** and select **"Project"**
3. **Import your GitHub repository** (EcoLoop)
4. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   VITE_API_BASE=https://ecoloop-backend.onrender.com
   ```
   (Replace with your actual Render backend URL)

6. **Click "Deploy"**

7. **Note your frontend URL**: After deployment, you'll get a URL like `https://ecoloop-frontend.vercel.app`

## Part 4: Update CORS Settings

After getting your Vercel frontend URL, update the backend CORS settings:

1. **Go to your Render dashboard** → Your backend service → Environment
2. **Add a new environment variable**:
   ```
   FRONTEND_URL=https://ecoloop-frontend.vercel.app
   ```

3. **Update backend CORS** (already configured in `backend/src/server.js`):
   The current `cors()` setup allows all origins. For production, you might want to restrict it:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```

## Part 5: Verify Deployment

### Test the Backend:
```bash
curl https://ecoloop-backend.onrender.com/api/health
```
Should return: `{"status":"ok"}`

### Test the Frontend:
Open your Vercel URL in a browser and verify:
- ✅ Pages load correctly
- ✅ Login/Register works
- ✅ Items can be posted and viewed
- ✅ Messages work
- ✅ EcoBot responds (if Gemini API key is configured)

## Part 6: Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

### For Backend (Render):
1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your custom domain
4. Configure DNS as instructed

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoloop
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
GEMINI_API_KEY=your-gemini-api-key-optional
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_BASE=https://your-backend-url.onrender.com
```

## Troubleshooting

### Backend Issues:
- **500 errors**: Check Render logs for error messages
- **Database connection fails**: Verify MongoDB Atlas IP whitelist and connection string
- **CORS errors**: Ensure FRONTEND_URL is set correctly

### Frontend Issues:
- **API calls fail**: Verify VITE_API_BASE is correct and backend is running
- **Build fails**: Check that all dependencies are in package.json
- **Environment variables not working**: Make sure they start with `VITE_`

### Common Issues:
- **Free tier sleep**: Render free tier sleeps after 15 minutes of inactivity. First request may be slow.
- **Socket.io connection**: Make sure WebSocket connections are allowed (Render and Vercel support this)

## Continuous Deployment

Both Vercel and Render automatically redeploy when you push to your GitHub repository:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Your frontend (Vercel) and backend (Render) will automatically redeploy!

## Monitoring

- **Render**: Check logs at https://dashboard.render.com → Your Service → Logs
- **Vercel**: Check deployments at https://vercel.com/dashboard → Your Project → Deployments

## Cost Optimization

### Free Tier Limits:
- **Render**: 750 hours/month (enough for one service)
- **Vercel**: Unlimited deployments for personal projects
- **MongoDB Atlas**: 512MB storage on free tier

### Tips:
- Use Render's free tier for backend
- Use Vercel's free tier for frontend
- Use MongoDB Atlas free tier (M0 cluster)
- Consider upgrading if you exceed limits

## Security Best Practices

1. **Never commit .env files** - Always use platform environment variables
2. **Use strong JWT_SECRET** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Enable HTTPS only** - Both Vercel and Render provide free SSL
4. **Restrict CORS** - Set specific frontend URL in production
5. **Validate user input** - Already implemented in the backend
6. **Rate limiting** - Consider adding for production

---

## Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create MongoDB Atlas cluster and get connection string
- [ ] Deploy backend to Render with all environment variables
- [ ] Get Render backend URL
- [ ] Deploy frontend to Vercel with VITE_API_BASE
- [ ] Update backend CORS with frontend URL
- [ ] Test all features on production
- [ ] Set up custom domains (optional)
- [ ] Monitor logs and performance

---

**Congratulations!** 🎉 Your EcoLoop application is now live!

- Frontend: https://your-app.vercel.app
- Backend: https://your-api.onrender.com
