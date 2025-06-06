# 🚀 SaaS Boilerplate

A production-ready SaaS starter kit with React, FastAPI, Supabase, and Google Cloud Run. Get your SaaS up and running in minutes, not months!

## ✨ Features

### Core Features
- 🔐 **Authentication**: Google SSO + Email/Password with Supabase Auth
- 👥 **User Management**: Admin panel, user roles, profile management
- 🌍 **Multi-language**: i18n ready with RTL support
- 💳 **Payments**: Optional Stripe integration for subscriptions
- 📊 **Analytics**: Google Analytics & Sentry error tracking
- 🚀 **Production Ready**: Docker, CI/CD, monitoring, and scaling

### Technical Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: FastAPI, Python 3.11, Async SQLAlchemy, Pydantic
- **Database**: PostgreSQL via Supabase (free tier friendly)
- **Deployment**: Google Cloud Run (scales to zero)
- **Development**: Docker Compose, Hot reload, Pre-commit hooks

### Security & Compliance
- 🔒 Rate limiting & CORS protection
- 🍪 GDPR-ready cookie consent
- 📜 Privacy Policy & Terms templates
- 🛡️ JWT authentication with refresh tokens

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/dcschreiber/boiler-project.git
cd boiler-project

# Install dependencies
npm install

# Follow setup wizard
# Complete SETUP_HUMAN_TASKS.md first!

# Run setup validation
npm run setup

# Start development
npm run dev
```

Your app will be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## 📁 Project Structure

```
.
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand state management
│   │   └── locales/      # i18n translations
│   └── public/           # Static assets
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   └── schemas/      # Pydantic schemas
│   └── tests/            # Backend tests
├── scripts/              # Automation scripts
├── docs/                 # Documentation
└── .github/              # GitHub Actions workflows
```

## 🛠️ Customization Guide

### Adding a New Language

1. Create translation file: `frontend/src/locales/[lang]/common.json`
2. Import in `frontend/src/i18n.ts`:
```typescript
import heTranslations from './locales/he/common.json'

export const resources = {
  en: { common: enTranslations },
  he: { common: heTranslations }, // Add this
}
```

3. The language switcher will appear automatically!

### Removing Stripe Integration

If you don't need payments:

1. Set `STRIPE_ENABLED=false` in `.env.local`
2. Remove these files:
   - `frontend/src/pages/BillingPage.tsx`
   - `backend/app/api/billing.py`
   - `backend/app/services/stripe.py`
3. Remove billing routes from `frontend/src/App.tsx`

### Adding New Features

1. **Frontend**: Create components in `frontend/src/components/`
2. **Backend**: Add endpoints in `backend/app/api/`
3. **Database**: Use Supabase dashboard or migrations
4. **State**: Use Zustand stores in `frontend/src/store/`

## 🚀 Deployment

### Google Cloud Run (Recommended)

```bash
# One-time setup
gcloud init
gcloud services enable run.googleapis.com

# Deploy
git push origin main  # GitHub Actions handles the rest!
```

Automatic deployment features:
- Builds and deploys on push to main
- Frontend → Cloud Storage + CDN
- Backend → Cloud Run (scales to zero)
- Costs < $5/month for small apps

### Manual Deployment

See `.github/workflows/deploy.yml` for the deployment steps.

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend

# E2E tests
npm run test:e2e
```

## 📚 Documentation

- **For Humans**: See [SETUP_HUMAN_TASKS.md](SETUP_HUMAN_TASKS.md) for setup guide
- **For AI**: See technical details below

---

# 🤖 AI Technical Reference

## Architecture Decisions

### Why These Technologies?

**Supabase**: 
- Free tier includes auth, database, and realtime
- Scales automatically
- Built-in Row Level Security
- No vendor lock-in (it's just Postgres)

**FastAPI**:
- Modern Python with async support
- Auto-generated API documentation
- Type safety with Pydantic
- High performance

**Google Cloud Run**:
- Scales to zero (pay only when used)
- Automatic HTTPS
- Simple deployment
- Integrates with GitHub Actions

**React + Vite**:
- Fast development experience
- Modern tooling
- Large ecosystem
- AI coding tools work well with it

## Code Patterns

### Frontend State Management
```typescript
// Zustand store pattern
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  login: async (email, password) => {
    const user = await api.login(email, password)
    set({ user })
  },
}))
```

### Backend API Pattern
```python
@router.post("/users", response_model=User)
async def create_user(
    user: UserCreate,
    db: Database = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Admin-only endpoint with automatic validation
    return await create_user_in_db(db, user)
```

### Authentication Flow
1. User clicks "Login with Google"
2. Redirected to Google OAuth
3. Google redirects back with code
4. Supabase exchanges code for user session
5. Frontend stores session, backend validates JWT

### Database Schema
```sql
-- Managed by Supabase
auth.users (
  id uuid primary key,
  email text unique,
  created_at timestamp
)

-- Custom tables
public.profiles (
  id uuid references auth.users primary key,
  name text,
  is_admin boolean default false,
  language text default 'en',
  stripe_customer_id text
)

public.subscriptions (
  id uuid primary key,
  user_id uuid references auth.users,
  stripe_subscription_id text,
  status text,
  current_period_end timestamp
)
```

## Environment Variables

### Required
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_KEY`: Private service key
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret
- `ADMIN_EMAIL`: First admin user email
- `JWT_SECRET`: Random 32+ character string

### Optional
- `STRIPE_*`: Payment configuration
- `GOOGLE_ANALYTICS_ID`: Analytics tracking
- `SENTRY_DSN`: Error tracking
- `WHITELIST_MODE`: Restrict signups

## API Endpoints

### Public
- `GET /api/health` - Health check
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/reset-password` - Password reset

### Authenticated
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/billing/subscription` - Current subscription

### Admin Only
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Dashboard statistics

## Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Testing
npm test                 # Run all tests
npm run test:coverage    # With coverage

# Code Quality
npm run lint            # Lint all code
npm run format          # Format all code

# Deployment
npm run build           # Build for production
npm run deploy          # Deploy to Cloud Run

# Utilities
npm run setup           # Validate setup
npm run validate-env    # Check env vars
```

## Performance Optimizations

1. **Frontend**:
   - Code splitting with React.lazy
   - Image optimization
   - Bundle size monitoring
   - CDN for static assets

2. **Backend**:
   - Async database queries
   - Redis caching (optional)
   - Query optimization
   - Rate limiting

3. **Database**:
   - Indexes on foreign keys
   - Row Level Security
   - Connection pooling
   - Query analysis

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Pydantic on backend
3. **Use HTTPS always** - Enforced by Cloud Run
4. **Rate limit APIs** - Configured in backend
5. **Keep dependencies updated** - Dependabot enabled

## Monitoring & Debugging

1. **Logs**: Cloud Run logs in GCP Console
2. **Errors**: Sentry dashboard
3. **Analytics**: Google Analytics
4. **Performance**: Cloud Run metrics
5. **Database**: Supabase dashboard

## Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - use this for anything!

---

Built with ❤️ to help developers ship faster.