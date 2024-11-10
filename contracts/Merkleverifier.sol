// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MerkleVerification {

    address public owner;
    bytes32 public merkleRoot;  // The stored Merkle root

    // Event to emit when Merkle root is updated
    event MerkleRootUpdated(bytes32 indexed newMerkleRoot);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;  // Set the contract creator as the owner
    }
    function setMerkleRoot(bytes32 _merkleRoot) public  {
        merkleRoot = _merkleRoot;
        // emit MerkleRootUpdated(_merkleRoot);
    }
    function getMerkleRoot() public view returns (bytes32) {
        return merkleRoot;
    }


    function verifyTransaction(bytes32 transactionHash, bytes32[] calldata proof) public view returns (bool) {
        bytes32 computedHash = transactionHash;
        
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = _computeMerkleHash(computedHash, proof[i], i % 2 == 0);
        }

        return computedHash == merkleRoot;
    }

    function _computeMerkleHash(bytes32 left, bytes32 right, bool isLeft) internal pure returns (bytes32) {
        if (isLeft) {
            return keccak256(abi.encodePacked(left, right));
        } else {
            return keccak256(abi.encodePacked(right, left));
        }
    }

}
