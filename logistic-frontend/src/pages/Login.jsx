import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('/auth/login', { phone, password });
      login(response.data); // Lưu vào Context
      
      // Điều hướng dựa trên Vai trò (Role) trả về từ Backend
      if (response.data.role === 'ROLE_CUSTOMER') {
        navigate('/customer');
      } else if (response.data.role === 'ROLE_DRIVER') {
        navigate('/driver');
      }
    } catch (err) {
      setError(err.response?.data || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-2">Smart Logistic</h2>
        <p className="text-center text-gray-500 mb-8">Hệ thống điều phối thông minh</p>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">⚠️ {error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition">
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}