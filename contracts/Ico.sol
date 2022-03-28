//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Ico {
    struct Payment {
        string description;
        uint amount;
        address receiver;
        bool completed;
        address[] voters;
    }

    address public owner;
    string public description;
    uint public minInvest;
    uint public maxInvest;
    uint public goal;
    address[] public investors;
    Payment[] public payments;

    constructor(string memory _description, uint _minInvest, uint _maxInvest, uint _goal) {
        owner = msg.sender;
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
    }

    function contribute() public payable {
        require(msg.value >= minInvest);
        require(msg.value <= maxInvest);
        require(address(this).balance <= goal);

        investors.push(msg.sender);
    }

    function createPayment(string memory _description, uint _amount, address _receiver) public {
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            voters: new address[](0)
        });

        payments.push(newPayment);
    }

    function approvePayment(uint index) public {
        Payment storage payment = payments[index];

        // must be investor to vote
        bool isInvestor = false;
        for (uint i = 0; i < investors.length; i++) {
            isInvestor = investors[i] == msg.sender;
            if (isInvestor) {
                break;
            }
        }
        require(isInvestor);

        // can not vote twice
        bool hasVoted = false;
        for (uint j = 0; j < payment.voters.length; j++) {
            hasVoted = payment.voters[j] == msg.sender;
            if (hasVoted) {
                break;
            }
        }
        require(!hasVoted);

        payment.voters.push(msg.sender);
    }

    function doPayment(uint index) public {
        Payment storage payment = payments[index];

        require(!payment.completed);
        require(payment.voters.length > (investors.length / 2));

        payable(payment.receiver).transfer(payment.amount);
        payment.completed = true;
    }

    function getPaymentVoteByIndex(uint paymentIndex) public view returns (address[] memory voters) {
        Payment storage payment = payments[paymentIndex];
        return payment.voters;
    }
}