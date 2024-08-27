import hre, { deployments, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const nextBlockTime = async (
  hre: HardhatRuntimeEnvironment,
  timestamp: number
) => {
  await hre.network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  await hre.network.provider.send("evm_mine");
};

export const increaseBlockTime = async (
  hre: HardhatRuntimeEnvironment,
  seconds: number
) => {
  const block = await hre.ethers.provider.getBlock("latest");
  block && (await nextBlockTime(hre, block.timestamp + seconds));
};

export const logGas = async (
  message: string,
  tx: Promise<any>
): Promise<any> => {
  return tx.then(async (result) => {
    const receipt = await result.wait();
    console.log(
      "           Used",
      receipt.gasUsed.toNumber(),
      `gas for >${message}<`
    );
    return result;
  });
};
