import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';

import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';

import Swal from 'sweetalert2';

export default function AdminLayout() {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất?',
            text: 'Bạn có chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b'
        });

        if (!result.isConfirmed) return;

        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar logout={handleLogout} />

            <div className="flex-1 flex flex-col">
                <AdminHeader user={user} />

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}