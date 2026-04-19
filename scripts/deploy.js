const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying UcIDM Contract...\n");

  const [deployer, ...accounts] = await hre.ethers.getSigners();
  console.log("📋 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy contract with committee threshold of 2 and registration fee of 0.001 ETH
  const committeeThreshold = 2;
  const registrationFee = hre.ethers.parseEther("0.001");

  const UcIDM = await hre.ethers.getContractFactory("UcIDM");
  const ucidm = await UcIDM.deploy(committeeThreshold, registrationFee);
  await ucidm.waitForDeployment();

  const contractAddress = await ucidm.getAddress();
  console.log("✅ UcIDM deployed to:", contractAddress);

  // ── Phase 1: System Initialization ──
  console.log("\n── Phase 1: System Initialization ──");

  // Deployer also joins as committee node (so MetaMask user can revoke in Phase 6)
  const deployerCommitteeTx = await ucidm.joinCommittee("Node-Admin-Owner", {
    value: hre.ethers.parseEther("2.0")
  });
  await deployerCommitteeTx.wait();
  console.log("🟢 Deployer joined as committee node (stake: 2.0 ETH)");

  // Additional committee nodes join with stakes
  if (accounts.length >= 2) {
    const tx1 = await ucidm.connect(accounts[0]).joinCommittee("Node-Alpha-6G", {
      value: hre.ethers.parseEther("1.0")
    });
    await tx1.wait();
    console.log("🟢 Committee Node Alpha joined (stake: 1.0 ETH)");

    const tx2 = await ucidm.connect(accounts[1]).joinCommittee("Node-Beta-6G", {
      value: hre.ethers.parseEther("1.5")
    });
    await tx2.wait();
    console.log("🟢 Committee Node Beta joined (stake: 1.5 ETH)");

    const tx3 = await ucidm.connect(accounts[2]).joinCommittee("Node-Gamma-6G", {
      value: hre.ethers.parseEther("0.8")
    });
    await tx3.wait();
    console.log("🟢 Committee Node Gamma joined (stake: 0.8 ETH)");
  }

  // Generate CRS
  const crsTx = await ucidm.generateCRS();
  await crsTx.wait();
  console.log("🔐 Common Reference String (CRS) generated");

  // Initialize system
  const initTx = await ucidm.initializeSystem();
  await initTx.wait();
  console.log("⚡ System initialized successfully!\n");

  const crs = await ucidm.commonReferenceString();
  console.log("📎 CRS:", crs);

  // Save deployment info to public/ so Next.js frontend can fetch it
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    committeeNodes: [
      deployer.address,
      ...(accounts.length >= 3 ? [
        accounts[0].address,
        accounts[1].address,
        accounts[2].address
      ] : [])
    ],
    network: hre.network.name,
    chainId: 31337,
    committeeThreshold: committeeThreshold,
    registrationFee: registrationFee.toString(),
    crs: crs,
    deployedAt: new Date().toISOString()
  };

  // Save to public/ directory for frontend access
  const publicDir = path.join(__dirname, "..", "public");
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(
    path.join(publicDir, "deployedAddress.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📁 Deployment info saved to public/deployedAddress.json");

  // Copy ABI for frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "UcIDM.sol", "UcIDM.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    fs.writeFileSync(
      path.join(publicDir, "UcIDMABI.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📁 Contract ABI saved to public/UcIDMABI.json");
  }

  console.log("\n══════════════════════════════════════════");
  console.log("🎉 Deployment complete!");
  console.log("══════════════════════════════════════════");
  console.log("\n📌 MetaMask Setup:");
  console.log("   Network: Hardhat Local");
  console.log("   RPC URL: http://127.0.0.1:8545");
  console.log("   Chain ID: 31337");
  console.log("   Import this private key into MetaMask:");
  console.log("   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("   (Deployer account — has owner + committee privileges)\n");
  console.log("   Then run: npm run dev\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
