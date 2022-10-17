// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BYNToken.sol";

contract BYNShop {
    IERC20 public token;
    uint freeReceiveTokenAmount = 100;
    address payable public owner;
    event Bought(uint _amount, address _buyer);
    event Sold(uint _amount, address _seller);

    constructor() {
        token = new BYNToken(address(this));
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    function sell(uint _amountToSell) external {
        require(
            _amountToSell > 0 &&
            token.balanceOf(msg.sender) >= _amountToSell,
            "incorrect amount!"
        );

        uint allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _amountToSell, "check allowance!");

        token.transferFrom(msg.sender, address(this), _amountToSell);

        emit Sold(_amountToSell, msg.sender);
    }

    function freeReceive() public {
        uint tokensToBuy = freeReceiveTokenAmount * 10 ** 18;
        require(tokensToBuy > 0, "not enough funds!");

        token.transfer(msg.sender, tokensToBuy);
        emit Bought(tokensToBuy, msg.sender);
    }

    function tokenBalance() public view returns(uint) {
        return token.balanceOf(address(this));
    }

    function changeFreeReceiveAmount(uint newFreeReceiveTokenAmount) public onlyOwner {
        freeReceiveTokenAmount = newFreeReceiveTokenAmount;
    }
}