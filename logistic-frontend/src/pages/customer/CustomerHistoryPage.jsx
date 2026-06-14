import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import OrderCard from '../../components/customer/OrderCard';

import {
    History,
    LoaderCircle,
    Inbox,
    ArrowLeft
} from 'lucide-react';

export default function CustomerHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageLoading, setPageLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchHistoryOrders = useCallback(async (pageNumber = 0) => {
        try {
            if (pageNumber === 0) setInitialLoading(true);
            else setPageLoading(true);

            const response = await axiosClient.get('/orders/customer/history', {
                params: {
                    page: pageNumber,
                    size: 5
                }
            });

            const data = response.data;

            setOrders(data.content || []);
            setPage(data.number);
            setTotalPages(data.totalPages || 0);

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error(err);
        } finally {
            setInitialLoading(false);
            setPageLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistoryOrders(0);
    }, [fetchHistoryOrders]);

    const handlePageChange = (newPage) => {
        if (newPage === page) return;
        if (newPage < 0 || newPage >= totalPages) return;

        fetchHistoryOrders(newPage);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const maxVisible = 5;

        let start = Math.max(0, page - Math.floor(maxVisible / 2));
        let end = start + maxVisible;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(0, end - maxVisible);
        }

        const visiblePages = Array.from(
            { length: end - start },
            (_, i) => start + i
        );

        return (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">

                {/* PREV */}
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="
                    px-3 py-1.5 rounded-lg text-sm font-bold border
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:bg-slate-50
                "
                >
                    ← Trước
                </button>

                {/* FIRST PAGE (optional) */}
                {start > 0 && (
                    <>
                        <button
                            onClick={() => handlePageChange(0)}
                            className="px-3 py-1.5 rounded-lg text-sm font-bold border hover:bg-slate-50"
                        >
                            1
                        </button>
                        <span className="px-2">...</span>
                    </>
                )}

                {/* PAGE NUMBERS */}
                {visiblePages.map((p) => (
                    <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`
                        px-3 py-1.5 rounded-lg text-sm font-bold border transition
                        ${p === page
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }
                    `}
                    >
                        {p + 1}
                    </button>
                ))}

                {/* LAST PAGE (optional) */}
                {end < totalPages && (
                    <>
                        <span className="px-2">...</span>
                        <button
                            onClick={() => handlePageChange(totalPages - 1)}
                            className="px-3 py-1.5 rounded-lg text-sm font-bold border hover:bg-slate-50"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* NEXT */}
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="
                    px-3 py-1.5 rounded-lg text-sm font-bold border
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:bg-slate-50
                "
                >
                    Sau →
                </button>
            </div>
        );
    };
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoaderCircle className="w-7 h-7 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto p-6">

                <div className="bg-white p-6 rounded-2xl border shadow-sm">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-black text-slate-800">
                                Lịch sử đơn hàng
                            </h2>
                        </div>

                        <button
                            onClick={() => fetchHistoryOrders(0)}
                            className="px-3 py-2 text-sm border rounded-xl hover:bg-slate-50"
                        >
                            Làm mới
                        </button>
                    </div>

                    {/* EMPTY */}
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                            <Inbox className="w-10 h-10 text-slate-300" />
                            <p>Chưa có đơn hàng hoàn thành</p>
                        </div>
                    ) : (
                        <>
                            {pageLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map(order => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                </div>
                            )}

                            {/* PAGINATION */}
                            {renderPagination()}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}