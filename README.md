# -Forensa : Live Link [https://forensa-5n7e.vercel.app/]
 Blockchain-Backed Forensic Shield 🛡️
            Detecting Data Manipulation in Forensic & Death Records

•The Problem: In high-profile cases (e.g., Sexual Assault or Unnatural Death), victims and doctors often face extreme pressure to change reports. In a standard database, a corrupt admin can change the "Cause of Death" in seconds, leaving no trace.

•The Solution: #Forensa anchors the "Truth" to the Blockchain.

 Even if someone hacks the backend and changes the data, the Blockchain Hash will remain unchanged.
During verification, the system compares the Live Backend vs. the Immutable Ledger. If even a single character is different, the system flags a Security Alert.

•Immutable Fingerprint: Once a report is signed, its hash is stored on-chain.
•The Audit Loop: If anyone alters the local database, the system instantly detects a Hash Mismatch.
•Decentralized Evidence: High-res forensic images and sensitive text are wrapped in IPFS Metadata, ensuring the original evidence can always be recovered.

🛠️ Technical Architecture
1) Doctor Registration: Initial death declaration + IPFS Certificate upload.
2) Forensic Audit: Specialist fills detailed forensic fields (External/Internal/Sensitive findings Hash)
3) Chaining: $FinalHash = Hash(DeathHash + ForensicFields + IPFS\_CID)$.
4) Blockchain Commitment: The final hash is anchored to a Smart Contract.Audit Loop: Verifier compares $Backend\_Hash \stackrel{?}{=} Blockchain\_Hash$.

Tech Stack:

•Frontend: React + Tailwind (Modern Forensic UI)
•Backend: FastAPI (Python)
•Storage: IPFS (via Pinata)
•Blockchain: Solidity Smart Contracts


