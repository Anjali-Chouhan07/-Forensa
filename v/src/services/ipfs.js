import axios from "axios";

/*
  Uploads a file to IPFS using Pinata
  Returns: CID (IpfsHash)
*/

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("IPFS upload failed:", error);
    throw error;
  }
};
