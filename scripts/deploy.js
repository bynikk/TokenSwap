const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("BYNShop");
    const token = await Token.deploy();

    // Deploy the contract.
    await token.deployed();
    console.log("deployed to:", token.address);
}
//! BYNShop - 0xbB76CFc48e94d9F4c1877e06eB8302e958EB6817
// PTNShop - 0x1eE758C297F7eacD9E1f1570d27Bcb5F8D491075

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });