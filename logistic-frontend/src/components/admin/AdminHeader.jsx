import { Shield } from 'lucide-react';

export default function AdminHeader({ user }) {
    return (
        <header
            className="
                sticky
                top-0
                z-40
                bg-white
                border-b
                border-slate-200
                px-6
                py-4
                flex
                justify-between
                items-center
            "
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Shield className="w-6 h-6 text-indigo-600" />
                </div>

                <div>
                    <h1 className="text-xl font-black text-indigo-600">
                        SMART LOGISTIC
                    </h1>

                    <p className="text-xs text-slate-500">
                        Admin Dashboard
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                        {user?.fullName}
                    </p>

                    <p className="text-xs text-indigo-600 font-semibold">
                        Quản trị viên
                    </p>
                </div>

                <div
                    className="
                        w-10
                        h-10
                        rounded-full
                        overflow-hidden
                        bg-indigo-100
                        flex
                        items-center
                        justify-center
                    "
                >
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-bold text-indigo-600">
                            A
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}