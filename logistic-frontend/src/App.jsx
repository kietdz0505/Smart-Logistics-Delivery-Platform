import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import DriverRegister from './pages/DriverRegister';

import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/CustomerHistoryPage';

import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';

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
              path="history"
              element={<OrderHistory />}
            />

            <Route
              path="track/:orderId"
              element={<OrderTracking />}
            />
          </Route>

          {/* Driver */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="ROLE_DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;