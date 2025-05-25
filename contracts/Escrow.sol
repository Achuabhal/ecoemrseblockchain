pragma solidity ^0.8.0;

contract EscrowManager {
    address public owner;
    
    // Structure to store escrow details (removed deliveryAgent)
    struct Escrow {
        address buyer;
        address payable seller;
        uint amount;
        bool isDelivered;
    }

    // Mapping to store all escrows by a unique ID
    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    // Set the deployer as the contract owner
    constructor() {
        owner = msg.sender;
    }
    
    // Create a new escrow agreement without a delivery agent
    function createEscrow(address _buyer, address payable _seller) public payable {
        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow(_buyer, _seller, msg.value, false);
    }
    
    // Confirm delivery and release funds; only the owner (deployer) can confirm
    function confirmDelivery(uint256 _escrowId) public {
        require(msg.sender == owner, "Only the owner can confirm delivery.");
        Escrow storage escrow = escrows[_escrowId];
        require(!escrow.isDelivered, "Delivery already confirmed.");
        escrow.isDelivered = true;
        escrow.seller.transfer(escrow.amount);
    }
}
