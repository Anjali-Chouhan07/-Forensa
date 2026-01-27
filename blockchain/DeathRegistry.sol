// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeathRegistry {

    mapping(string => string) private records;

    function storeHash(
        string memory patientId,
        string memory finalHash
    ) public {
        records[patientId] = finalHash;
    }

    function getHash(string memory patientId)
        public
        view
        returns (string memory)
    {
        return records[patientId];
    }
}
