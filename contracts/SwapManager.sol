// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SwapManager {
    address payable public tokenSwap;

    constructor (address _tokenSwap) {
        tokenSwap = payable(_tokenSwap);
    }

    function SendTokensForSwap(address _token, address _to, uint256 _amount) public {
        bool transfer = ERC20(_token).transferFrom(tokenSwap, _to, _amount);
        require(transfer, "Transfer failed!");
    }
}