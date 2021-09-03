import { expect } from "chai";
import hre, { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { AbiCoder } from "ethers/lib/utils";

const ZeroAddress = "0x0000000000000000000000000000000000000000";
const FortyTwo =
  "0x000000000000000000000000000000000000000000000000000000000000002a";

describe("AMBModule", async () => {
  let initializeParams: string;

  const baseSetup = deployments.createFixture(async () => {
    await deployments.fixture();
    const Executor = await hre.ethers.getContractFactory("TestExecutor");
    const executor = await Executor.deploy();
    const Mock = await hre.ethers.getContractFactory("Mock");
    const mock = await Mock.deploy();
    const amb = await hre.ethers.getContractAt("IAMB", mock.address);
    const badMock = await Mock.deploy();
    const badAmb = await hre.ethers.getContractAt("IAMB", badMock.address);

    const signers = await hre.ethers.getSigners();

    await mock.givenMethodReturnUint(
      amb.interface.getSighash("messageSourceChainId"),
      1
    );
    await badMock.givenMethodReturnUint(
      badAmb.interface.getSighash("messageSourceChainId"),
      2
    );
    await mock.givenMethodReturnAddress(
      amb.interface.getSighash("messageSender"),
      signers[0].address
    );
    await badMock.givenMethodReturnAddress(
      badAmb.interface.getSighash("messageSender"),
      signers[1].address
    );

    initializeParams = new AbiCoder().encode(
      ["address", "address", "address", "address", "bytes32"],
      [
        executor.address,
        executor.address,
        amb.address,
        signers[0].address,
        await amb.messageSourceChainId(),
      ]
    );

    return { Executor, executor, module, mock, badMock, amb, badAmb, signers };
  });

  const setupTestWithTestExecutor = deployments.createFixture(async () => {
    const base = await baseSetup();
    const Module = await hre.ethers.getContractFactory("AMBModule");
    const provider = await hre.ethers.getDefaultProvider();
    const network = await provider.getNetwork();
    const module = await Module.deploy(
      base.executor.address,
      base.executor.address,
      base.amb.address,
      base.signers[0].address,
      base.amb.messageSourceChainId()
    );
    await base.executor.setModule(module.address);
    return { ...base, Module, module, network };
  });

  const [user1] = waffle.provider.getWallets();

  describe("setUp()", async () => {
    it("throws if its already initialized", async () => {
      await baseSetup();
      const Module = await hre.ethers.getContractFactory("AMBModule");
      const module = await Module.deploy(
        user1.address,
        user1.address,
        ZeroAddress,
        ZeroAddress,
        FortyTwo
      );
      await expect(module.setUp(initializeParams)).to.be.revertedWith(
        "Module is already initialized"
      );
    });
    it("throws if executor is address zero", async () => {
      const { Module } = await setupTestWithTestExecutor();
      await expect(
        Module.deploy(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          FortyTwo
        )
      ).to.be.revertedWith("Executor can not be zero address");
    });
  });

  describe("setAmb()", async () => {
    it("throws if not authorized", async () => {
      const { module } = await setupTestWithTestExecutor();
      await expect(module.setAmb(module.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("throws if already set to input address", async () => {
      const { module, executor, amb } = await setupTestWithTestExecutor();

      expect(await module.amb()).to.be.equals(amb.address);

      const calldata = module.interface.encodeFunctionData("setAmb", [
        amb.address,
      ]);
      await expect(
        executor.exec(module.address, 0, calldata)
      ).to.be.revertedWith("AMB address already set to this");
    });

    it("updates AMB address", async () => {
      const { module, executor, amb } = await setupTestWithTestExecutor();

      expect(await module.amb()).to.be.equals(amb.address);

      const calldata = module.interface.encodeFunctionData("setAmb", [
        user1.address,
      ]);
      executor.exec(module.address, 0, calldata);

      expect(await module.amb()).to.be.equals(user1.address);
    });
  });

  describe("setChainId()", async () => {
    it("throws if not authorized", async () => {
      const { module } = await setupTestWithTestExecutor();
      await expect(module.setChainId(FortyTwo)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("throws if already set to input address", async () => {
      const { module, executor, network } = await setupTestWithTestExecutor();
      const currentChainID = await module.chainId();

      const calldata = module.interface.encodeFunctionData("setChainId", [
        currentChainID,
      ]);
      await expect(
        executor.exec(module.address, 0, calldata)
      ).to.be.revertedWith("chainId already set to this");
    });

    it("updates chainId", async () => {
      const { module, executor, network } = await setupTestWithTestExecutor();
      let currentChainID = await module.chainId();
      const newChainID = FortyTwo;
      expect(await currentChainID._hex).to.not.equals(newChainID);

      const calldata = module.interface.encodeFunctionData("setChainId", [
        newChainID,
      ]);
      executor.exec(module.address, 0, calldata);

      currentChainID = await module.chainId();

      expect(await currentChainID).to.be.equals(newChainID);
    });
  });

  describe("setController()", async () => {
    it("throws if not authorized", async () => {
      const { module, signers } = await setupTestWithTestExecutor();
      await expect(
        module.connect(signers[3]).setController(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("throws if already set to input address", async () => {
      const { module, executor } = await setupTestWithTestExecutor();
      const currentController = await module.controller();

      const calldata = module.interface.encodeFunctionData("setController", [
        currentController,
      ]);
      await expect(
        executor.exec(module.address, 0, calldata)
      ).to.be.revertedWith("controller already set to this");
    });

    it("updates controller", async () => {
      const { module, executor, signers } = await setupTestWithTestExecutor();
      let currentController = await module.owner();
      let newController = signers[1].address;

      expect(await currentController).to.not.equals(signers[1].address);

      const calldata = module.interface.encodeFunctionData("setController", [
        newController,
      ]);
      executor.exec(module.address, 0, calldata);

      currentController = await module.controller();
      expect(await module.controller()).to.be.equals(newController);
    });
  });

  describe("executeTrasnaction()", async () => {
    it("throws if amb is unauthorized", async () => {
      const { module } = await setupTestWithTestExecutor();
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
      const { mock, module, amb } = await setupTestWithTestExecutor();
      const ambTx = await module.populateTransaction.executeTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );

      await mock.givenMethodReturnUint(
        amb.interface.getSighash("messageSourceChainId"),
        2
      );

      await expect(mock.exec(module.address, 0, ambTx.data)).to.be.revertedWith(
        "Unauthorized chainId"
      );
    });

    it("throws if messageSender is unauthorized", async () => {
      const { mock, module, signers, amb } = await setupTestWithTestExecutor();
      const ambTx = await module.populateTransaction.executeTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );

      await mock.givenMethodReturnUint(
        amb.interface.getSighash("messageSender"),
        signers[1].address
      );

      await expect(mock.exec(module.address, 0, ambTx.data)).to.be.revertedWith(
        "Unauthorized controller"
      );
    });

    it("throws if module transaction fails", async () => {
      const { mock, module } = await setupTestWithTestExecutor();
      const ambTx = await module.populateTransaction.executeTransaction(
        user1.address,
        10000000,
        "0xbaddad",
        0
      );

      // should fail because value is too high
      await expect(mock.exec(module.address, 0, ambTx.data)).to.be.revertedWith(
        "Module transaction failed"
      );
    });

    it("executes a transaction", async () => {
      const { mock, module, signers } = await setupTestWithTestExecutor();

      const moduleTx = await module.populateTransaction.setController(
        signers[1].address
      );

      const ambTx = await module.populateTransaction.executeTransaction(
        module.address,
        0,
        moduleTx.data,
        0
      );

      await mock.exec(module.address, 0, ambTx.data);

      expect(await module.controller()).to.be.equals(signers[1].address);
    });
  });
});
