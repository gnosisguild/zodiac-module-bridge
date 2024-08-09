import { encodeBytes32String } from "ethers";
import { deployMastercopy } from "zodiac-core";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import createAdapter from "./createEIP1193";

const FirstAddress = "0x0000000000000000000000000000000000000001";
const SaltZero =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts } = hre;
  const { deployer: deployerAddress } = await getNamedAccounts();
  const deployer = await hre.ethers.provider.getSigner(deployerAddress);
  const chainId = encodeBytes32String("0");
  const AMBModule = await hre.ethers.getContractFactory("AMBModule");
  const args = [
    FirstAddress,
    FirstAddress,
    FirstAddress,
    FirstAddress,
    FirstAddress,
    chainId,
  ];

  const { noop, address } = await deployMastercopy({
    bytecode: AMBModule.bytecode,
    constructorArgs: {
      types: ["address", "address", "address", "address", "address", "bytes32"],
      values: args,
    },
    salt: SaltZero,
    provider: createAdapter({
      provider: hre.network.provider,
      signer: deployer,
    }),
  });

  if (noop) {
    console.log("AMBModule already deployed to:", address);
  } else {
    console.log("AMBModule was deployed to:", address);
  }
};

deploy.tags = ["amb-module"];
export default deploy;
