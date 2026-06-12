import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

import {
    PackageCheck,
    User,
    Phone,
    Mail,
    Lock,
    Car,
    Truck
} from 'lucide-react';

import Swal from 'sweetalert2';

export default function DriverRegister() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        vehicleNumber: '',
        vehicleType: ''
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

            const response = await axiosClient.post(
                '/auth/register-driver',
                formData
            );

            await Swal.fire({
                icon: 'success',
                title: 'Đăng ký thành công',
                text:
                    response.data?.message ||
                    'Tài khoản đang chờ xét duyệt',
                confirmButtonColor: '#059669'
            });

            navigate('/login');

        } catch (err) {

            Swal.fire({
                icon: 'error',
                title: 'Đăng ký thất bại',
                text:
                    err.response?.data?.message ||
                    err.response?.data ||
                    'Vui lòng thử lại'
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">

                <div className="flex justify-center mb-4">
                    <div
                        className="
              w-16
              h-16
              rounded-2xl
              bg-emerald-100
              flex
              items-center
              justify-center
            "
                    >
                        <PackageCheck
                            size={32}
                            className="text-emerald-600"
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-center text-emerald-600 mb-2">
                    Smart Logistic
                </h2>

                <p className="text-center text-gray-500 mb-6">
                    Đăng ký tài xế giao hàng
                </p>

                <div className="flex bg-slate-100 rounded-xl p-1 mb-6">

                    <button
                        type="button"
                        onClick={() => navigate('/register')}
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
                        <User size={18} />
                        <span>Khách hàng</span>
                    </button>

                    <button
                        className="
      flex-1
      flex
      items-center
      justify-center
      gap-2
      py-2.5
      rounded-lg
      bg-emerald-600
      text-white
      font-semibold
      shadow-sm
    "
                    >
                        <Truck size={18} />
                        <span>Tài xế</span>
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Họ và tên
                        </label>

                        <div className="relative">
                            <User
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
                  transition
                  focus:ring-2
                  focus:ring-emerald-500
                "
                            />
                        </div>
                    </div>

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
                  transition
                  focus:ring-2
                  focus:ring-emerald-500
                "
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  transition
                  focus:ring-2
                  focus:ring-emerald-500
                "
                            />
                        </div>
                    </div>

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
                  transition
                  focus:ring-2
                  focus:ring-emerald-500
                "
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Biển số xe
                        </label>

                        <div className="relative">
                            <Car
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
                                name="vehicleNumber"
                                required
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                placeholder="59A1-12345"
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
                  focus:ring-emerald-500
                "
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Loại xe
                        </label>

                        <select
                            name="vehicleType"
                            required
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="
                w-full
                px-4
                py-3
                border
                border-gray-300
                rounded-xl
                outline-none
                transition
                focus:ring-2
                focus:ring-emerald-500
              "
                        >
                            <option value="">
                                -- Chọn loại xe --
                            </option>

                            <option value="MOTORBIKE">
                                Xe máy
                            </option>

                            <option value="CAR">
                                Ô tô
                            </option>

                            <option value="TRUCK">
                                Xe tải
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="
              w-full
              bg-emerald-600
              hover:bg-emerald-700
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
                                Đang xử lý...
                            </>
                        ) : (
                            'Đăng ký tài xế'
                        )}
                    </button>

                </form>

                <div className="mt-5 text-center text-sm text-gray-500">
                    Tài khoản sẽ được quản trị viên xét duyệt trước khi hoạt động
                </div>

                <div className="mt-6 border-t border-gray-200 pt-5 text-center">
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