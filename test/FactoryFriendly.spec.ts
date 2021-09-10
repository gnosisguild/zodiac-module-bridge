import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { AbiCoder, formatBytes32String } from "ethers/lib/utils";

const FirstAddress = "0x0000000000000000000000000000000000000001";
const saltNonce = "0xfa";

describe("Module works with factory", () => {
  const chainId = formatBytes32String("55")

  const paramsTypes = ["address", "address", "address", "address", "address", "bytes32"];

  const baseSetup = deployments.createFixture(async () => {
    await deployments.fixture();
    const Factory = await hre.ethers.getContractFactory("ModuleProxyFactory");
    const AMBModule = await hre.ethers.getContractFactory("AMBModule");
    const factory = await Factory.deploy();

    const masterCopy = await AMBModule.deploy(
      FirstAddress,
      FirstAddress,
      FirstAddress,
      FirstAddress,
      FirstAddress,
      formatBytes32String("0")
    );

    return { factory, masterCopy };
  });

  it("should throw because master copy is already initialized", async () => {
    const { masterCopy } = await baseSetup();
    const [avatar, amb, controller] = await ethers.getSigners();

    const encodedParams = new AbiCoder().encode(paramsTypes, [
      avatar.address,
      avatar.address,
      avatar.address,
      amb.address,
      controller.address,
      chainId,
    ]);

    await expect(masterCopy.setUp(encodedParams)).to.be.revertedWith(
      "Initializable: contract is already initialized"
    );
  });

  it("should deploy new amb module proxy", async () => {
    const { factory, masterCopy } = await baseSetup();
    const [avatar, amb, controller] = await ethers.getSigners();
    const paramsValues = [
      avatar.address,
      avatar.address,
      avatar.address,
      amb.address,
      controller.address,
      chainId,
    ];
    const encodedParams = [new AbiCoder().encode(paramsTypes, paramsValues)];
    const initParams = masterCopy.interface.encodeFunctionData(
      "setUp",
      encodedParams
    );
    const receipt = await factory
      .deployModule(masterCopy.address, initParams, saltNonce)
      .then((tx: any) => tx.wait());

    // retrieve new address from event
    const {
      args: [newProxyAddress],
    } = receipt.events.find(
      ({ event }: { event: string }) => event === "ModuleProxyCreation"
    );

    const newProxy = await hre.ethers.getContractAt(
      "AMBModule",
      newProxyAddress
    );
    expect(await newProxy.controller()).to.be.eq(controller.address);
    expect(await newProxy.chainId()).to.be.eq(chainId);
  });
});
