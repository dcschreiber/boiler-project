import { render } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock environment variables
vi.mock('./services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
  },
}));

// Mock all the page components to avoid complex dependencies
vi.mock('./pages/HomePage', () => ({ default: () => <div>Home Page</div> }));
vi.mock('./pages/LoginPage', () => ({ default: () => <div>Login Page</div> }));
vi.mock('./pages/SignupPage', () => ({ default: () => <div>Signup Page</div> }));
vi.mock('./pages/ForgotPasswordPage', () => ({ default: () => <div>Forgot Password Page</div> }));
vi.mock('./pages/DashboardPage', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('./pages/ProfilePage', () => ({ default: () => <div>Profile Page</div> }));
vi.mock('./pages/AdminPage', () => ({ default: () => <div>Admin Page</div> }));
vi.mock('./pages/BillingPage', () => ({ default: () => <div>Billing Page</div> }));
vi.mock('./pages/PrivacyPage', () => ({ default: () => <div>Privacy Page</div> }));
vi.mock('./pages/TermsPage', () => ({ default: () => <div>Terms Page</div> }));
vi.mock('./pages/NotFoundPage', () => ({ default: () => <div>Not Found Page</div> }));

// Mock components
vi.mock('./components/Layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('./components/ProtectedRoute', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('./components/AdminRoute', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('./components/GoogleAnalytics', () => ({ GoogleAnalytics: () => null }));
vi.mock('./components/CookieConsent', () => ({ CookieConsent: () => null }));

// Mock auth store
vi.mock('./store/auth', () => ({
  useAuthStore: () => ({
    initialize: vi.fn(),
    user: null,
    loading: false,
  }),
}));

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
});

test('renders app without crashing', () => {
  const { container } = render(<AppWithRouter />);
  expect(container).toBeTruthy();
});

test('app component renders router structure', () => {
  const { container } = render(<AppWithRouter />);
  expect(container.firstChild).toBeTruthy();
}); 