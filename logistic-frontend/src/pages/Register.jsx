import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

import {
  PackageCheck,
  User,
  Truck,
  Phone,
  Mail,
  Lock,
  UserRound
} from 'lucide-react';

import Swal from 'sweetalert2';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axiosClient.post(
        '/auth/register',
        formData
      );

      await Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công',
        text: 'Bạn có thể đăng nhập ngay bây giờ',
        confirmButtonColor: '#4f46e5'
      });

      navigate('/login');

    } catch (err) {

      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại',
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

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

        <p className="text-center text-gray-500 mb-6">
          Đăng ký khách hàng
        </p>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">

          <button
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-lg
              bg-indigo-600
              text-white
              font-semibold
              shadow-sm
            "
          >
            <User size={18} />
            Khách hàng
          </button>

          <button
            type="button"
            onClick={() => navigate('/register-driver')}
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-lg
              text-gray-600
              font-semibold
              hover:bg-white
              transition
            "
          >
            <Truck size={18} />
            Tài xế
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và tên
            </label>

            <div className="relative">
              <UserRound
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
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
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
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>

            <div className="relative">
              <Mail
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
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  border
                  border-gray-300
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                "
              />
            </div>
          </div>

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
            "
          >
            {loading
              ? 'Đang xử lý...'
              : 'Đăng ký khách hàng'}
          </button>

        </form>

        <div className="mt-6 text-center border-t border-gray-200 pt-5">
          <p className="text-sm text-gray-500">
            Đã có tài khoản?
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="
              mt-1
              text-indigo-600
              font-semibold
              hover:underline
            "
          >
            Đăng nhập
          </button>
        </div>

      </div>
    </div>
  );
}