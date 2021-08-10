import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { Contract } from "ethers";

const FirstAddress = "0x0000000000000000000000000000000000000001";
const ZeroAddress = "0x0000000000000000000000000000000000000000";
const Zero =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

task("setup", "deploy a SafeBridge Module")
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam("executor", "Address of the executor", undefined, types.string)
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
  .setAction(async (taskArgs, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);
    const Module = await hardhatRuntime.ethers.getContractFactory("AMBModule");
    const module = await Module.deploy(
      taskArgs.owner,
      taskArgs.executor,
      taskArgs.amb,
      taskArgs.controller,
      taskArgs.chainid
    );

    console.log("SafeBridge Module deployed to:", module.address);
  });

task("factorySetup", "deploy a SafeBridge Module")
  .addParam("factory", "Address of the Proxy Factory", undefined, types.string)
  .addParam(
    "mastercopy",
    "Address of the AMB Module Master Copy",
    undefined,
    types.string
  )
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam("executor", "Address of the executor", undefined, types.string)
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
  .setAction(async (taskArgs, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);

    const FactoryAbi = [
      `function deployModule(
          address masterCopy, 
          bytes memory initializer
      ) public returns (address proxy)`,
    ];

    const Factory = new Contract(taskArgs.factory, FactoryAbi, caller);
    const Module = await hardhatRuntime.ethers.getContractFactory("AMBModule");
    const initParams = Module.interface.encodeFunctionData("setUp", [
      taskArgs.owner,
      taskArgs.executor,
      taskArgs.amb,
      taskArgs.controller,
      taskArgs.chainid,
    ]);

    const receipt = await Factory.deployModule(
      taskArgs.mastercopy,
      initParams
    ).then((tx: any) => tx.wait(3));
    console.log("Module deployed to:", receipt.logs[1].address);
  });

task("verifyEtherscan", "Verifies the contract on etherscan")
  .addParam(
    "module",
    "Address of the SafeBridge module",
    undefined,
    types.string
  )
  .addParam("owner", "Address of the owner", undefined, types.string)
  .addParam(
    "executor",
    "Address of the executor (e.g. Safe)",
    undefined,
    types.string
  )
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
  .setAction(async (taskArgs, hardhatRuntime) => {
    await hardhatRuntime.run("verify", {
      address: taskArgs.module,
      constructorArgsParams: [
        taskArgs.owner,
        taskArgs.executor,
        taskArgs.amb,
        taskArgs.controller,
        taskArgs.chainid,
      ],
    });
  });

task("deployMasterCopy", "deploy a master copy of AMB Module").setAction(
  async (_, hardhatRuntime) => {
    const [caller] = await hardhatRuntime.ethers.getSigners();
    console.log("Using the account:", caller.address);
    const Module = await hardhatRuntime.ethers.getContractFactory("AMBModule");
    const module = await Module.deploy(
      FirstAddress,
      FirstAddress,
      ZeroAddress,
      ZeroAddress,
      Zero
    );

    await module.deployTransaction.wait(3);

    console.log("Module deployed to:", module.address);
    await hardhatRuntime.run("verify:verify", {
      address: module.address,
      constructorArguments: [
        FirstAddress,
        FirstAddress,
        ZeroAddress,
        ZeroAddress,
        Zero,
      ],
    });
  }
);

export {};
