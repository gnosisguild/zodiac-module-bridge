import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { HttpNetworkUserConfig } from "hardhat/types";

const argv = yargs(hideBin(process.argv))
  .option("network", {
    type: "string",
    default: "hardhat",
    describe: "The network to connect to",
  })
  .help(false)
  .version(false)
  .parseSync();

// Load environment variables.
dotenv.config();
const { INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK } = process.env;

import "./tasks/deploy-mastercopies";
import "./tasks/deploy-mastercopy";
import "./tasks/extract-mastercopy";
import "./tasks/verify-mastercopies";
import "./tasks/verify-mastercopy";

const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
  };
}

if (["sepolia", "mainnet"].includes(argv.network) && INFURA_KEY === undefined) {
  throw new Error(
    `Could not find Infura key in env, unable to connect to network ${argv.network}`
  );
}

export default {
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "src/deploy",
    sources: "contracts",
  },
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.0" },
      { version: "0.6.12" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 100000000,
      gas: 100000000,
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    sepolia: {
      ...sharedNetworkConfig,
      url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.poanetwork.dev",
    },
    matic: {
      ...sharedNetworkConfig,
      url: "https://rpc-mainnet.maticvigil.com",
    },
    mumbai: {
      ...sharedNetworkConfig,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    },
    polygon: {
      ...sharedNetworkConfig,
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    volta: {
      ...sharedNetworkConfig,
      url: `https://volta-rpc.energyweb.org`,
    },
    bsc: {
      ...sharedNetworkConfig,
      url: `https://bsc-dataseed.binance.org/`,
    },
    arbitrum: {
      ...sharedNetworkConfig,
      url: `https://arb1.arbitrum.io/rpc`,
    },
    avalanche: {
      ...sharedNetworkConfig,
      url: `https://api.avax.network/ext/bc/C/rpc`,
    },
    "lisk-sepolia": {
      ...sharedNetworkConfig,
      chainId: 4202,
      url: "https://rpc.sepolia-api.lisk.com",
      gasPrice: 1000000000,
    },
    "bob-sepolia": {
      ...sharedNetworkConfig,
      chainId: 808813,
      url: "https://bob-sepolia.rpc.gobob.xyz/",
      gasPrice: 1000000000,
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 2000000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "lisk-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
      {
        network: "bob-sepolia",
        chainId: 808813,
        urls: {
          apiURL: "https://bob-sepolia.explorer.gobob.xyz/api",
          browserURL: "https://bob-sepolia.explorer.gobob.xyz",
        },
      },
    ],
  },
};
