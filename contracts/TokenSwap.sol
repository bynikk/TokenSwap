// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap {
    mapping(address => mapping(address => uint256)) rates;
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function swap(
        uint256 _amount,
        address _token1,
        address _token2
    ) public {
        uint256 totalAmount = uint256(
            _amount * rates[_token1][_token2]);

        _safeTransferFrom(msg.sender, address(this), _token1, _amount);
        _safeTransferFrom(address(this), msg.sender, _token2, totalAmount);
    }

    function setRation(
        address token1,
        address token2,
        uint ration
    ) public onlyOwner {
        rates[token1][token2] = ration;
    }

    function getRation(
        address token1,
        address token2
    ) public view returns (uint256) {
        return rates[token1][token2];
    }

    function _safeTransferFrom(
        address _sender,
        address _recipient,
        address _token,
        uint256 _amount
    ) private {
        bool transfer = IERC20(_token).transferFrom(_sender, _recipient, _amount);
        require(transfer, "Transfer failed!");
    }
}
