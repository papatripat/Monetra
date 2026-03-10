import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import TransactionList from './pages/Transactions/TransactionList';
import BudgetPage from './pages/Budget/BudgetPage';

// Redirect authenticated users away from auth pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes (Guest Only) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/budget" element={<BudgetPage />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
