const hre = require("hardhat");

async function main() {
  const Swap = await hre.ethers.getContractFactory("TokenSwap");
  const swap = await Token.deploy();
  const setRateTx = await swap
    .connect(owner)
    .setRation(token1.address, token2.address, swapRatio);
  await setRateTx.wait();
  // Deploy the contract.
  await token.deployed();
  console.log("Token swap deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
