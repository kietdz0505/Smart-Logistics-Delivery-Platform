import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

export default function AdminDrivers() {

    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState('ACTIVE');

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchDrivers();
    }, [tab, page]);

    const fetchDrivers = async () => {
        setLoading(true);

        try {
            const response =
                await axiosClient.get(
                    `/admin/drivers?status=${tab}&page=${page}`
                );

            setDrivers(response.data.content);
            setTotalPages(response.data.totalPages);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (driverId) => {

        const result = await Swal.fire({
            title: 'Duyệt tài xế?',
            text: 'Tài xế sẽ được phép đăng nhập hệ thống',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {

            await axiosClient.put(
                `/admin/drivers/${driverId}/activate`
            );

            Swal.fire({
                icon: 'success',
                title: 'Duyệt thành công',
                timer: 1200,
                showConfirmButton: false
            });

            fetchDrivers();

        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Thao tác thất bại'
            });
        }
    };

    const handleReject = async (driverId) => {

        const result = await Swal.fire({
            title: 'Từ chối tài xế?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {

            await axiosClient.put(
                `/admin/drivers/${driverId}/reject`
            );

            Swal.fire({
                icon: 'success',
                title: 'Đã từ chối',
                timer: 1200,
                showConfirmButton: false
            });

            fetchDrivers();

        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Thao tác thất bại'
            });
        }
    };

    const handleActivate = async (driverId) => {

        try {

            await axiosClient.put(
                `/admin/drivers/${driverId}/activate`
            );

            Swal.fire({
                icon: 'success',
                title: 'Đã kích hoạt lại',
                timer: 1200,
                showConfirmButton: false
            });

            fetchDrivers();

        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Thao tác thất bại'
            });
        }
    };

    const getStatusColor = () => {

        if (tab === 'ACTIVE')
            return 'bg-emerald-100 text-emerald-700';

        if (tab === 'PENDING')
            return 'bg-amber-100 text-amber-700';

        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-slate-800">
                    Quản lý tài xế
                </h2>

                <p className="text-slate-500 mt-1">
                    Quản lý tài khoản tài xế trong hệ thống
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-2 flex gap-2 w-fit">

                <button
                    onClick={() => {
                        setTab('ACTIVE');
                        setPage(0);
                    }}
                    className={`
                        px-5 py-2 rounded-2xl font-semibold transition
                        ${tab === 'ACTIVE'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }
                    `}
                >
                    Đang hoạt động
                </button>

                <button
                    onClick={() => {
                        setTab('PENDING');
                        setPage(0);
                    }}
                    className={`
                        px-5 py-2 rounded-2xl font-semibold transition
                        ${tab === 'PENDING'
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }
                    `}
                >
                    Chờ duyệt
                </button>

                <button
                    onClick={() => {
                        setTab('REJECTED');
                        setPage(0);
                    }}
                    className={`
                        px-5 py-2 rounded-2xl font-semibold transition
                        ${tab === 'REJECTED'
                            ? 'bg-red-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }
                    `}
                >
                    Đã từ chối
                </button>

            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">

                {loading ? (
                    <div className="flex justify-center py-16">
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
                ) : (
                    <table className="w-full">

                        <thead className="bg-slate-50">

                            <tr>
                                <th className="px-5 py-4 text-left">
                                    Họ tên
                                </th>

                                <th className="px-5 py-4 text-left">
                                    SĐT
                                </th>

                                <th className="px-5 py-4 text-left">
                                    Email
                                </th>

                                <th className="px-5 py-4 text-left">
                                    Loại xe
                                </th>

                                <th className="px-5 py-4 text-left">
                                    Biển số
                                </th>

                                <th className="px-5 py-4 text-center">
                                    Trạng thái
                                </th>

                                <th className="px-5 py-4 text-center">
                                    Hành động
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {drivers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="
                                            py-16
                                            text-center
                                            text-slate-500
                                        "
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}

                            {drivers.map(driver => (
                                <tr
                                    key={driver.id}
                                    className="
                                        border-t
                                        hover:bg-slate-50
                                        transition
                                    "
                                >
                                    <td className="px-5 py-4 font-semibold">
                                        {driver.fullName}
                                    </td>

                                    <td className="px-5 py-4">
                                        {driver.phone}
                                    </td>

                                    <td className="px-5 py-4">
                                        {driver.email}
                                    </td>

                                    <td className="px-5 py-4">
                                        {driver.vehicleType}
                                    </td>

                                    <td className="px-5 py-4">
                                        {driver.vehicleNumber}
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span
                                            className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-bold
                                                ${getStatusColor()}
                                            `}
                                        >
                                            {tab}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-center">

                                        <div className="flex justify-center gap-2">

                                            {tab === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(driver.id)
                                                        }
                                                        className="
                                                            px-4
                                                            py-2
                                                            rounded-xl
                                                            bg-emerald-50
                                                            text-emerald-600
                                                            font-semibold
                                                            hover:bg-emerald-100
                                                        "
                                                    >
                                                        Duyệt
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleReject(driver.id)
                                                        }
                                                        className="
                                                            px-4
                                                            py-2
                                                            rounded-xl
                                                            bg-red-50
                                                            text-red-600
                                                            font-semibold
                                                            hover:bg-red-100
                                                        "
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}

                                            {tab === 'ACTIVE' && (
                                                <button
                                                    onClick={() =>
                                                        handleReject(driver.id)
                                                    }
                                                    className="
                                                        px-4
                                                        py-2
                                                        rounded-xl
                                                        bg-red-50
                                                        text-red-600
                                                        font-semibold
                                                        hover:bg-red-100
                                                    "
                                                >
                                                    Khóa tài xế
                                                </button>
                                            )}

                                            {tab === 'REJECTED' && (
                                                <button
                                                    onClick={() =>
                                                        handleActivate(driver.id)
                                                    }
                                                    className="
                                                        px-4
                                                        py-2
                                                        rounded-xl
                                                        bg-indigo-50
                                                        text-indigo-600
                                                        font-semibold
                                                        hover:bg-indigo-100
                                                    "
                                                >
                                                    Kích hoạt lại
                                                </button>
                                            )}

                                        </div>

                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>
                )}

            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">

                    <button
                        disabled={page === 0}
                        onClick={() => setPage(prev => prev - 1)}
                        className="
                        px-4 py-2
                        rounded-xl
                        border
                        disabled:opacity-50
                    "
                    >
                        Trước
                    </button>

                    <span className="font-semibold">
                        Trang {page + 1} / {totalPages}
                    </span>

                    <button
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        className="
                            px-4 py-2
                            rounded-xl
                            border
                            disabled:opacity-50
                        "
                    >
                        Sau
                    </button>

                </div>
            )}

        </div>
    );
}