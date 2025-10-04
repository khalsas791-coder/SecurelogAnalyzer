# SecureLog Analyzer - API Configuration Guide

## Overview
SecureLog Analyzer uses Supabase as its backend database service. This guide will help you configure your own Supabase API credentials to make the application fully functional.

## Current Status
The application is currently configured with **dummy API credentials** that need to be replaced with your actual Supabase project credentials.

---

## Step-by-Step Setup Instructions

### 1. Create a Supabase Account (If You Don't Have One)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with your email or GitHub account
4. Verify your email address

### 2. Create a New Supabase Project

1. After logging in, click "New Project"
2. Choose your organization (or create a new one)
3. Fill in the project details:
   - **Name**: `securelog-analyzer` (or any name you prefer)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is sufficient for testing
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

### 3. Get Your API Credentials

Once your project is ready:

1. Go to your project dashboard
2. Click on the **Settings** icon (⚙️) in the left sidebar
3. Navigate to **API** section
4. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

### 4. Update the Environment Variables

1. Open the `.env` file in the root directory of this project
2. Replace the dummy values with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1Mzk2MjAsImV4cCI6MjAwNTExNTYyMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Database Migration (Already Applied)

Good news! The database schema has already been applied to your Supabase project automatically. The following tables were created:

- `log_files` - Stores uploaded log file metadata
- `log_entries` - Stores individual parsed log entries
- `security_alerts` - Stores detected security threats
- `analysis_sessions` - Tracks analysis sessions

**You don't need to do anything for this step!** The migration was applied when you first ran the application.

### 6. Verify the Configuration

After updating your `.env` file:

1. **Restart the development server** (if it's running):
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Test the application**:
   - Open the application in your browser
   - Upload a sample log file
   - Check if the data persists after refreshing the page
   - If data persists, your configuration is working correctly!

---

## Important Security Notes

### ⚠️ Protecting Your API Keys

1. **Never commit `.env` to version control**
   - The `.env` file is already in `.gitignore`
   - Never share your API keys publicly

2. **The anon key is safe for client-side use**
   - This key is designed to be used in frontend applications
   - Row Level Security (RLS) policies protect your data
   - However, keep it private when possible

3. **For production deployments**:
   - Use environment variables in your hosting platform
   - Never hardcode API keys in your source code
   - Consider implementing authentication if handling sensitive data

---

## Troubleshooting

### Problem: "Missing Supabase environment variables" error

**Solution**: Make sure you've properly updated the `.env` file and restarted the dev server.

### Problem: Data not persisting after page refresh

**Solution**:
1. Check that your API credentials are correct
2. Open browser DevTools > Console to see any error messages
3. Verify your Supabase project is active (not paused)

### Problem: "Failed to create log file in database" error

**Solution**:
1. Check your internet connection
2. Verify your Supabase project status at [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. Ensure the database tables exist (they should have been created automatically)

### Problem: Supabase free tier limits reached

**Solution**:
- Free tier includes: 500MB database space, 2GB bandwidth, 50,000 monthly active users
- Upgrade to Pro plan if you need more resources
- Clear old data using the built-in data management features

---

## Testing with Sample Data

To verify everything is working:

1. Create a simple test log file (`test.log`):
```
2024-01-15 10:23:45 INFO User login successful
2024-01-15 10:24:12 WARNING Failed login attempt from 192.168.1.100
2024-01-15 10:24:15 ERROR Database connection failed
2024-01-15 10:25:30 INFO System started successfully
```

2. Upload this file to SecureLog Analyzer
3. Verify the dashboard shows the uploaded file
4. Refresh the page - data should still be there
5. Check the Security tab for any detected threats

---

## Need Help?

### Supabase Documentation
- [Getting Started Guide](https://supabase.com/docs/guides/getting-started)
- [Database Documentation](https://supabase.com/docs/guides/database)
- [API Documentation](https://supabase.com/docs/guides/api)

### Common Resources
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Status Page](https://status.supabase.com/)

---

## Quick Reference

### File Locations
- **Environment variables**: `.env` (root directory)
- **Supabase client**: `src/lib/supabase.ts`
- **API service**: `src/services/logService.ts`
- **Database types**: `src/lib/database.types.ts`

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

---

**You're all set!** Once you've updated the API credentials, your SecureLog Analyzer will be fully functional with persistent data storage.
