import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TokenSupply from './pages/TokenSupply';
import ReserveRatio from './pages/ReserveRatio';
import TransactionMonitoring from './pages/TransactionMonitoring';
import ComplianceReports from './pages/ComplianceReports';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/Layout';

// Theme is now managed by ThemeContext

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BlockchainProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="token-supply" element={<TokenSupply />} />
                <Route path="reserve-ratio" element={<ReserveRatio />} />
                <Route path="transactions" element={<TransactionMonitoring />} />
                <Route path="compliance" element={<ComplianceReports />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </BlockchainProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
