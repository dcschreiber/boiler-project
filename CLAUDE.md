Project: SaaS Boilerplate
Goal: Production-ready starting point for SaaS applications

Architecture Decisions:
- Supabase: Free tier, includes auth, scales well, no vendor lock-in
- Cloud Run: Scales to zero, cost-effective, automatic HTTPS
- FastAPI: Modern, async, auto-docs, type-safe
- React+Vite: Fast development, popular, AI-friendly
- Monorepo: Simpler maintenance, shared types
- Docker Compose: Consistent dev environment

Code Standards:
- Clean, well-commented code
- TypeScript/Pydantic for type safety
- Meaningful variable names
- Reusable components
- Async/await patterns
- Error boundaries and proper error handling
- Consistent file structure

Common Commands:
- npm run setup (validates human tasks)
- npm run dev (starts everything)
- npm run test (all tests)
- npm run deploy (triggers deployment)
- npm run lint (code quality)
- npm run format (auto-format)

Development Workflow:
1. User completes SETUP_HUMAN_TASKS.md
2. Run npm run setup to validate
3. npm run dev starts Docker Compose
4. Frontend on :5173, Backend on :8000
5. Hot reload enabled everywhere
6. Pre-commit hooks ensure quality

Key Features:
- Google SSO + Email auth via Supabase
- Admin panel with user management
- i18n with RTL support
- Optional Stripe payments
- Rate limiting & security
- GDPR compliance ready
- Analytics & monitoring

File Structure:
frontend/
  src/
    components/ - Reusable UI components
    pages/ - Route page components  
    services/ - API calls and external services
    store/ - Zustand state management
    locales/ - Translation files
    hooks/ - Custom React hooks
    utils/ - Helper functions

backend/
  app/
    api/ - FastAPI route handlers
    core/ - Core functionality (auth, db, config)
    models/ - SQLAlchemy models
    schemas/ - Pydantic schemas
    services/ - Business logic

Testing Strategy:
- Vitest for frontend unit tests
- Pytest for backend unit tests
- Playwright for E2E tests
- 70% coverage target
- Tests run in CI/CD

Deployment:
- GitHub Actions on push to main
- Frontend → Cloud Storage + CDN
- Backend → Cloud Run
- Automatic SSL certificates
- Environment secrets in GitHub

Security:
- JWT tokens with refresh
- Rate limiting on all endpoints
- CORS properly configured
- Input validation everywhere
- SQL injection protection
- XSS protection in React

Performance:
- Code splitting
- Lazy loading routes
- Image optimization
- CDN for static assets
- Database connection pooling
- Async everything

Database Schema (Supabase):
- auth.users (managed by Supabase)
- public.profiles (user metadata)
- public.subscriptions (Stripe data)
- Row Level Security enabled

Environment Variables:
Required:
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- ADMIN_EMAIL
- JWT_SECRET

Optional:
- STRIPE_* (payment config)
- GOOGLE_ANALYTICS_ID
- SENTRY_DSN
- WHITELIST_MODE

Common Issues:
- Missing env vars → Check .env.local
- Auth not working → Verify Supabase setup
- CORS errors → Check allowed origins
- Build fails → Run npm install
- Docker issues → Restart Docker

Best Practices:
- Don't modify core auth logic
- Keep components small and focused
- Use TypeScript types everywhere
- Handle loading and error states
- Write tests for new features
- Document API changes
- Keep dependencies updated
- Work with git commits
