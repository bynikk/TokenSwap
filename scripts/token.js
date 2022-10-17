const hre = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} ETH balance: `, await getBalance(address));
    idx ++;
  }
}

// Logs the transfers stored on-chain.
async function printTransfers(transfers) {
  for (const transfer of transfers) {
    const from = transfer.from;
    const to = transfer.to;
    const value = transfer.value;
    console.log(`From ${from} to ${to} - value: "${value}"`);
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const Token = await hre.ethers.getContractFactory("BYNToken");
  const token = await Token.deploy("BYToken", "BY");

  // Deploy the contract.
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, tipper.address, tipper2.address, tipper3.address, token.address];
  console.log("== start ==");
  await printBalances(addresses);

  console.log("Name " + JSON.stringify(token.connect(tipper).name()))
  console.log("Symbol " + token.connect(tipper).symbol())

  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} BY balance: `, await token.balanceOf(address));
    idx ++;
  }
  // mint for tipper 100 tokens
  await token.connect(tipper).freeMint(100);

  idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} BY balance: `, await token.balanceOf(address));
    idx ++;
  }

  // Transfer from tipper to tipper2
  await token.connect(tipper).increaseAllowance(tipper.address, 10);
  await token.connect(tipper).transferFrom(tipper.address, tipper2.address, 10);
  //await token.connect(owner).withdrawFromContract(100);
  console.log("Total supply: " + await token.connect(tipper).totalSupply());

  idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} BY balance: `, await token.balanceOf(address));
    idx ++;
  }
  console.log("==transfers==");
  console.log(token.events?.filter((x) => {return x.event == "Transfer"}));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });