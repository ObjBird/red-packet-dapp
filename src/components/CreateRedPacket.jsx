import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

const CreateRedPacket = ({ wallet }) => {
  const [form, setForm] = useState({
    amount: '',
    count: '',
    message: '',
    type: '0'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    if (!wallet.connected) {
      setStatus('请先连接钱包');
      return;
    }

    if (!form.amount || !form.count) {
      setStatus('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setStatus('');
      
      const signer = await wallet.provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.createRedPacket(
        parseInt(form.count),
        form.message || '恭喜发财！',
        parseInt(form.type),
        { value: ethers.parseEther(form.amount) }
      );

      setStatus('交易提交中...');
      const receipt = await tx.wait();
      
      // 查找 PacketCreated 事件
      const createEvent = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'PacketCreated';
        } catch {
          return false;
        }
      });
      
      if (createEvent) {
        const parsedEvent = contract.interface.parseLog(createEvent);
        const packetId = parsedEvent.args.packetId.toString();
        setStatus(`红包创建成功！红包ID: ${packetId}`);
      } else {
        setStatus('红包创建成功！');
      }
      
      // 重置表单
      setForm({ amount: '', count: '', message: '', type: '0' });
    } catch (error) {
      console.error('创建失败:', error);
      setStatus('创建失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>发红包</h2>
      
      {status && <div className="status">{status}</div>}
      
      <div className="form-group">
        <label>红包类型</label>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
          <option value="0">等额红包</option>
          <option value="1">随机红包</option>
        </select>
      </div>

      <div className="form-group">
        <label>总金额 (ETH)</label>
        <input 
          type="number" 
          step="0.001"
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          placeholder="0.1"
        />
      </div>

      <div className="form-group">
        <label>红包个数</label>
        <input 
          type="number" 
          min="1"
          max="100"
          value={form.count}
          onChange={e => setForm({...form, count: e.target.value})}
          placeholder="5"
        />
      </div>

      <div className="form-group">
        <label>祝福语</label>
        <input 
          type="text" 
          maxLength="100"
          value={form.message}
          onChange={e => setForm({...form, message: e.target.value})}
          placeholder="恭喜发财！"
        />
      </div>

      <button 
        className="btn" 
        onClick={handleSubmit} 
        disabled={loading || !wallet.connected}
      >
        {loading ? '创建中...' : '发红包'}
      </button>
    </div>
  );
};

export default CreateRedPacket;
