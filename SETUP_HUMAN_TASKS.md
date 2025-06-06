# 🚀 Welcome to Your SaaS Setup Wizard!

> **Time Required**: 15-20 minutes  
> **Difficulty**: Easy (just copy & paste!)

You're about to set up a production-ready SaaS application. This guide will walk you through each step with clear instructions. Let's make this magical! ✨

---

## 📋 What You'll Need

Before we start, make sure you have:
- ✅ A Google account (for OAuth)
- ✅ An email address for your admin account
- ✅ 15 minutes to work

---

## 🎯 Step-by-Step Setup

### Step 1: Create Your Supabase Project (5 minutes)

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
   - You'll see:
     - `Project URL` → Copy this
     - `anon public` key → Copy this
     - `service_role secret` key → Copy this (keep it secret!)

---

### Step 2: Set Up Google OAuth (5 minutes)

Let your users sign in with their Google accounts!

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** (or select existing):
   - Click the dropdown at the top
   - Click "New Project"
   - Name it (e.g., "My SaaS App")
   - Click "Create"

3. **Enable Google OAuth**:
   - In the search bar, type "OAuth consent"
   - Click "OAuth consent screen"
   - Choose "External" and click "Create"
   - Fill in:
     - **App name**: Your app name
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "Save and Continue" (skip optional fields)

4. **Create OAuth credentials**:
   - Go to "Credentials" (left sidebar)
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add these **Authorized redirect URIs**:
     ```
     http://localhost:5173/auth/callback
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```
     (Replace YOUR-PROJECT with your Supabase project ID)
   - Click "Create"

5. **Copy your credentials**:
   - `Client ID` → Copy this
   - `Client secret` → Copy this

6. **Configure Supabase**:
   - Go back to your Supabase dashboard
   - Navigate to "Authentication" → "Providers"
   - Enable "Google"
   - Paste your Client ID and Client Secret
   - Click "Save"

---

### Step 3: Create Your Configuration File (2 minutes)

Now let's put all those keys in one place!

1. **Create a file called `.env.local`** in the project root

2. **Copy and paste this template**:
```env
# Supabase Configuration (from Step 1)
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Google OAuth (from Step 2)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Admin Configuration
ADMIN_EMAIL=your@email.com
WHITELIST_MODE=false

# Security (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Application
APP_NAME=My Awesome SaaS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

3. **Fill in your values**:
   - Replace each `your_xxx_here` with the actual values you copied
   - Set `ADMIN_EMAIL` to your email address
   - For `JWT_SECRET`, use a password generator to create a 32+ character string

---

### Step 4: Run the Magic Setup Script (1 minute)

Almost done! Let's verify everything is configured correctly:

```bash
npm run setup
```

This script will:
- ✅ Check all your environment variables
- ✅ Create necessary configuration files
- ✅ Set up your database
- ✅ Configure Git hooks for code quality

If you see any errors, double-check your `.env.local` file.

---

### Step 5: Start Your App! 🎉

```bash
npm run dev
```

Your app is now running at:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/api/docs

**First steps**:
1. Visit http://localhost:5173
2. Click "Sign up" and use your admin email
3. You're now the admin! 👑

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
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRICE_ID_MONTHLY=price_xxx
   STRIPE_PRICE_ID_YEARLY=price_xxx
   ```

5. **Set up webhooks**:
   - In Stripe Dashboard → "Webhooks"
   - Add endpoint: `https://your-domain.com/api/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret

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

## 🚨 Troubleshooting

### "Missing environment variables" error
- Double-check your `.env.local` file
- Make sure there are no extra spaces or quotes
- Run `npm run validate-env` to see what's missing

### "Cannot connect to Supabase"
- Verify your Supabase project is active
- Check that all three Supabase keys are correct
- Try regenerating the service key if needed

### Google sign-in not working
- Ensure redirect URIs match exactly
- Check that Google provider is enabled in Supabase
- Verify your Google OAuth app is published (not in test mode)

---

## 🎯 Next Steps

Congratulations! Your SaaS is ready. Here's what to do next:

1. **Customize the UI** - Edit React components in `frontend/src`
2. **Add your features** - The boilerplate handles auth, now add your magic!
3. **Set up monitoring** - Add your Google Analytics ID and Sentry DSN
4. **Deploy** - Push to GitHub and deploy with one command

Need help? Check the README.md for technical details or open an issue on GitHub.

**Happy building! 🚀**