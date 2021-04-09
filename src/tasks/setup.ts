import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";

task("setup", "deploy a SafeBridge Module")
    .addParam("dao", "Address of the DAO (e.g. Safe)", undefined, types.string)
    .addParam("amb", "Address of the AMB", undefined, types.string)
    .addParam("owner", "Address of the owner on the other side of the AMB", undefined, types.string)
    .addParam("chainid", "Chain ID on the other side of the AMB", undefined, types.string)
    .setAction(async (taskArgs, hardhatRuntime) => {
        const [caller] = await hardhatRuntime.ethers.getSigners();
        console.log("Using the account:", caller.address);
        const Module = await hardhatRuntime.ethers.getContractFactory("SafeBridgeModule");
        const module = await Module.deploy(taskArgs.dao, taskArgs.amb, taskArgs.owner, taskArgs.chainid);

        console.log("SafeBridge Module deployed to:", module.address);
    });

task("verifyEtherscan", "Verifies the contract on etherscan")
    .addParam("module", "Address of the SafeBridge module", undefined, types.string)
    .addParam("dao", "Address of the DAO (e.g. Safe)", undefined, types.string)
    .addParam("amb", "Address of the AMB", undefined, types.string)
    .addParam("owner", "Address of the ofwner on the other side of the AMB", undefined, types.string)
    .addParam("chainid", "Chain ID on the other side of the AMB", undefined, types.string)
    .setAction(async (taskArgs, hardhatRuntime) => {
        await hardhatRuntime.run("verify", {
            address: taskArgs.module,
            constructorArgsParams: [
                taskArgs.dao, taskArgs.amb, taskArgs.owner, taskArgs.chainid
            ]
        })
    });

export { };
