const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("BYNToken");
    const token = await Token.deploy();

    // Deploy the contract.
    await token.deployed();
    console.log("deployed to:", token.address);
}
// BYNToken - 0x768d3A8a8660ff4dfB65287711B85654677cf3e2

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });