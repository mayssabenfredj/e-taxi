
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/dashboard/Dashboard';
import { ConfirmAccount } from './pages/ConfirmAccount';
import './App.css';
import Index from './pages/Index';
import { AuthPage } from './pages/auth/AuthPage';
import { ForgotPasswordPage } from './pages/auth/ForgetPasswordPage';
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage';
import { DraftRequestsPage } from './pages/dashboard/transport/DraftRequestsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                 <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/confirm-account/:token" element={<ConfirmAccount />} />
                <Route path="/*" element={<Dashboard />} />

              </Routes>
              <Toaster />
            </div>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
