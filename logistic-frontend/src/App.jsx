import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DriverRegister from './pages/auth/DriverRegister';
import DriverLayout from './layouts/DriverLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import OrderTracking from './pages/customer/OrderTracking';
import OrderHistory from './pages/customer/CustomerHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/register-driver"
            element={<DriverRegister />}
          />


          {/* Customer */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="ROLE_CUSTOMER">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<CustomerDashboard />}
            />

            <Route
              path="profile"
              element={<ProfilePage />}
            />

            <Route
              path="history"
              element={<OrderHistory />}
            />
          </Route>

          <Route
            path="/customer/track/:orderId"
            element={
              <ProtectedRoute role="ROLE_CUSTOMER">
                <OrderTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute role="ROLE_DRIVER">
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<DriverDashboard />}
            />

            <Route
              path="profile"
              element={<ProfilePage />}
            />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="users"
              element={<AdminUsers />}
            />

            <Route
              path="drivers"
              element={<AdminDrivers />}
            />

            <Route
              path="orders"
              element={<AdminOrders />}
            />

            <Route
              path="profile"
              element={<ProfilePage />}
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;