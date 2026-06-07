import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient'; 

export default function useWallet() {
    const [walletBalance, setWalletBalance] = useState(0);
    const [walletLoading, setWalletLoading] = useState(false);

    const fetchWalletBalance = useCallback(async () => {
        setWalletLoading(true);
        try {
            const response = await axiosClient.get('/wallets/balance');
            setWalletBalance(response.data.balance || 0);
        } catch (err) {
            console.error('Lỗi lấy ví tiền từ Backend:', err);
        } finally {
            setWalletLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWalletBalance();
    }, [fetchWalletBalance]);

    return { walletBalance, walletLoading, fetchWalletBalance };
}