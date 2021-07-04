import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { Contract } from "ethers";

task("setup", "deploy a SafeBridge Module")
  .addParam("dao", "Address of the DAO (e.g. Safe)", undefined, types.string)
  .addParam("amb", "Address of the AMB", undefined, types.string)
  .addParam(
    "owner",
    "Address of the owner on the other side of the AMB",
    undefined,
    types.string
  )
  .addParam(
    "chainid",
    "Chain ID on the other side of the AMB",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);
    const Module = await hardhatRuntime.ethers.getContractFactory(
      "SafeBridgeModule"
    );
    const module = await Module.deploy(
      taskArgs.dao,
      taskArgs.amb,
      taskArgs.owner,
      taskArgs.chainid
    );

    console.log("SafeBridge Module deployed to:", module.address);
  });

task("factory-setup", "deploy a SafeBridge Module")
  .addParam("factory", "Address of the Proxy Factory", undefined, types.string)
  .addParam("singleton", "Address of the Delay Module Master Copy", undefined, types.string)
  .addParam("dao", "Address of the DAO (e.g. Safe)", undefined, types.string)
  .addParam("amb", "Address of the AMB", undefined, types.string)
  .addParam(
    "owner",
    "Address of the owner on the other side of the AMB",
    undefined,
    types.string
  )
  .addParam(
    "chainid",
    "Chain ID on the other side of the AMB",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);

    const FactoryAbi = [
      `function deployModule(
          address singleton, 
          bytes memory initializer
      ) public returns (address clone)`,
    ];

    const Factory = new Contract(taskArgs.factory, FactoryAbi, caller)
    const Module = await hardhatRuntime.ethers.getContractFactory("AMBModule");
    const initParams = Module.interface.encodeFunctionData('setUp', [
      taskArgs.dao, 
      taskArgs.amb,
      taskArgs.owner,
      taskArgs.chainid
    ])

    const receipt = await Factory.deployModule(taskArgs.singleton, initParams).then((tx: any) => tx.wait(3));
    console.log("Module deployed to:", receipt.logs[1].address);
  });

task("verifyEtherscan", "Verifies the contract on etherscan")
  .addParam(
    "module",
    "Address of the SafeBridge module",
    undefined,
    types.string
  )
  .addParam("dao", "Address of the DAO (e.g. Safe)", undefined, types.string)
  .addParam("amb", "Address of the AMB", undefined, types.string)
  .addParam(
    "owner",
    "Address of the ofwner on the other side of the AMB",
    undefined,
    types.string
  )
  .addParam(
    "chainid",
    "Chain ID on the other side of the AMB",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    await hardhatRuntime.run("verify", {
      address: taskArgs.module,
      constructorArgsParams: [
        taskArgs.dao,
        taskArgs.amb,
        taskArgs.owner,
        taskArgs.chainid,
      ],
    });
  });

export {};
