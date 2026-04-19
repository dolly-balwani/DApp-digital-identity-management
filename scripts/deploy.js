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

  // Committee nodes join with stakes
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

  // Save deployment info for frontend
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    committeeNodes: accounts.length >= 3 ? [
      accounts[0].address,
      accounts[1].address,
      accounts[2].address
    ] : [],
    network: hre.network.name,
    chainId: 31337,
    committeeThreshold: committeeThreshold,
    registrationFee: registrationFee.toString(),
    crs: crs,
    deployedAt: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, "..", "lib", "deployedAddress.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to lib/deployedAddress.json");

  // Copy ABI for frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "UcIDM.sol", "UcIDM.json");
  const abiOutputPath = path.join(__dirname, "..", "lib", "UcIDMABI.json");

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    fs.writeFileSync(abiOutputPath, JSON.stringify(artifact.abi, null, 2));
    console.log("📁 Contract ABI saved to lib/UcIDMABI.json");
  }

  console.log("\n🎉 Deployment complete! Run 'npm run dev' to start the frontend.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
