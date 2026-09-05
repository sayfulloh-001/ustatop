import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';

import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Masters } from './pages/Masters';
import { MasterDetail } from './pages/MasterDetail';
import { Market } from './pages/Market';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { BecomeMaster } from './pages/BecomeMaster';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMasters } from './pages/admin/AdminMasters';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminUsers } from './pages/admin/AdminUsers';
import { PaymentPage } from './pages/PaymentPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            {/* Light mode: bg-[#F5F6FA], Dark mode: bg-slate-950 */}
            <div className="min-h-screen flex flex-col bg-[#F5F6FA] dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
              {/* Top Navigation */}
              <Header />

              {/* Main Content Area */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  {/* Public App Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/masters" element={<Masters />} />
                  <Route path="/masters/:id" element={<MasterDetail />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/market/:id" element={<ProductDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/become-master" element={<BecomeMaster />} />
                  <Route path="/payment" element={<PaymentPage />} />

                  {/* Admin Panel Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="masters" element={<AdminMasters />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Mobile Bottom Navigation */}
              <BottomNav />

              {/* Global Auth Modal */}
              <AuthModal />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
