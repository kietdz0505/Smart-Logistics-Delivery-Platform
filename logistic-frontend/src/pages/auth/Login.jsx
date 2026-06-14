import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import {
  PackageCheck,
  Phone,
  Lock,
  User,
  Truck
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', {
        phone,
        password
      });

      login(response.data);

      await Swal.fire({
        icon: 'success',
        title: 'Đăng nhập thành công',
        timer: 1200,
        showConfirmButton: false
      });

      if (response.data.role === 'ROLE_CUSTOMER') {
        navigate('/customer');
      } else if (response.data.role === 'ROLE_DRIVER') {
        navigate('/driver');
      } else if (response.data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Đăng nhập thất bại',
        text:
          err.response?.data?.message ||
          err.response?.data ||
          'Vui lòng kiểm tra lại thông tin'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div
            className="
              w-16
              h-16
              rounded-2xl
              bg-indigo-100
              flex
              items-center
              justify-center
            "
          >
            <PackageCheck
              size={32}
              className="text-indigo-600"
            />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-2">
          Smart Logistic
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Hệ thống điều phối thông minh
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số điện thoại
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  transition
                  focus:ring-2
                  focus:ring-indigo-500
                  focus:border-indigo-500
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  transition
                  focus:ring-2
                  focus:ring-indigo-500
                  focus:border-indigo-500
                "
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              font-bold
              py-3
              rounded-xl
              shadow-lg
              transition
              disabled:opacity-70
              disabled:cursor-not-allowed
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {loading ? (
              <>
                <div
                  className="
                    w-4
                    h-4
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    animate-spin
                  "
                />
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Register Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">

          <p className="text-center text-gray-600 text-sm mb-4">
            Chưa có tài khoản?
          </p>

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-xl
                border
                border-indigo-600
                text-indigo-600
                font-semibold
                hover:bg-indigo-50
                transition
              "
            >
              <User size={18} />
              <span>Khách hàng</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/register-driver')}
              className="
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-xl
                bg-emerald-600
                text-white
                font-semibold
                hover:bg-emerald-700
                transition
              "
            >
              <Truck size={18} />
              <span>Tài xế</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}