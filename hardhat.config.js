require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Ganache local blockchain (default: port 7545, chain ID 1337)
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337
    },
    // Also support localhost for flexibility
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
