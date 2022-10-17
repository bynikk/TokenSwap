const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokenJSON = require("../artifacts/contracts/PTNToken.sol/PTNToken.json")

describe("PTNShop", function () {
  let owner
  let buyer 
  let shop
  let token

  beforeEach(async function() {
    [owner, buyer] = await ethers.getSigners()

    const PTNShop = await ethers.getContractFactory("PTNShop", owner);
    shop = await PTNShop.deploy()
    await shop.deployed()

    token = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)
  })

  it("should have an owner and a token", async function() {
    expect(await shop.owner()).to.eq(owner.address)

    expect(await shop.token()).to.be.properAddress
  })

  it("allows to free buy", async function() {
    const tokenAmount = 3

    const txData = {
      value : tokenAmount,
      to: shop.address
    }

    const tx = await buyer.sendTransaction(txData)
    await tx.wait();

    expect(await token.balanceOf(buyer.address)).to.eq(tokenAmount)

    await expect(() => tx).
      to.changeEtherBalance(shop, tokenAmount)

    await expect(tx).
    to.emit(shop, "Bought")
    .withArgs(tokenAmount, buyer.address)
  })

  it("allows to sell", async function() {
    const tx = await buyer.sendTransaction({
      value: 3,
      to: shop.address
    })
    await tx.wait()

    const sellAmount = 2

    const approval = await token.connect(buyer).approve(shop.address, sellAmount)

    await approval.wait()

    const sellTx = await shop.connect(buyer).sell(sellAmount)

    expect(await token.balanceOf(buyer.address))
    .to.changeTokenBalances(token, [owner, buyer], [sellAmount, -sellAmount])
    .to.changeEtherBalances([owner, buyer], [sellAmount, -sellAmount])

    await expect(sellTx)
      .to.emit(shop, "Sold")
      .withArgs(sellAmount, buyer.address)
  })
})