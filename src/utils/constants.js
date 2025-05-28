// 合约配置
export const CONTRACT_ADDRESS = '0xCbdC0Cc887d97a7dfF87737419fec04ff61caE1E';

export const CONTRACT_ABI = [
  "function createRedPacket(uint256 _count, string memory _message, uint8 _packetType) external payable returns (uint256)",
  "function claimRedPacket(uint256 _packetId) external",
  "function getPacketInfo(uint256 _packetId) external view returns (address creator, uint256 totalAmount, uint256 remainAmount, uint256 totalCount, uint256 remainCount, string memory message, bool isActive, uint256 createTime, uint8 packetType)",
  "function hasClaimed(uint256 _packetId, address _user) external view returns (bool)",
  "function getTotalPackets() external view returns (uint256)",
  "function getPacketList(uint256 _start, uint256 _limit) external view returns (uint256[] memory ids, address[] memory creators, uint256[] memory totalAmounts, uint256[] memory remainCounts, string[] memory messages, bool[] memory isActives, uint8[] memory packetTypes)",
  "event PacketCreated(uint256 indexed packetId, address indexed creator, uint256 totalAmount, uint256 count, string message, uint8 packetType)",
  "event PacketClaimed(uint256 indexed packetId, address indexed claimer, uint256 amount)"
];

export const PACKET_TYPES = {
  EQUAL: 0,
  RANDOM: 1
};
