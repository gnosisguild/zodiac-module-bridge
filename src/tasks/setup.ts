import "hardhat-deploy";
import "@nomicfoundation/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  encodeDeployProxy,
  readMastercopyArtifact,
  predictProxyAddress,
} from "zodiac-core";

interface BridgeTaskArgs {
  owner: string;
  avatar: string;
  target: string;
  amb: string;
  controller: string;
  chainid: number;
  proxied: boolean;
}

const deployBridgeModule = async (
  taskArgs: BridgeTaskArgs,
  hardhatRuntime: HardhatRuntimeEnvironment
) => {
  const [deployer] = await hardhatRuntime.ethers.getSigners();
  const nonce = await deployer.getNonce();
  console.log("Using the account:", deployer.address);
  const bridgeChainId = intToBytes32HexString(taskArgs.chainid);
  const masterCopyArtifact = await readMastercopyArtifact({
    contractName: "AMBModule",
  });
  if (taskArgs.proxied && masterCopyArtifact) {
    const mastercopy = masterCopyArtifact.address;
    const setupArgs = {
      types: ["address", "address", "address", "address", "address", "bytes32"],
      values: [
        taskArgs.owner,
        taskArgs.avatar,
        taskArgs.target,
        taskArgs.amb,
        taskArgs.controller,
        bridgeChainId,
      ],
    };
    const transaction = encodeDeployProxy({
      mastercopy,
      setupArgs,
      saltNonce: nonce,
    });

    const deploymentTransaction = await deployer.sendTransaction(transaction);
    await deploymentTransaction.wait();
    console.log(
      "Bridge module deployed to:",
      predictProxyAddress({ mastercopy, setupArgs, saltNonce: nonce })
    );
    return;
  }

  const Module = await hardhatRuntime.ethers.getContractFactory("AMBModule");
  const module = await Module.deploy(
    taskArgs.owner,
    taskArgs.avatar,
    taskArgs.target,
    taskArgs.amb,
    taskArgs.controller,
    bridgeChainId
  );
  const moduleAddress = await module.getAddress();
  console.log("Bridge module deployed to:", moduleAddress);
};

task("setup", "deploy an AMB Module")
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam("avatar", "Address of the avatar", undefined, types.string)
  .addParam("target", "Address of the target", undefined, types.string)
  .addParam("amb", "Address of the AMB", undefined, types.string)
  .addParam(
    "controller",
    "Address of the controller on the other side of the AMB",
    undefined,
    types.string
  )
  .addParam(
    "chainid",
    "Chain ID on the other side of the AMB",
    undefined,
    types.int
  )
  .addParam(
    "proxied",
    "Deploys contract through factory",
    false,
    types.boolean,
    true
  )
  .setAction(deployBridgeModule);

task("verifyEtherscan", "Verifies the contract on etherscan")
  .addParam("module", "Address of the AMB module", undefined, types.string)
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam(
    "avatar",
    "Address of the avatar (e.g. Safe)",
    undefined,
    types.string
  )
  .addParam("target", "Address of the target", undefined, types.string)
  .addParam("amb", "Address of the AMB", undefined, types.string)
  .addParam(
    "controller",
    "Address of the controller on the other side of the AMB",
    undefined,
    types.string
  )
  .addParam(
    "chainid",
    "Chain ID on the other side of the AMB",
    undefined,
    types.string
  )
  .setAction(
    async (taskArgs: BridgeTaskArgs & { module: string }, hardhatRuntime) => {
      await hardhatRuntime.run("verify", {
        address: taskArgs.module,
        constructorArgsParams: [
          taskArgs.owner,
          taskArgs.avatar,
          taskArgs.target,
          taskArgs.amb,
          taskArgs.controller,
          intToBytes32HexString(taskArgs.chainid),
        ],
      });
    }
  );

export {};

function intToBytes32HexString(i: number): string {
  // convert to hex string
  // pad left with zeros up until 64 -> 32 bytes
  return `0x${i.toString(16).padStart(64, "0")}`;
}
