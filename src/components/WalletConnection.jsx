import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletConnection = ({ wallet, onConnect, onDisconnect }) => {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const getBalance = async () => {
      if (wallet.connected && wallet.provider && wallet.account) {
        try {
          const bal = await wallet.provider.getBalance(wallet.account);
          setBalance(ethers.formatEther(bal));
        } catch (error) {
          console.error('获取余额失败:', error);
        }
      }
    };
    getBalance();
  }, [wallet]);

  if (!wallet.connected) {
    return (
      <div className="wallet-info">
        <button className="btn" onClick={onConnect}>
          连接钱包
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <p><strong>地址:</strong> {wallet.account?.slice(0, 6)}...{wallet.account?.slice(-4)}</p>
      <p><strong>余额:</strong> {balance} ETH</p>
      <div className="wallet-buttons">
        <button className="btn disconnect-btn" onClick={onDisconnect}>
          断开连接
        </button>
      </div>
    </div>
  );
};

export default WalletConnection;
