// Contract ABI — extracted from Hardhat compilation artifacts
// This allows the frontend to work even before Hardhat compilation
const UcIDM_ABI = [
  // Phase 1: System Initialization
  "function joinCommittee(string memory _nodeId) external payable",
  "function generateCRS() external",
  "function initializeSystem() external",

  // Phase 2: Identity Registration
  "function registerIdentity(bytes32 _publicKeyHash) external payable",

  // Phase 3: Attribute Export
  "function recordAttributeExport(string memory _attributeType, bytes32 _attributeHash) external",

  // Phase 4: Credential Management
  "function issueCredential(bytes32 _commitment, bytes32 _zkProofHash, string memory _attributeType) external",

  // Phase 5: Service Access
  "function verifyAndGrantAccess(address _user, string memory _serviceName) external",

  // Phase 6: Revocation
  "function revokeCredential(address _user) external",

  // View functions
  "function owner() view returns (address)",
  "function systemInitialized() view returns (bool)",
  "function commonReferenceString() view returns (bytes32)",
  "function registrationFee() view returns (uint256)",
  "function getCommitteeSize() view returns (uint256)",
  "function getIdentity(address _user) view returns (tuple(bytes32 uidHash, bytes32 publicKeyHash, bool isRegistered, uint256 registrationBlock, uint256 registrationTime))",
  "function getCredential(address _user) view returns (tuple(bytes32 commitment, bytes32 zkProofHash, bytes32 authLink, bytes32 merkleRoot, bool isValid, uint256 issuanceTime, string attributeType))",
  "function isCredentialValid(address _user) view returns (bool)",
  "function getAccessHistory(address _user) view returns (tuple(address serviceProvider, bytes32 credentialUsed, bool accessGranted, uint256 accessTime, string serviceName)[])",
  "function getUserUID(address _user) view returns (bytes32)",
  "function verifyMerkleMembership(bytes32 _authLink) view returns (bool)",
  "function currentMerkleRoot() view returns (bytes32)",

  // Events
  "event SystemInitialized(bytes32 indexed crs, uint256 committeeSize, uint256 timestamp)",
  "event CommitteeNodeJoined(address indexed node, string nodeId, uint256 stake)",
  "event IdentityRegistered(address indexed user, bytes32 uidHash, bytes32 publicKeyHash, uint256 blockNumber)",
  "event AttributeExported(address indexed user, string attributeType, bytes32 attributeHash)",
  "event CredentialIssued(address indexed user, bytes32 commitment, bytes32 authLink, bytes32 merkleRoot)",
  "event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot)",
  "event AccessRequested(address indexed user, address indexed service, string serviceName)",
  "event AccessGranted(address indexed user, address indexed service, string serviceName)",
  "event AccessDenied(address indexed user, address indexed service, string reason)",
  "event IdentityRevoked(address indexed user, bytes32 authLink, uint256 timestamp)",
  "event CredentialInvalidated(address indexed user, bytes32 oldMerkleRoot, bytes32 newMerkleRoot)"
];

// Default contract address (updated after deployment)
const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Network configuration
const NETWORK_CONFIG = {
  chainId: 31337,
  chainName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
  currencySymbol: "ETH"
};

// Phase metadata
const PHASES = [
  {
    id: 0,
    title: "Overview",
    subtitle: "UcIDM Architecture",
    icon: "🏠",
    color: "#a855f7"
  },
  {
    id: 1,
    title: "System Initialization",
    subtitle: "Committee & CRS Setup",
    icon: "⚡",
    color: "#00f0ff"
  },
  {
    id: 2,
    title: "Identity Generation",
    subtitle: "Key Pairs & Registration",
    icon: "🔑",
    color: "#22c55e"
  },
  {
    id: 3,
    title: "Attribute Export",
    subtitle: "IDI Credential Transfer",
    icon: "📋",
    color: "#f59e0b"
  },
  {
    id: 4,
    title: "Credential Management",
    subtitle: "ZKP & Merkle Tree",
    icon: "🛡️",
    color: "#ec4899"
  },
  {
    id: 5,
    title: "Service Access",
    subtitle: "6G Transport Verification",
    icon: "🚗",
    color: "#06b6d4"
  },
  {
    id: 6,
    title: "Identity Revocation",
    subtitle: "Credential Invalidation",
    icon: "🚫",
    color: "#ef4444"
  }
];

export { UcIDM_ABI, DEFAULT_CONTRACT_ADDRESS, NETWORK_CONFIG, PHASES };
