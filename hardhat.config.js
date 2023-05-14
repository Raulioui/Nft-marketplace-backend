require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("dotenv").config()
require("solidity-coverage")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {version: "0.8.7"},
      {version: "0.8.8"}
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      defualt: 1
    }
  },
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY
      ],
      chainId: 5,
      blockConfirmations: 6
    },
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.API_KEY_GOERLI
    }
  },
  mocha: {
    timeout: 500000
  }
};