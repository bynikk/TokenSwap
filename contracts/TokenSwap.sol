// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SwapManager.sol";

contract TokenSwap {
    mapping(address => mapping(address => uint256)) rates;
    address payable public owner;
    SwapManager swapManager;
    constructor() {
        owner = payable(msg.sender);
        swapManager = new SwapManager(address(this));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function swap(
        uint256 _amount,
        address _token1, // PTN
        address _token2 // BYN
    ) public {
        uint256 totalAmount = uint256(
            _amount * rates[_token1][_token2]);

        IERC20(_token1).approve(address(this), _amount);
        _safeTransferFrom(msg.sender, address(this), _token1, _amount);
        //_safeTransferFrom(address(this), msg.sender, _token2, totalAmount);
        require(IERC20(_token2).balanceOf(address(this)) >= totalAmount, "Tokens of this type not enoght on contract balance!");
        IERC20(_token2).approve(address(swapManager), totalAmount);
        swapManager.SendTokensForSwap(_token2, msg.sender, totalAmount);
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
        bool transfer = ERC20(_token).transferFrom(_sender, _recipient, _amount);
        require(transfer, "Transfer failed!");
    }

    function depositToken(address token, uint256 amount) external {

        ERC20(token).transfer(address(this), amount);
    }
}
