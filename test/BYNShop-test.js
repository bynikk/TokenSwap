const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokenJSON = require("../artifacts/contracts/BYNToken.sol/BYNToken.json")

describe("BYNShop", function () {
  let owner
  let buyer 
  let shop
  let token

  let freeReceiveTokenAmount = 100;

  beforeEach(async function() {
    [owner, buyer] = await ethers.getSigners()

    const BYNShop = await ethers.getContractFactory("BYNShop", owner);
    shop = await BYNShop.deploy()
    await shop.deployed()

    token = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)
  })

  it("should have an owner and a token", async function() {
    expect(await shop.owner()).to.eq(owner.address)

    expect(await token.balanceOf(shop.address)).to.be.equal(ethers.utils.parseUnits("1000", 18))
    expect(await shop.token()).to.be.properAddress
  })

  it("allows to free buy", async function() {
    const tokenAmount = ethers.utils.parseUnits("100", 18)

    let freeTxn = await shop.connect(buyer).freeReceive()
    expect(await freeTxn.wait())
    .to.changeTokenBalances(token, [owner, buyer], [-tokenAmount, tokenAmount]);

    await expect(freeTxn).
    to.emit(shop, "Bought")
    .withArgs(tokenAmount, buyer.address)
  })

  it("allows to sell", async function() {
    const tokenAmount = ethers.utils.parseUnits("100", 18)

    let freeTxn = await shop.connect(buyer).freeReceive()
    expect(await freeTxn.wait())
    .to.changeTokenBalances(token, [owner, buyer], [-tokenAmount, tokenAmount]);

    const sellAmount = ethers.utils.parseUnits("50", 18)

    const approval = await token.connect(buyer).approve(shop.address, sellAmount)
    await approval.wait()

    const sellTx = await shop.connect(buyer).sell(sellAmount)

    expect(await token.balanceOf(buyer.address))
    .to.changeTokenBalances(token, [owner, buyer], [sellAmount, -sellAmount]);

    await expect(sellTx)
      .to.emit(shop, "Sold")
      .withArgs(sellAmount, buyer.address)
  })
})