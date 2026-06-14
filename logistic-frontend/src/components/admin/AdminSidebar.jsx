import {
    LayoutDashboard,
    Truck,
    Users,
    Package,
    User,
    LogOut
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

export default function AdminSidebar({ logout }) {
    const menuClass = ({ isActive }) =>
        `
        flex items-center gap-3 px-4 py-3 rounded-xl
        transition font-medium
        ${
            isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
        }
    `;

    return (
        <aside
            className="
                w-72
                bg-white
                border-r
                border-slate-200
                p-4
                flex
                flex-col
            "
        >
            <div className="mb-8">
                <h2 className="text-lg font-black text-indigo-600">
                    ADMIN PANEL
                </h2>
            </div>

            <nav className="flex flex-col gap-2">
                <NavLink
                    to="/admin"
                    end
                    className={menuClass}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/drivers"
                    className={menuClass}
                >
                    <Truck size={18} />
                    Tài xế
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={menuClass}
                >
                    <Users size={18} />
                    Người dùng
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={menuClass}
                >
                    <Package size={18} />
                    Đơn hàng
                </NavLink>

                <NavLink
                    to="/admin/profile"
                    className={menuClass}
                >
                    <User size={18} />
                    Hồ sơ
                </NavLink>
            </nav>

            <div className="mt-auto">
                <button
                    onClick={logout}
                    className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        bg-red-50
                        text-red-600
                        hover:bg-red-100
                        transition
                    "
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
}