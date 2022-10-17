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

    // deploy token1Shop (BYNShop) contract
    const BYNShop = await ethers.getContractFactory("PTNShop", owner);
    token1Shop = await BYNShop.deploy();
    await token1Shop.deployed();

    // deploy token2Shop (PTNShop) contract
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
    expect(await token1Shop.owner()).to.eq(owner.address);
    expect(await token2Shop.owner()).to.eq(owner.address);
  });

  it("should have an token for each shop contract", async function () {
    expect(await token1Shop.token()).to.be.properAddress;
    expect(await token2Shop.token()).to.be.properAddress;
  });

  it("should have an rates", async function () {
    const setRateTx = await swap
      .connect(owner)
      .setRation(
        token1.address,
        token2.address,
        ethers.utils.parseUnits("2", 18)
      );
    expect(await swap.getRation(token1.address, token2.address)).to.be.equal(
      ethers.utils.parseUnits("2", 18)
    );
  });

  it("allow to swap from PTN to BYN", async function () {
    const ptnTokenAmount = 3;
    const swapAmount = 2;
    // buy ptn tokens for swapper
    const tx = await swapper.sendTransaction({
      value: ptnTokenAmount,
      to: token1Shop.address,
    });
    await tx.wait();
    //buy byn tokens for swap
    await token2Shop.connect(owner).freeReceive();
    await token2.connect(owner).approve(token2.address, ptnTokenAmount);
    await token2.connect(owner).transferFrom(owner.address, token2Shop.address, ptnTokenAmount);
    //set ration for PTN->BYN
    const setRateTx = await swap
      .connect(owner)
      .setRation(
        token2.address,
        token1.address,
        ethers.utils.parseUnits("3", 18)
      );
    // approve amount to swap
    const approval = await token1
      .connect(swapper)
      .approve(swap.address, swapAmount);
    await approval.wait();
    // invoke swap function
    let swapTxn = await swap
      .connect(swapper)
      .swap(swapAmount, token1.address, token2.address);

    let ratio = await swap.getRation(token1.address, token2.address);
    expect(await swapTxn.wait())
      .to.changeTokenBalances(
        token1,
        [swapper, swap],
        [-swapAmount, swapAmount]
      )
      .to.changeTokenBalances(
        token2,
        [swapper, swap],
        [(swapAmount * ratio), -(swapAmount * ratio)]
      );
  });
});
