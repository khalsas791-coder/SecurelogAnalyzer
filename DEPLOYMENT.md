# Deploying SecureLog Analyzer to Netlify

This guide will walk you through deploying your SecureLog Analyzer application to Netlify.

## Prerequisites

Before deploying, make sure you have:
- A GitHub account (or GitLab/Bitbucket)
- A Netlify account (free tier is sufficient)
- Your Supabase API credentials configured

---

## Method 1: Deploy via Netlify Dashboard (Recommended for Beginners)

### Step 1: Push Your Code to GitHub

1. **Create a new repository on GitHub**:
   - Go to [github.com](https://github.com)
   - Click the "+" icon and select "New repository"
   - Name it `securelog-analyzer`
   - Choose "Public" or "Private"
   - Click "Create repository"

2. **Push your code** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SecureLog Analyzer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/securelog-analyzer.git
   git push -u origin main
   ```

### Step 2: Connect to Netlify

1. **Sign up/Login to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Sign up" or "Log in"
   - Choose "Continue with GitHub" (recommended)

2. **Create a new site**:
   - Click "Add new site" → "Import an existing project"
   - Click "GitHub" (or your Git provider)
   - Authorize Netlify to access your repositories
   - Select your `securelog-analyzer` repository

### Step 3: Configure Build Settings

Netlify should auto-detect the settings, but verify:

- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (will use from netlify.toml)

Click "Deploy site"

### Step 4: Add Environment Variables

This is **CRITICAL** - your app won't work without these:

1. In your Netlify site dashboard, go to **Site settings**
2. Navigate to **Environment variables** (in the left sidebar)
3. Click "Add a variable" and add these two:

   **Variable 1:**
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   **Variable 2:**
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key

4. Click "Save"

### Step 5: Redeploy with Environment Variables

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete (usually 1-2 minutes)

### Step 6: Verify Deployment

1. Click on the provided URL (e.g., `https://random-name-12345.netlify.app`)
2. Your SecureLog Analyzer should now be live!
3. Test by uploading a sample log file
4. Refresh the page - data should persist (confirming Supabase integration works)

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window to authenticate.

### Step 3: Initialize Netlify in Your Project

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Enter a site name (or leave blank for auto-generated)
- Build command: `npm run build`
- Publish directory: `dist`

### Step 4: Set Environment Variables

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here"
```

### Step 5: Deploy

```bash
# Deploy to production
netlify deploy --prod
```

Or for a preview deployment:
```bash
netlify deploy
```

---

## Method 3: Drag & Drop Deploy (Quick Test)

For a quick test without Git:

1. **Build your project locally**:
   ```bash
   npm run build
   ```

2. **Go to Netlify**:
   - Visit [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your `dist` folder

3. **Add environment variables** (as described in Method 1, Step 4)

4. **Redeploy** to apply environment variables

**Note**: This method is not recommended for production as you'll need to manually redeploy for every change.

---

## Custom Domain Setup (Optional)

### Using Netlify Subdomain
Your site automatically gets a URL like: `https://your-site-name.netlify.app`

### Using Your Own Domain

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain (e.g., `securelog-analyzer.com`)
4. Follow the instructions to update your DNS records
5. Netlify will automatically provision an SSL certificate

---

## Continuous Deployment

Once connected to Git, Netlify automatically deploys when you push changes:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Netlify will automatically:
1. Detect the push
2. Run `npm run build`
3. Deploy the new version
4. Usually takes 1-2 minutes

---

## Troubleshooting

### Build Fails

**Problem**: Build fails on Netlify but works locally

**Solutions**:
1. Check build logs in Netlify dashboard
2. Verify Node version (should be 18+)
3. Clear cache and retry: Deploy settings → Clear cache and deploy

### Environment Variables Not Working

**Problem**: App loads but data doesn't persist

**Solutions**:
1. Verify environment variables are set correctly (no typos!)
2. Make sure variable names start with `VITE_`
3. Redeploy after adding environment variables
4. Check browser console for errors

### Page Not Found on Refresh

**Problem**: Refreshing non-home pages shows 404

**Solution**: This should be handled by `netlify.toml`, but if it persists:
1. Verify `netlify.toml` exists in root directory
2. Check that redirects are properly configured

### Supabase Connection Errors

**Problem**: CORS errors or connection refused

**Solutions**:
1. Verify your Supabase project is active
2. Check that you're using the correct Supabase URL
3. Ensure anon key is the public key (not service role key)
4. Verify your Supabase project allows connections from Netlify domain

---

## Performance Optimization

### Enable Netlify Analytics (Optional)

1. Go to **Site settings** → **Analytics**
2. Enable "Netlify Analytics" ($9/month)
3. Get insights on traffic, performance, and user behavior

### Enable Asset Optimization

1. Go to **Site settings** → **Build & deploy**
2. Scroll to "Post processing"
3. Enable:
   - Bundle CSS
   - Minify CSS
   - Minify JS
   - Compress images

---

## Monitoring Your Deployment

### Check Deployment Status
- Dashboard → Deploys → See all deployments
- Green check = successful
- Red X = failed (click to see logs)

### View Logs
- Deploys → Click on any deployment
- View build logs and deployment details

### Functions Usage (Future)
- Analytics → Functions (if you add serverless functions later)

---

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use Netlify environment variables instead

2. **Keep Supabase keys secure**
   - Use anon key (not service role key) for frontend
   - Row Level Security is enabled for protection

3. **Enable HTTPS**
   - Netlify provides free SSL (automatic)
   - Always use HTTPS URLs

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities

---

## Quick Reference

### Netlify Configuration Files
- `netlify.toml` - Main configuration
- `_redirects` - Backup redirect rules

### Useful Netlify Commands
```bash
# Login
netlify login

# Check status
netlify status

# Open dashboard
netlify open

# View logs
netlify logs

# Deploy manually
netlify deploy --prod
```

### Important URLs
- **Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [answers.netlify.com](https://answers.netlify.com)

---

## Next Steps After Deployment

1. ✅ Test all features on the live site
2. ✅ Upload sample log files to verify functionality
3. ✅ Share the URL with your team
4. ✅ Set up custom domain (optional)
5. ✅ Monitor deployment status
6. ✅ Configure automatic deployments from Git

---

**Congratulations!** Your SecureLog Analyzer is now live on Netlify! 🎉

Your site is accessible 24/7, automatically scales, and benefits from Netlify's global CDN for fast loading times worldwide.
