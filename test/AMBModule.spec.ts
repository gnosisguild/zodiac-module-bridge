import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import createAdapter from "./createEIP1193";

const ZeroAddress = ethers.ZeroAddress;
const FortyTwo =
  "0x000000000000000000000000000000000000000000000000000000000000002a";

describe("AMBModule", async () => {
  async function baseSetup() {
    const [deployer] = await ethers.getSigners();

    const eip1193Provider = createAdapter({
      provider: hre.network.provider,
      signer: deployer,
    });

    const Avatar = await ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.deploy();
    const Mock = await ethers.getContractFactory("Mock");
    const mock = await Mock.deploy();
    const mockAddress = await mock.getAddress();
    const amb = await ethers.getContractAt("IAMB", mockAddress);
    const badMock = await Mock.deploy();
    const badMockAddress = await mock.getAddress();
    const badAmb = await ethers.getContractAt("IAMB", badMockAddress);
    const signers = await ethers.getSigners();
    const sighashMessageSourceChainId = amb.interface.getFunction(
      "messageSourceChainId"
    ).selector;
    const sighashMessageSender =
      amb.interface.getFunction("messageSender").selector;
    await mock.givenMethodReturnUint(sighashMessageSourceChainId, 1);
    await badMock.givenMethodReturnUint(sighashMessageSourceChainId, 2);
    await mock.givenMethodReturnAddress(
      sighashMessageSender,
      signers[0].address
    );
    await badMock.givenMethodReturnAddress(
      sighashMessageSender,
      signers[1].address
    );
    return {
      Avatar,
      avatar,
      module,
      mock,
      badMock,
      amb,
      badAmb,
      signers,
      eip1193Provider,
    };
  }
  const setupTestWithTestAvatar = deployments.createFixture(async () => {
    const base = await baseSetup();
    const Module = await ethers.getContractFactory("AMBModule");
    const provider = await ethers.getDefaultProvider();
    const network = await provider.getNetwork();
    const baseAvatarAddress = await base.avatar.getAddress();
    const baseAmbAddress = await base.amb.getAddress();
    const baseAmbMsgSource = await base.amb.messageSourceChainId();
    const module = await Module.deploy(
      baseAvatarAddress,
      baseAvatarAddress,
      baseAvatarAddress,
      baseAmbAddress,
      base.signers[0].address,
      baseAmbMsgSource
    );
    const moduleAddress = await module.getAddress();
    await base.avatar.setModule(moduleAddress);
    return { ...base, Module, module, network };
  });
  const [user1] = await ethers.getSigners();
  describe("setUp()", async () => {
    it("throws if avatar is address zero", async () => {
      const { Module } = await setupTestWithTestAvatar();
      await expect(
        Module.deploy(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          FortyTwo
        )
      ).to.be.revertedWith("Avatar can not be zero address");
    });
    it("should emit event because of successful set up", async () => {
      const AMBModule = await ethers.getContractFactory("AMBModule");
      const module = await AMBModule.deploy(
        user1.address,
        user1.address,
        user1.address,
        user1.address,
        user1.address,
        FortyTwo
      );
      await module.waitForDeployment();
      const tx = await module.deploymentTransaction();
      await expect(tx)
        .to.emit(module, "AmbModuleSetup")
        .withArgs(
          (arg1: any) => {
            expect(arg1).to.equal(user1.address);
            return true;
          },
          (arg2: any) => {
            expect(arg2).to.equal(user1.address);
            return true;
          },
          (arg3: any) => {
            expect(arg3).to.equal(user1.address);
            return true;
          },
          (arg4: any) => {
            expect(arg4).to.equal(user1.address);
            return true;
          }
        );
    });
    it("throws if target is address zero", async () => {
      const { Module } = await setupTestWithTestAvatar();
      await expect(
        Module.deploy(
          ZeroAddress,
          user1.address,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          FortyTwo
        )
      ).to.be.revertedWith("Target can not be zero address");
    });
  });
  describe("setAmb()", async () => {
    it("throws if not authorized", async () => {
      const { module, signers } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const unauthorizedSigner = signers[1];
      await expect(
        module.connect(unauthorizedSigner).setAmb(moduleAddress)
      ).to.be.revertedWithCustomError(module, "OwnableUnauthorizedAccount");
    });
    it("throws if already set to input address", async () => {
      const { module, avatar, amb } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const ambAddress = await amb.getAddress();
      expect(await module.amb()).to.be.equals(ambAddress);
      const calldata = module.interface.encodeFunctionData("setAmb", [
        ambAddress,
      ]);
      await expect(avatar.exec(moduleAddress, 0, calldata)).to.be.revertedWith(
        "AMB address already set to this"
      );
    });
    it("updates AMB address", async () => {
      const { module, avatar, amb } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const ambAddress = await amb.getAddress();
      expect(await module.amb()).to.be.equals(ambAddress);
      const calldata = module.interface.encodeFunctionData("setAmb", [
        user1.address,
      ]);
      const tx = await avatar.exec(moduleAddress, 0, calldata);
      tx.wait();
      expect(await module.amb()).to.be.equals(user1.address);
    });
  });
  describe("setChainId()", async () => {
    it("throws if not authorized", async () => {
      const { module } = await setupTestWithTestAvatar();
      await expect(module.setChainId(FortyTwo)).to.be.revertedWithCustomError(
        module,
        "OwnableUnauthorizedAccount"
      );
    });
    it("throws if already set to input address", async () => {
      const { module, avatar } = await setupTestWithTestAvatar();
      const currentChainID = await module.chainId();
      const moduleAddress = await module.getAddress();
      const calldata = module.interface.encodeFunctionData("setChainId", [
        currentChainID,
      ]);
      await expect(avatar.exec(moduleAddress, 0, calldata)).to.be.revertedWith(
        "chainId already set to this"
      );
    });
    it("updates chainId", async () => {
      const { module, avatar } = await setupTestWithTestAvatar();
      let currentChainID = await module.chainId();
      const newChainID = FortyTwo;
      const moduleAddress = await module.getAddress();
      expect(currentChainID).to.not.equal(newChainID);
      const calldata = module.interface.encodeFunctionData("setChainId", [
        newChainID,
      ]);
      const tx = await avatar.exec(moduleAddress, 0, calldata);
      tx.wait();
      currentChainID = await module.chainId();
      expect(await currentChainID).to.be.equals(newChainID);
    });
  });
  describe("setController()", async () => {
    it("throws if not authorized", async () => {
      const { module, signers } = await setupTestWithTestAvatar();
      await expect(
        module.connect(signers[3]).setController(user1.address)
      ).to.be.revertedWithCustomError(module, "OwnableUnauthorizedAccount");
    });
    it("throws if already set to input address", async () => {
      const { module, avatar } = await setupTestWithTestAvatar();
      const currentController = await module.controller();
      const moduleAddress = await module.getAddress();
      const calldata = module.interface.encodeFunctionData("setController", [
        currentController,
      ]);
      await expect(avatar.exec(moduleAddress, 0, calldata)).to.be.revertedWith(
        "controller already set to this"
      );
    });
    it("updates controller", async () => {
      const { module, avatar, signers } = await setupTestWithTestAvatar();
      let currentController = await module.owner();
      let newController = signers[1].address;
      const moduleAddress = await module.getAddress();
      expect(await currentController).to.not.equals(signers[1].address);
      const calldata = module.interface.encodeFunctionData("setController", [
        newController,
      ]);
      const tx = await avatar.exec(moduleAddress, 0, calldata);
      tx.wait();
      currentController = await module.controller();
      expect(await module.controller()).to.be.equals(newController);
    });
  });
  describe("executeTransaction()", async () => {
    it("throws if amb is unauthorized", async () => {
      const { module } = await setupTestWithTestAvatar();
      const tx = {
        to: user1.address,
        value: 0,
        data: "0xbaddad",
        operation: 0,
      };
      await expect(
        module.executeTransaction(tx.to, tx.value, tx.data, tx.operation)
      ).to.be.revertedWith("Unauthorized amb");
    });
    it("throws if chainId is unauthorized", async () => {
      const { mock, module, amb } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const ambTx = await module.executeTransaction.populateTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );
      const sighashMessageSourceChainId = amb.interface.getFunction(
        "messageSourceChainId"
      ).selector;
      await mock.givenMethodReturnUint(sighashMessageSourceChainId, 2);
      await expect(mock.exec(moduleAddress, 0, ambTx.data)).to.be.revertedWith(
        "Unauthorized chainId"
      );
    });
    it("throws if messageSender is unauthorized", async () => {
      const { mock, module, signers, amb } = await setupTestWithTestAvatar();
      const ambTx = await module.executeTransaction.populateTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );
      const moduleAddress = await module.getAddress();
      const sighashMessageSender =
        amb.interface.getFunction("messageSender").selector;
      await mock.givenMethodReturnUint(
        sighashMessageSender,
        signers[1].address
      );
      await expect(mock.exec(moduleAddress, 0, ambTx.data)).to.be.revertedWith(
        "Unauthorized controller"
      );
    });
    it("throws if module transaction fails", async () => {
      const { mock, module } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const ambTx = await module.executeTransaction.populateTransaction(
        user1.address,
        10000000,
        "0xbaddad",
        0
      );
      // should fail because value is too high
      await expect(mock.exec(moduleAddress, 0, ambTx.data)).to.be.revertedWith(
        "Module transaction failed"
      );
    });
    it("executes a transaction", async () => {
      const { mock, module, signers } = await setupTestWithTestAvatar();
      const moduleAddress = await module.getAddress();
      const moduleTx = await module.setController.populateTransaction(
        signers[1].address
      );
      const ambTx = await module.executeTransaction.populateTransaction(
        moduleAddress,
        0,
        moduleTx.data,
        0
      );
      await mock.exec(moduleAddress, 0, ambTx.data);
      expect(await module.controller()).to.be.equals(signers[1].address);
    });
  });
});
