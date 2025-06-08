# 🚀 Welcome to Your SaaS Setup Wizard!

> **Time Required**: 10-15 minutes  
> **Difficulty**: Easy (mostly automated!)

You're about to set up a production-ready SaaS application. This guide will walk you through each step with clear instructions. Let's make this magical! ✨

---

## 📋 What You'll Need

Before we start, make sure you have:
- ✅ An email address for your admin account
- ✅ 10-15 minutes of focused time

> **Note**: Node.js, Docker, and Python will be automatically installed if needed!

---

## 🎯 Step-by-Step Setup


### Step 1: Run the Setup Script (1 minute)

Our smart setup script will handle everything for you!

```bash
npm run setup
```

The enhanced setup script will:
- ✅ Check for Node.js, Docker, and Python (install if missing)
- ✅ Create `.env.local` from `.env.example` template
- ✅ Auto-generate a secure JWT secret
- ✅ Set up environment files for frontend and backend
- ✅ Configure Git hooks for code quality


If you need to install prerequisites first, run:
```bash
npm run setup:prerequisites
```

---

### Step 2: Create Your Supabase Project (5 minutes)

Supabase will handle your database, authentication, and real-time features - all for free!

1. **Go to [supabase.com](https://supabase.com) and click "Start your project"**
   
2. **Sign in with GitHub** (recommended) or create an account

3. **Click "New project"** and fill in:
   - **Name**: Choose something like "my-saas-app"
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Plan**: Free tier is perfect to start

4. **Wait for setup** (usually 2 minutes) ☕

5. **Copy your keys** (you'll need these in Step 4):
   - Click "Settings" (gear icon) → "API"
   - Under "Project API keys" you'll see:
     - `Project URL` → Copy this
     - `anon public` key → Copy this (under "Project API keys")
     - `service_role` key → Copy this (also under "Project API keys" - keep it secret!)

---

### Step 3: Set Up Google OAuth (5-7 minutes)

Let your users sign in with their Google accounts!

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** (or select existing):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it (e.g., "My SaaS App")
   - Click "Create" and wait for it to be ready

3. **Configure OAuth Consent Screen**:
   - In the navigation menu (☰), go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type and click "Create"
   - Fill in the required fields:
     - **App name**: Your app name
     - **User support email**: Your email
     - **App logo**: Optional (skip for now)
     - **App domain**: Skip for development
     - **Developer contact email**: Your email
   - Click "Save and Continue"
   - On "Scopes" page, click "Save and Continue" (no changes needed)
   - On "Test users" page, click "Save and Continue" (optional)
   - Review and click "Back to Dashboard"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ Create Credentials" → "OAuth client ID"
   - **Application type**: Select "Web application"
   - **Name**: Enter "Web Client" or similar
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5173/auth/callback
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     (Replace YOUR-PROJECT-REF with your Supabase project reference ID from Settings → General)
   - Click "Create"

5. **Save your credentials**:
   - A popup will show your credentials
   - **Client ID**: Copy and save this
   - **Client secret**: Copy and save this (keep it secure!)
   - Click "OK"

6. **Configure Supabase**:
   - Go back to your Supabase dashboard
   - Navigate to "Authentication" → "Providers"
   - Find "Google" and click "Enable"
   - Paste your:
     - **Client ID** (from step 5)
     - **Client Secret** (from step 5)
   - **Skip URL configuration** is typically off
   - Click "Save"

7. **Important for Production**:
   - When going live, add your production domain to the OAuth credentials
   - Change OAuth consent screen from "Testing" to "Published"
   - Add your domain verification if required


---

### Step 4: Start Your App! 🎉

Make sure you added all the details to the .env.local file.

> **🔑 Admin Account Info**: When you start the app for the first time, an admin account will be automatically created using:
> - **Email**: The email you set as `ADMIN_EMAIL` in `.env.local`
> - **Password**: `ChangeMeNow123!` (temporary password - change it immediately!)

Then run:

```bash
npm run dev
```

Your app is now running at:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/api/docs

**First steps**:
1. Visit http://localhost:5173
2. **Use the pre-created admin account to login**:
   - **Email**: The email you set as `ADMIN_EMAIL` in `.env.local`
   - **Password**: `ChangeMeNow123!` (temporary password - change it immediately!)
3. You're now the admin! 👑
4. **Important**: Change your admin password immediately after first login

> **Note**: The admin account is automatically created when you first start the app. The temporary password `ChangeMeNow123!` should be changed immediately for security.

---

## 📊 Optional: Set Up Error Monitoring with Sentry (5 minutes)

Track errors and performance issues in your production app!

1. **Create a Sentry account** at [sentry.io](https://sentry.io)

2. **Create a new project**:
   - Click \"Create Project\"
   - **Platform**: Choose \"React\" for frontend monitoring
   - **Alert frequency**: Keep default
   - **Project name**: Your app name
   - **Team**: Select or create team
   - Click \"Create Project\"

3. **Get your DSN**:
   - After project creation, you'll see your DSN
   - It looks like: `https://abc123@o123456.ingest.sentry.io/1234567`
   - Copy this DSN

4. **Optional: Add backend monitoring**:
   - Create another project for \"Python\" (FastAPI)
   - Get a separate DSN for backend
   - This allows you to track frontend and backend errors separately

5. **Update `.env.local`**:
   ```env
   # For combined frontend/backend monitoring
   SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
   
   # OR for separate monitoring (recommended)
   VITE_SENTRY_DSN=https://frontend-dsn@sentry.io/frontend-id
   SENTRY_DSN=https://backend-dsn@sentry.io/backend-id
   
   # Optional: Performance monitoring sample rate (0.0 to 1.0)
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

6. **Configure alerts** (optional):
   - Go to \"Alerts\" → \"Create Alert Rule\"
   - Set up notifications for critical errors
   - Configure performance monitoring thresholds

---

## 🎨 Optional: Customize Your App

### Change App Name and Branding

1. Edit `.env.local`:
   ```env
   APP_NAME=Your Company Name
   ```

2. Update `frontend/src/locales/en/common.json`:
   ```json
   {
     "app": {
       "name": "Your Company Name",
       "tagline": "Your catchy tagline here"
     }
   }
   ```

3. Replace the logo:
   - Add your logo to `frontend/public/logo.svg`
   - Update `frontend/index.html` favicon

### Enable User Whitelist Mode

Want to control who can sign up? Set in `.env.local`:
```env
WHITELIST_MODE=true
```

Now only invited users can register!

---

## 💳 Optional: Set Up Stripe Payments (10 minutes)

Want to charge for your SaaS? Here's how:

1. **Create a Stripe account** at [stripe.com](https://stripe.com)

2. **Get your API keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy the "Publishable key" and "Secret key"

3. **Create products and prices**:
   - Go to "Products" → "Add product"
   - Create your pricing tiers
   - Copy the Price IDs

4. **Update `.env.local`**:
   ```env
   STRIPE_ENABLED=true
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx  # From step 5 below
   STRIPE_PRICE_ID_MONTHLY=price_xxx
   STRIPE_PRICE_ID_YEARLY=price_xxx
   ```

5. **Set up webhooks**:
   - In Stripe Dashboard → "Developers" → "Webhooks"
   - Click "Add endpoint"
   - **Endpoint URL**: 
     - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com)
     - For production: `https://your-domain.com/api/billing/webhook`
   - **Events to send**: Click "+ Select events"
     - Under "Checkout", select:
       - `checkout.session.completed` ✓
     - Under "Customer", select:
       - `customer.subscription.created` ✓
       - `customer.subscription.updated` ✓
       - `customer.subscription.deleted` ✓
   - Click "Add endpoint"
   - **Copy the Signing secret** (starts with `whsec_`)
   - This is your `STRIPE_WEBHOOK_SECRET`

6. **For local development**:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe  # macOS
   # or download from https://stripe.com/docs/stripe-cli
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to your local server
   stripe listen --forward-to localhost:8000/api/billing/webhook
   # Copy the webhook signing secret it shows you
   ```

---

## 🌐 Optional: Custom Domain Setup

Ready to go live? Here's how to use your own domain:

1. **Deploy to Google Cloud Run** (see deployment guide)

2. **Point your domain**:
   - Add a CNAME record pointing to your Cloud Run URL
   - Or use Cloudflare for SSL and caching

3. **Update environment variables**:
   ```env
   APP_URL=https://yourdomain.com
   API_URL=https://api.yourdomain.com
   ```

4. **Update OAuth redirect URLs** in Google Console

---

### Prerequisites missing
- Run `npm run setup:prerequisites` to auto-install Node.js, Docker, and Python
- The script uses nvm for Node.js and pyenv for Python version management
- Docker Desktop will be installed automatically (manual step on macOS)

### Docker not running
- The setup script will try to start Docker automatically
- If issues persist, restart Docker Desktop manually

## 🚨 Common Issues & Solutions

### "Missing environment variables" error
- Double-check your `.env.local` file exists in the project root
- Make sure there are no extra spaces or quotes around values
- Environment variables should not be wrapped in quotes
- Run `npm run validate-env` to see exactly what's missing

### "Cannot connect to Supabase"
- Verify your Supabase project is active
- Check that all three Supabase keys are correct
- Try regenerating the service key if needed

### Google sign-in not working
- Ensure redirect URIs match exactly (including http vs https)
- Check that Google provider is enabled in Supabase
- Verify your Google OAuth app is not in "Testing" mode
- Make sure you've saved the credentials in Supabase
- Check browser console for specific error messages

---

## 🎯 Next Steps

Congratulations! Your SaaS is ready. Here's what to do next:

1. **Customize the UI** - Edit React components in `frontend/src`
2. **Add your features** - The boilerplate handles auth, now add your magic!
3. **Set up monitoring** - Add your Google Analytics ID and Sentry DSN
4. **Deploy** - Push to GitHub and deploy with one command

Need help? Check the README.md for technical details or open an issue on GitHub.

**Happy building! 🚀**