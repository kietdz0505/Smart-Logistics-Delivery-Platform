import { useEffect, useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

import {
    User,
    Mail,
    Phone,
    Camera,
    Save,
    PackageCheck
} from 'lucide-react';

export default function ProfilePage() {
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        avatarUrl: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axiosClient.get('/users/me');

            setFormData({
                fullName: response.data.fullName || '',
                email: response.data.email || '',
                avatarUrl: response.data.avatarUrl || '',
                phone: response.data.phone || ''
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải thông tin người dùng'
            });
        } finally {
            setPageLoading(false);
        }
    };


    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append(
            "upload_preset",
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data
            }
        );

        const result = await res.json();
        return result.secure_url;
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);

        setFormData((prev) => ({
            ...prev,
            avatarUrl: URL.createObjectURL(file) // preview local
        }));
    };
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };


const handleUpdate = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);

        let avatarUrl = formData.avatarUrl;

        if (avatarFile) {
            avatarUrl = await uploadToCloudinary(avatarFile);
        }

        await axiosClient.patch('/users/me', {
            fullName: formData.fullName,
            email: formData.email,
            avatarUrl
        });

        const meRes = await axiosClient.get('/users/me');

        setFormData({
            fullName: meRes.data.fullName || '',
            email: meRes.data.email || '',
            avatarUrl: meRes.data.avatarUrl || '',
            phone: meRes.data.phone || ''
        });

        setAvatarFile(null);

        window.dispatchEvent(new Event("user-updated"));

        Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công',
            timer: 1500,
            showConfirmButton: false
        });

    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại'
        });
    } finally {
        setLoading(false);
    }
};

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-lg font-semibold text-gray-600">
                    Đang tải thông tin...
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    <div className="bg-indigo-600 px-8 py-8 text-center">

                        <div className="flex justify-center mb-4">
                            <div className="
                                w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center
                            ">
                                <User size={32} className="text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white">
                            Hồ sơ cá nhân
                        </h1>

                        <p className="text-indigo-100 mt-2">
                            Quản lý thông tin tài khoản của bạn
                        </p>

                    </div>

                    <div className="p-8">

                        {/* AVATAR */}
                        <div className="flex flex-col items-center mb-8">

                            <div className="relative">

                                <img
                                    src={
                                        formData.avatarUrl ||
                                        'https://ui-avatars.com/api/?name=User'
                                    }
                                    alt="Avatar"
                                    className="
                                        w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg
                                    "
                                />

                                {/* CAMERA ICON (CLICK TO UPLOAD) */}
                                <div
                                    className="
                                        absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md
                                    "
                                    onClick={openFilePicker}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Camera size={18} className="text-white" />
                                </div>

                                {/* HIDDEN INPUT */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                            </div>

                            {uploadingAvatar && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Đang upload ảnh...
                                </p>
                            )}

                        </div>

                        {/* FORM */}
                        <form onSubmit={handleUpdate} className="space-y-5">

                            {/* FULLNAME */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Họ và tên
                                </label>

                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value
                                            })
                                        }
                                        className="
                                            w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500
                                        "
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value
                                            })
                                        }
                                        className="
                                            w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500
                                        "
                                    />
                                </div>
                            </div>

                            {/* AVATAR URL fallback */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Avatar URL
                                </label>

                                <div className="relative">
                                    <Camera
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        name="avatarUrl"
                                        value={formData.avatarUrl}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                avatarUrl: e.target.value
                                            })
                                        }
                                        className="
                                            w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500
                                        "
                                    />
                                </div>
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Số điện thoại
                                </label>

                                <div className="relative">
                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={formData.phone}
                                        readOnly
                                        className="
                                            w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-100 rounded-xl text-gray-500
                                        "
                                    />
                                </div>
                            </div>

                            {/* SAVE */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2
                                "
                            >
                                <Save size={18} />
                                {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                            </button>

                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
}