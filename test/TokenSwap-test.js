const { expect } = require("chai");
const { ethers } = require("hardhat");
const token1JSON = require("../artifacts/contracts/BYNToken.sol/BYNToken.json");
const token2JSON = require("../artifacts/contracts/PTNToken.sol/PTNToken.json");

describe("TokenSwap", function () {
  let owner;
  let swapper;
  let swap;
  let token1; // PTN
  let token2; // BYN
  let token1Shop; // PTN
  let token2Shop; // BYN

  beforeEach(async function () {
    [owner, swapper] = await ethers.getSigners();

    // deploy token1Shop (PTNShop) contract
    const BYNShop = await ethers.getContractFactory("PTNShop", owner);
    token1Shop = await BYNShop.deploy();
    await token1Shop.deployed();

    // deploy token2Shop (BYNShop) contract
    const PTNShop = await ethers.getContractFactory("BYNShop", owner);
    token2Shop = await PTNShop.deploy();
    await token2Shop.deployed();

    // deploy token swap contract
    const TokenSwap = await ethers.getContractFactory("TokenSwap", owner);
    swap = await TokenSwap.deploy();
    await swap.deployed();

    token1 = new ethers.Contract(
      await token1Shop.token(),
      token1JSON.abi,
      owner
    );
    token2 = new ethers.Contract(
      await token2Shop.token(),
      token2JSON.abi,
      owner
    );
  });

  it("should have an owner for each contract", async function () {
    expect(await swap.owner()).to.eq(owner.address);
  });

  it("should have an rates", async function () {
    const swapRatio = 2;
    const setRateTx = await swap
      .connect(owner)
      .setRation(token1.address, token2.address, swapRatio);
    expect(await swap.getRation(token1.address, token2.address)).to.be.equal(
      swapRatio
    );
  });

  it("allow to swap from PTN to BYN", async function () {
    const ptnTokenAmount = ethers.utils.parseUnits("3", 18);
    const bynTokenAmount = ethers.utils.parseUnits("100", 18);
    const swapAmount = ethers.utils.parseUnits("3", 18);
    const swapRatio = 4;

    // buy ptn tokens for swapper
    const tx = await swapper.sendTransaction({
      value: ptnTokenAmount,
      to: token1Shop.address,
    });
    await tx.wait();

    //buy BYN tokens for swap
    const freeTxn = await token2Shop.connect(owner).freeReceive();
    await freeTxn.wait();
    await token2.connect(owner).transfer(swap.address, bynTokenAmount);

    //set ration for PTN->BYN
    const setRateTx = await swap
      .connect(owner)
      .setRation(token1.address, token2.address, swapRatio);
    await setRateTx.wait();
    // approve amount to swap
    const approval = await token1
      .connect(swapper)
      .approve(swap.address, swapAmount);
    await approval.wait();

    // invoke swap function token1(PTN) to token2(BYN)
    let swapTxn = await swap
      .connect(swapper)
      .swap(swapAmount, token1.address, token2.address);

    expect(await swapTxn.wait())
      .to.changeTokenBalances(
        token1,
        [swapper, swap],
        [-swapAmount, swapAmount]
      )
      .to.changeTokenBalances(
        token2,
        [swapper, swap],
        [swapAmount * swapRatio, -(swapAmount * swapRatio)]
      );
  });

  it("allow to swap from BYN to PTN", async function () {
    const ptnTokenAmount = ethers.utils.parseUnits("12", 18);
    const bynTokenAmount = ethers.utils.parseUnits("3", 18);
    const swapAmount = ethers.utils.parseUnits("3", 18);
    const swapRatio = 4;

    //buy PTN tokens for swap
    const tx = await owner.sendTransaction({
      value: ptnTokenAmount,
      to: token1Shop.address,
    });
    await tx.wait();
    await token1.connect(owner).transfer(swap.address, ptnTokenAmount);

    //buy BYN tokens for swap
    const freeTxn = await token2Shop.connect(owner).freeReceive();
    await freeTxn.wait();
    await token2.connect(owner).transfer(swapper.address, bynTokenAmount);

    //set ration for BYN->PTN
    const setRateTx = await swap
      .connect(owner)
      .setRation(token2.address, token1.address, swapRatio);
    await setRateTx.wait();

    // approve amount to swap
    const approval = await token2
      .connect(swapper)
      .approve(swap.address, swapAmount);
    await approval.wait();

    // invoke swap function token2(BYN) to token1(PTN)
    let swapTxn = await swap
      .connect(swapper)
      .swap(swapAmount, token2.address, token1.address);

    expect(await swapTxn.wait())
      .to.changeTokenBalances(
        token2,
        [swapper, swap],
        [-swapAmount, swapAmount]
      )
      .to.changeTokenBalances(
        token1,
        [swapper, swap],
        [swapAmount * swapRatio, -(swapAmount * swapRatio)]
      );
  });
});
