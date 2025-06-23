import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/dashboard/Dashboard';
import { ConfirmAccount } from './pages/ConfirmAccount';
import './App.css';
import Index from './pages/Index';
import { AuthPage } from './pages/auth/AuthPage';
import { ForgotPasswordPage } from './pages/auth/ForgetPasswordPage';
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <GoogleMapsProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/update-password/:token" element={<UpdatePasswordPage />} />
                <Route path="/confirm-account/:token" element={<ConfirmAccount />} />
                
                {/* Protected routes - handled by Dashboard component */}
                <Route path="/*" element={<Dashboard />} />
              </Routes>
              <Toaster />
            </div>
            </Router>
            </GoogleMapsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
