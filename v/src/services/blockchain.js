import Web3 from "web3";
import contractABI from "./DeathRegistry.json";

let web3;
let contract;

const contractAddress = "0x51df50C335FbC482bc68C3c5b012B9C31B804d29"; // IMPORTANT

// Init Web3
if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: "eth_requestAccounts" });
} else {
  alert("Install MetaMask");
}

// Init Contract
contract = new web3.eth.Contract(contractABI, contractAddress);

// Store hash
export const storeHash = async (id, hash) => {
  try {
    const accounts = await web3.eth.getAccounts();

    const tx = await contract.methods
      .storeHash(id, hash)
      .send({
        from: accounts[0],
        gas: 300000,
      });

    return tx;
  } catch (err) {
    console.error("storeHash error:", err);
    throw err;
  }
};

// Get hash



export const getHash = async (id) => {
  const patientId = String(id).trim();
  const accounts = await web3.eth.getAccounts();
  const result = await contract.methods.getHash(patientId).call({ from: accounts[0] });

  return result;
};