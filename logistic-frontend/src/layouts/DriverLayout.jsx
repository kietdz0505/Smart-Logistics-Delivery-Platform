import { Outlet } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';
import useWallet from '../hooks/useWallet';

import DriverHeader from '../components/driver/DriverHeader';

import Swal from 'sweetalert2';

export default function DriverLayout() {
    const { user, logout } = useContext(AuthContext);

    const {
        walletBalance,
        fetchWalletBalance
    } = useWallet();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất?',
            text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b'
        });

        if (!result.isConfirmed) return;

        await Swal.fire({
            icon: 'success',
            title: 'Đã đăng xuất',
            timer: 1200,
            showConfirmButton: false
        });

        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DriverHeader
                user={user}
                walletBalance={walletBalance}
                onLogout={handleLogout}
            />

            <Outlet
                context={{
                    walletBalance,
                    fetchWalletBalance
                }}
            />
        </div>
    );
}