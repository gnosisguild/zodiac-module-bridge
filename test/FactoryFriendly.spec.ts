import { expect } from "chai";
import hre, { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import { AbiCoder, encodeBytes32String, ZeroHash } from "ethers";
import createAdapter from "./createEIP1193";
import { deployFactories, deployMastercopy, deployProxy } from "@gnosis-guild/zodiac-core";
import { AMBModule__factory } from "../typechain-types";

const FirstAddress = "0x0000000000000000000000000000000000000001";
const saltNonce = "0xfa";

describe("Module works with factory", () => {
  const chainId = encodeBytes32String("55");

  const paramsTypes = [
    "address",
    "address",
    "address",
    "address",
    "address",
    "bytes32",
  ];

  async function baseSetup() {
    const AMBModule = await ethers.getContractFactory("AMBModule");

    const [deployer] = await ethers.getSigners();

    const eip1193Provider = createAdapter({
      provider: hre.network.provider,
      signer: deployer,
    });

    const factoryAddress = await deployFactories({ provider: eip1193Provider });

    const { address } = await deployMastercopy({
      bytecode: AMBModule.bytecode,
      constructorArgs: {
        types: [
          "address",
          "address",
          "address",
          "address",
          "address",
          "bytes32",
        ],
        values: [
          FirstAddress,
          FirstAddress,
          FirstAddress,
          FirstAddress,
          FirstAddress,
          ZeroHash,
        ],
      },
      salt: ZeroHash,
      provider: eip1193Provider,
    });

    return {
      factory: factoryAddress,
      masterCopy: AMBModule__factory.connect(address, deployer),
      eip1193Provider,
    };
  }

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
    await expect(masterCopy.setUp(encodedParams)).to.be.revertedWithCustomError(
      masterCopy,
      "InvalidInitialization()"
    );
  });

  it("should deploy new amb module proxy", async () => {
    const { masterCopy, eip1193Provider } = await baseSetup();
    const [avatar, amb, controller] = await ethers.getSigners();
    const paramsValues = [
      avatar.address,
      avatar.address,
      avatar.address,
      amb.address,
      controller.address,
      chainId,
    ];
    const result = await deployProxy({
      mastercopy: await masterCopy.getAddress(),
      setupArgs: {
        types: paramsTypes,
        values: paramsValues,
      },
      saltNonce,
      provider: eip1193Provider,
    });
    const newProxy = await hre.ethers.getContractAt(
      "AMBModule",
      result.address
    );
    expect(await newProxy.controller()).to.be.eq(controller.address);
    expect(await newProxy.chainId()).to.be.eq(chainId);
  });
});
