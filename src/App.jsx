import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import WalletConnection from './components/WalletConnection';
import CreateRedPacket from './components/CreateRedPacket';
import ClaimRedPackets from './components/ClaimRedPackets';
import './styles/app.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('create');
  const wallet = useWallet();

  return (
    <div className="container">
      <div className="header">
        <h1>🧧 红包 DApp</h1>
        <p>基于以太坊的去中心化红包系统</p>
      </div>

      <WalletConnection 
        wallet={wallet}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          发红包
        </button>
        <button 
          className={`tab ${activeTab === 'claim' ? 'active' : ''}`}
          onClick={() => setActiveTab('claim')}
        >
          抢红包
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'create' ? (
          <CreateRedPacket wallet={wallet} />
        ) : (
          <ClaimRedPackets wallet={wallet} />
        )}
      </div>
    </div>
  );
};

export default App;
