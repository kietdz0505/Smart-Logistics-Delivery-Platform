import {
    useEffect,
    useState
} from 'react';

import axiosClient from '../../api/axiosClient';

import {
    Users,
    Truck,
    Package,
    Wallet
} from 'lucide-react';

export default function AdminDashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response =
                await axiosClient.get('/admin/dashboard');

            setDashboard(response.data);

        } catch (error) {
            console.error(
                'Lỗi tải dashboard:',
                error
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div
                    className="
                        w-10
                        h-10
                        border-4
                        border-indigo-500
                        border-t-transparent
                        rounded-full
                        animate-spin
                    "
                />
            </div>
        );
    }

    const revenue =
        Number(dashboard?.totalRevenue || 0);

    const stats = [
        {
            title: 'Khách hàng',
            value: dashboard?.totalUsers || 0,
            icon: Users,
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            iconBg: 'bg-blue-100'
        },
        {
            title: 'Tài xế',
            value: dashboard?.totalDrivers || 0,
            icon: Truck,
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            iconBg: 'bg-orange-100'
        },
        {
            title: 'Đơn hàng',
            value: dashboard?.totalOrders || 0,
            icon: Package,
            textColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            iconBg: 'bg-emerald-100'
        }
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-800">
                    Dashboard
                </h2>

                <p className="text-slate-500">
                    Tổng quan hệ thống Smart Logistic
                </p>
            </div>

            {/* Revenue Card */}
            <div
                className="
                    bg-gradient-to-r
                    from-violet-600
                    to-indigo-600
                    rounded-3xl
                    p-8
                    text-white
                    shadow-xl
                "
            >
                <div className="flex justify-between items-center">

                    <div>

                        <p className="uppercase tracking-widest text-xs font-bold text-violet-100">
                            Tổng doanh thu
                        </p>

                        <h2 className="mt-2 text-5xl font-black whitespace-nowrap">
                            {(revenue / 1000000).toFixed(1)} triệu
                        </h2>

                        <p className="mt-3 text-violet-100">
                            {revenue.toLocaleString('vi-VN')} ₫
                        </p>

                    </div>

                    <div className="p-5 rounded-3xl bg-white/20">
                        <Wallet className="w-12 h-12" />
                    </div>

                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {stats.map((item) => {

                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className={`
                                ${item.bgColor}
                                rounded-3xl
                                border
                                border-white
                                p-6
                                shadow-sm
                            `}
                        >
                            <div className="flex justify-between items-start">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        {item.title}
                                    </p>

                                    <h3
                                        className={`
                                            mt-2
                                            text-4xl
                                            font-black
                                            ${item.textColor}
                                        `}
                                    >
                                        {item.value}
                                    </h3>

                                </div>

                                <div
                                    className={`
                                        p-3
                                        rounded-2xl
                                        ${item.iconBg}
                                    `}
                                >
                                    <Icon
                                        className={`
                                            w-6
                                            h-6
                                            ${item.textColor}
                                        `}
                                    />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Order Status */}
                <div
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        p-6
                        shadow-sm
                    "
                >
                    <h3 className="font-black text-slate-800 mb-5">
                        Trạng thái đơn hàng
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                        <StatusCard
                            label="Pending"
                            value={dashboard?.pendingOrders}
                            color="text-amber-600"
                        />

                        <StatusCard
                            label="Accepted"
                            value={dashboard?.acceptedOrders}
                            color="text-blue-600"
                        />

                        <StatusCard
                            label="Delivering"
                            value={dashboard?.deliveringOrders}
                            color="text-indigo-600"
                        />

                        <StatusCard
                            label="Completed"
                            value={dashboard?.completedOrders}
                            color="text-emerald-600"
                        />

                        <StatusCard
                            label="Cancelled"
                            value={dashboard?.cancelledOrders}
                            color="text-red-600"
                        />

                        <StatusCard
                            label="Failed"
                            value={dashboard?.failedOrders}
                            color="text-slate-600"
                        />

                    </div>
                </div>

                {/* Driver Stats */}
                <div
                    className="
                        bg-white
                        rounded-3xl
                        border
                        border-slate-200
                        p-6
                        shadow-sm
                    "
                >
                    <h3 className="font-black text-slate-800 mb-5">
                        Thống kê tài xế
                    </h3>

                    <div className="grid grid-cols-2 gap-4">

                        <StatusCard
                            label="Tổng tài xế"
                            value={dashboard?.totalDrivers}
                            color="text-orange-600"
                        />

                        <StatusCard
                            label="Chờ duyệt"
                            value={dashboard?.pendingDrivers}
                            color="text-amber-600"
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}

function StatusCard({
    label,
    value,
    color
}) {
    return (
        <div
            className="
                bg-slate-50
                rounded-2xl
                p-4
                text-center
            "
        >
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p
                className={`
                    mt-2
                    text-3xl
                    font-black
                    ${color}
                `}
            >
                {value ?? 0}
            </p>
        </div>
    );
}