// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BYNToken is ERC20 {
     
    address public owner;
    uint public initialSupply = 1000;

    constructor(address shop) ERC20("BYNToken", "BYN") {
        owner = msg.sender;
        // Mint 100 tokens to shop
        _mint(shop, initialSupply * 10 ** uint(decimals()));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Not valid address");
        _;
    }
    
    function changeOwner(address _newOwner) public onlyOwner validAddress(_newOwner) {
        owner = _newOwner;
    }

    function changeInitialSupply(uint _newSupply) public onlyOwner {
        require(_newSupply >= 0);
        initialSupply = _newSupply;
    }
}
