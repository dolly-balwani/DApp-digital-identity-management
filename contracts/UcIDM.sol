// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title UcIDM — User-Centric Identity Management for 6G Networks
 * @notice Implements a blockchain-based privacy-preserving identity management system
 *         using concepts from ZKP and Sparse Merkle Trees for 6G autonomous transport.
 * @dev This contract covers all 6 phases of the UcIDM lifecycle:
 *      Phase 1: System Initialization (Committee & CRS)
 *      Phase 2: Digital Identity Generation
 *      Phase 3: Identity Attribute Export (off-chain, tracked here)
 *      Phase 4: Attribute Credential Management & ZKP Verification
 *      Phase 5: Service Access Verification
 *      Phase 6: Identity Revocation
 */
contract UcIDM {

    // =========================================================================
    //                          STATE VARIABLES
    // =========================================================================

    address public owner;
    bool public systemInitialized;
    bytes32 public commonReferenceString; // CRS for ZKP verification
    uint256 public committeeThreshold;    // Minimum committee size
    uint256 public registrationFee;       // Anti-Sybil fee in wei

    // =========================================================================
    //                             STRUCTS
    // =========================================================================

    /// @notice Represents a committee node in the 6G network
    struct CommitteeNode {
        address nodeAddress;
        uint256 stakedAmount;
        uint256 joinedAt;
        bool isActive;
        string nodeId;
    }

    /// @notice Represents a user's digital identity (Phase 2)
    struct DigitalIdentity {
        bytes32 uidHash;          // Hash of the unique identifier
        bytes32 publicKeyHash;    // Hash of user's public key
        bool isRegistered;
        uint256 registrationBlock;
        uint256 registrationTime;
    }

    /// @notice Represents an attribute credential (Phase 4)
    struct AttributeCredential {
        bytes32 commitment;       // Cryptographic commitment to attribute
        bytes32 zkProofHash;      // Hash of the ZK proof
        bytes32 authLink;         // Authentication link (Auth_attr)
        bytes32 merkleRoot;       // Sparse Merkle Tree root at issuance
        bool isValid;
        uint256 issuanceTime;
        string attributeType;     // e.g., "drivers_license"
    }

    /// @notice Represents a service access record (Phase 5)
    struct AccessRecord {
        address serviceProvider;
        bytes32 credentialUsed;
        bool accessGranted;
        uint256 accessTime;
        string serviceName;
    }

    // =========================================================================
    //                            MAPPINGS
    // =========================================================================

    mapping(address => CommitteeNode) public committeeNodes;
    address[] public committeeList;

    mapping(address => DigitalIdentity) public identities;
    address[] public registeredUsers;

    mapping(address => AttributeCredential) public credentials;
    mapping(address => AccessRecord[]) public accessHistory;

    // Sparse Merkle Tree simulation
    mapping(bytes32 => bool) public merkleLeaves;   // leaf => exists
    bytes32 public currentMerkleRoot;

    // =========================================================================
    //                             EVENTS
    // =========================================================================

    // Phase 1 Events
    event SystemInitialized(bytes32 indexed crs, uint256 committeeSize, uint256 timestamp);
    event CommitteeNodeJoined(address indexed node, string nodeId, uint256 stake);
    event CommitteeNodeRemoved(address indexed node);
    event CRSGenerated(bytes32 indexed crs);

    // Phase 2 Events
    event IdentityRegistered(
        address indexed user,
        bytes32 uidHash,
        bytes32 publicKeyHash,
        uint256 blockNumber
    );

    // Phase 3 Events
    event AttributeExported(address indexed user, string attributeType, bytes32 attributeHash);

    // Phase 4 Events
    event CredentialIssued(
        address indexed user,
        bytes32 commitment,
        bytes32 authLink,
        bytes32 merkleRoot
    );
    event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);

    // Phase 5 Events
    event AccessRequested(address indexed user, address indexed service, string serviceName);
    event AccessGranted(address indexed user, address indexed service, string serviceName);
    event AccessDenied(address indexed user, address indexed service, string reason);

    // Phase 6 Events
    event IdentityRevoked(address indexed user, bytes32 authLink, uint256 timestamp);
    event CredentialInvalidated(address indexed user, bytes32 oldMerkleRoot, bytes32 newMerkleRoot);

    // =========================================================================
    //                            MODIFIERS
    // =========================================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "UcIDM: caller is not the owner");
        _;
    }

    modifier onlyCommittee() {
        require(
            committeeNodes[msg.sender].isActive,
            "UcIDM: caller is not an active committee node"
        );
        _;
    }

    modifier systemReady() {
        require(systemInitialized, "UcIDM: system not initialized");
        _;
    }

    modifier notRegistered() {
        require(!identities[msg.sender].isRegistered, "UcIDM: identity already registered");
        _;
    }

    modifier isRegistered() {
        require(identities[msg.sender].isRegistered, "UcIDM: identity not registered");
        _;
    }

    // =========================================================================
    //                          CONSTRUCTOR
    // =========================================================================

    constructor(uint256 _committeeThreshold, uint256 _registrationFee) {
        owner = msg.sender;
        committeeThreshold = _committeeThreshold;
        registrationFee = _registrationFee;
        systemInitialized = false;
    }

    // =========================================================================
    //          PHASE 1: SYSTEM INITIALIZATION
    // =========================================================================

    /**
     * @notice Register a committee node with a stake (DPoS simulation)
     * @param _nodeId Human-readable identifier for the node
     */
    function joinCommittee(string memory _nodeId) external payable {
        require(!committeeNodes[msg.sender].isActive, "UcIDM: already a committee member");
        require(msg.value > 0, "UcIDM: must stake ETH to join committee");

        committeeNodes[msg.sender] = CommitteeNode({
            nodeAddress: msg.sender,
            stakedAmount: msg.value,
            joinedAt: block.timestamp,
            isActive: true,
            nodeId: _nodeId
        });

        committeeList.push(msg.sender);

        emit CommitteeNodeJoined(msg.sender, _nodeId, msg.value);
    }

    /**
     * @notice Generate the Common Reference String (CRS) for ZKP verification
     * @dev Simulates multi-party computation; in production, this would use MPC
     */
    function generateCRS() external onlyOwner {
        require(committeeList.length >= committeeThreshold, "UcIDM: insufficient committee nodes");

        // Simulate CRS generation using block data and committee info
        bytes32 crs = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                committeeList.length,
                msg.sender
            )
        );

        commonReferenceString = crs;
        emit CRSGenerated(crs);
    }

    /**
     * @notice Finalize system initialization
     */
    function initializeSystem() external onlyOwner {
        require(committeeList.length >= committeeThreshold, "UcIDM: insufficient committee nodes");
        require(commonReferenceString != bytes32(0), "UcIDM: CRS not generated");

        systemInitialized = true;
        currentMerkleRoot = keccak256(abi.encodePacked("genesis_merkle_root"));

        emit SystemInitialized(commonReferenceString, committeeList.length, block.timestamp);
    }

    // =========================================================================
    //          PHASE 2: DIGITAL IDENTITY GENERATION
    // =========================================================================

    /**
     * @notice Register Bob's digital identity on the blockchain
     * @param _publicKeyHash Hash of the user's public key (pk_U)
     * @dev Requires payment to prevent Sybil attacks
     */
    function registerIdentity(bytes32 _publicKeyHash) external payable systemReady notRegistered {
        require(msg.value >= registrationFee, "UcIDM: insufficient registration fee");

        // Generate UID by hashing the sender's address with block data
        bytes32 uidHash = keccak256(
            abi.encodePacked(msg.sender, _publicKeyHash, block.timestamp, block.number)
        );

        identities[msg.sender] = DigitalIdentity({
            uidHash: uidHash,
            publicKeyHash: _publicKeyHash,
            isRegistered: true,
            registrationBlock: block.number,
            registrationTime: block.timestamp
        });

        registeredUsers.push(msg.sender);

        emit IdentityRegistered(msg.sender, uidHash, _publicKeyHash, block.number);
    }

    // =========================================================================
    //          PHASE 3: IDENTITY ATTRIBUTE EXPORT (tracked on-chain)
    // =========================================================================

    /**
     * @notice Record that an attribute was exported from an IDI to the user
     * @param _attributeType Type of attribute (e.g., "drivers_license")
     * @param _attributeHash Hash of the exported attribute
     * @dev The actual attribute transfer happens off-chain; this records the event
     */
    function recordAttributeExport(
        string memory _attributeType,
        bytes32 _attributeHash
    ) external isRegistered {
        emit AttributeExported(msg.sender, _attributeType, _attributeHash);
    }

    // =========================================================================
    //          PHASE 4: ATTRIBUTE CREDENTIAL MANAGEMENT
    // =========================================================================

    /**
     * @notice Submit attribute credential with ZKP for verification
     * @param _commitment Cryptographic commitment to the attribute (cmmit_{attr,pk_U})
     * @param _zkProofHash Hash of the zero-knowledge proof (pi_{attr})
     * @param _attributeType Type of the attribute being credentialed
     */
    function issueCredential(
        bytes32 _commitment,
        bytes32 _zkProofHash,
        string memory _attributeType
    ) external isRegistered {
        require(!credentials[msg.sender].isValid, "UcIDM: credential already exists");

        // Committee verification simulation:
        // 1. Verify UID is certified
        require(identities[msg.sender].uidHash != bytes32(0), "UcIDM: UID not certified");
        // 2. Verify ZKP is mathematically sound (simulated)
        require(_zkProofHash != bytes32(0), "UcIDM: invalid ZK proof");
        // 3. Check for duplicate attributes
        require(_commitment != bytes32(0), "UcIDM: invalid commitment");

        // Generate authentication link (Auth_attr)
        bytes32 authLink = keccak256(
            abi.encodePacked(
                identities[msg.sender].uidHash,
                _commitment,
                _zkProofHash,
                block.timestamp
            )
        );

        // Update Sparse Merkle Tree
        merkleLeaves[authLink] = true;
        bytes32 oldRoot = currentMerkleRoot;
        currentMerkleRoot = keccak256(abi.encodePacked(currentMerkleRoot, authLink));

        credentials[msg.sender] = AttributeCredential({
            commitment: _commitment,
            zkProofHash: _zkProofHash,
            authLink: authLink,
            merkleRoot: currentMerkleRoot,
            isValid: true,
            issuanceTime: block.timestamp,
            attributeType: _attributeType
        });

        emit MerkleRootUpdated(oldRoot, currentMerkleRoot);
        emit CredentialIssued(msg.sender, _commitment, authLink, currentMerkleRoot);
    }

    // =========================================================================
    //          PHASE 5: SERVICE ACCESS VERIFICATION
    // =========================================================================

    /**
     * @notice Verify a user's credential and grant access to a 6G service
     * @param _user Address of the user requesting access
     * @param _serviceName Name of the 6G service
     */
    function verifyAndGrantAccess(
        address _user,
        string memory _serviceName
    ) external systemReady {
        emit AccessRequested(_user, msg.sender, _serviceName);

        // Check if user has valid credential
        AttributeCredential memory cred = credentials[_user];

        if (!cred.isValid) {
            emit AccessDenied(_user, msg.sender, "Credential is not valid or has been revoked");
            revert("UcIDM: credential invalid or revoked");
        }

        // Verify membership in Sparse Merkle Tree
        if (!merkleLeaves[cred.authLink]) {
            emit AccessDenied(_user, msg.sender, "Non-membership proof: credential revoked");
            revert("UcIDM: auth link not found in Merkle tree");
        }

        // Record access
        accessHistory[_user].push(AccessRecord({
            serviceProvider: msg.sender,
            credentialUsed: cred.authLink,
            accessGranted: true,
            accessTime: block.timestamp,
            serviceName: _serviceName
        }));

        emit AccessGranted(_user, msg.sender, _serviceName);
    }

    // =========================================================================
    //          PHASE 6: IDENTITY REVOCATION
    // =========================================================================

    /**
     * @notice Revoke a user's credential (e.g., license expiry or violation)
     * @param _user Address of the user whose credential to revoke
     */
    function revokeCredential(address _user) external onlyCommittee {
        require(credentials[_user].isValid, "UcIDM: credential already revoked");

        bytes32 authLink = credentials[_user].authLink;

        // Set Merkle leaf to nil (non-membership)
        merkleLeaves[authLink] = false;

        // Update Merkle root
        bytes32 oldRoot = currentMerkleRoot;
        currentMerkleRoot = keccak256(
            abi.encodePacked(currentMerkleRoot, "revoke", authLink)
        );

        // Invalidate credential
        credentials[_user].isValid = false;

        emit CredentialInvalidated(_user, oldRoot, currentMerkleRoot);
        emit IdentityRevoked(_user, authLink, block.timestamp);
    }

    // =========================================================================
    //                        VIEW FUNCTIONS
    // =========================================================================

    function getCommitteeSize() external view returns (uint256) {
        return committeeList.length;
    }

    function getIdentity(address _user) external view returns (DigitalIdentity memory) {
        return identities[_user];
    }

    function getCredential(address _user) external view returns (AttributeCredential memory) {
        return credentials[_user];
    }

    function isCredentialValid(address _user) external view returns (bool) {
        return credentials[_user].isValid && merkleLeaves[credentials[_user].authLink];
    }

    function getAccessHistory(address _user) external view returns (AccessRecord[] memory) {
        return accessHistory[_user];
    }

    function getCommitteeNode(address _node) external view returns (CommitteeNode memory) {
        return committeeNodes[_node];
    }

    function getUserUID(address _user) external view returns (bytes32) {
        return identities[_user].uidHash;
    }

    function verifyMerkleMembership(bytes32 _authLink) external view returns (bool) {
        return merkleLeaves[_authLink];
    }
}
