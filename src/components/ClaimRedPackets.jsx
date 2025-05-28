import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

const ClaimRedPackets = ({ wallet }) => {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const loadPackets = async () => {
    if (!wallet.connected) {
      setStatus('请先连接钱包');
      return;
    }

    try {
      setLoading(true);
      setStatus('');
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.provider);
      
      const total = await contract.getTotalPackets();
      if (total === 0n) {
        setPackets([]);
        return;
      }

      const start = Math.max(0, Number(total) - 10); // 最近10个
      const result = await contract.getPacketList(start, 10);
      
      const formattedPackets = [];
      for (let i = result.ids.length - 1; i >= 0; i--) {
        const packet = {
          id: Number(result.ids[i]),
          creator: result.creators[i],
          totalAmount: result.totalAmounts[i],
          remainCount: Number(result.remainCounts[i]),
          message: result.messages[i],
          isActive: result.isActives[i],
          packetType: Number(result.packetTypes[i])
        };
        
        // 检查用户是否已领取
        if (wallet.account) {
          try {
            packet.hasClaimed = await contract.hasClaimed(packet.id, wallet.account);
          } catch {
            packet.hasClaimed = false;
          }
        }
        
        formattedPackets.push(packet);
      }
      
      setPackets(formattedPackets);
    } catch (error) {
      console.error('加载失败:', error);
      setStatus('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const claimPacket = async (packetId) => {
    if (!wallet.connected || !wallet.account) {
      setStatus('请先连接钱包');
      return;
    }

    try {
      setStatus('');
      const signer = await wallet.provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.claimRedPacket(packetId);
      setStatus('抢红包中...');
      
      const receipt = await tx.wait();
      
      // 查找 PacketClaimed 事件
      const claimEvent = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'PacketClaimed';
        } catch {
          return false;
        }
      });
      
      if (claimEvent) {
        const parsedEvent = contract.interface.parseLog(claimEvent);
        const amount = ethers.formatEther(parsedEvent.args.amount);
        setStatus(`恭喜！成功领取 ${amount} ETH`);
      } else {
        setStatus('抢红包成功！');
      }
      
      // 刷新列表
      setTimeout(() => loadPackets(), 2000);
    } catch (error) {
      console.error('抢红包失败:', error);
      setStatus('抢红包失败: ' + error.message);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      loadPackets();
    }
  }, [wallet.connected]);

  const getButtonText = (packet) => {
    if (!packet.isActive) return '已结束';
    if (packet.remainCount === 0) return '已抢完';
    if (packet.creator.toLowerCase() === wallet.account?.toLowerCase()) return '自己的红包';
    if (packet.hasClaimed) return '已领取';
    return '抢红包';
  };

  const isButtonDisabled = (packet) => {
    return !packet.isActive || 
           packet.remainCount === 0 ||
           packet.creator.toLowerCase() === wallet.account?.toLowerCase() ||
           packet.hasClaimed;
  };

  return (
    <div className="card">
      <h2>抢红包</h2>
      
      {status && <div className="status">{status}</div>}
      
      <button className="btn" onClick={loadPackets} disabled={loading || !wallet.connected}>
        {loading ? '加载中...' : '刷新列表'}
      </button>

      <div className="packets-list">
        {packets.length === 0 && !loading ? (
          <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>
            暂无红包
          </p>
        ) : (
          packets.map(packet => (
            <div key={packet.id} className="packet-item">
              <div className="packet-header">
                <span className="packet-type">
                  {packet.packetType === 0 ? '等额' : '随机'}红包
                </span>
                <span>ID: {packet.id}</span>
              </div>
              
              <div className="packet-amount">
                {ethers.formatEther(packet.totalAmount)} ETH
              </div>
              
              <div className="packet-info">
                剩余: {packet.remainCount} 个 | 创建者: {packet.creator.slice(0, 6)}...{packet.creator.slice(-4)}
              </div>
              
              <div className="packet-message">
                {packet.message}
              </div>
              
              <button 
                className="claim-btn"
                onClick={() => claimPacket(packet.id)}
                disabled={isButtonDisabled(packet)}
              >
                {getButtonText(packet)}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClaimRedPackets;
