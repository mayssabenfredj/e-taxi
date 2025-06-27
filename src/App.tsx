import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './shareds/contexts/ThemeContext';
import { AuthProvider } from './shareds/contexts/AuthContext';
import { LanguageProvider } from './shareds/contexts/LanguageContext';
import { GoogleMapsProvider } from './shareds/contexts/GoogleMapsContext';
import { Toaster } from './shareds/components/ui/sonner';
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { ConfirmAccount } from './features/auth/pages/ConfirmAccount';
import './App.css';
import Index from './Index';
import { AuthPage } from './features/auth/pages/AuthPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgetPasswordPage';
import { UpdatePasswordPage } from './features/auth/pages/UpdatePasswordPage';
import { LandingPage } from './features/leanding/pages/LandingPage';

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
