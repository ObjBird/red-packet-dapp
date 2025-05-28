import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [wallet, setWallet] = useState({
    account: null,
    provider: null,
    connected: false
  });

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('请安装 MetaMask');
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      setWallet({ account, provider, connected: true });
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWallet({ account: null, provider: null, connected: false });
        } else {
          setWallet(prev => ({ ...prev, account: accounts[0] }));
        }
      });
    } catch (error) {
      console.error('连接失败:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ account: null, provider: null, connected: false });
  }, []);

  return { ...wallet, connect, disconnect };
};
