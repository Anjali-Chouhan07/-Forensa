# #Forensa | Detecting Data Manipulation in Forensic & Death Records 🛡️
> **Live Demo:** [https://forensa-5n7e.vercel.app/]

### ⚖️ The Problem
In high-profile cases (e.g., Sexual Assault or Unnatural Death), medical records are vulnerable to **centralized tampering**. A corrupt administrator can alter a "Cause of Death" in a standard database in seconds, leaving no audit trail.

### 🛡️ The Solution
**#Forensa** Even if someone hacks the backend and changes the data, the Blockchain Hash will remain unchanged.
During verification, the system compares the Live Backend vs. the Immutable Ledger. If even a single character is different, the system flags a Security Alert.


---

### 🛠️ Technical Architecture

| Phase | Action | Outcome |
| :--- | :--- | :--- |
| **01. Identity Anchor** | Doctor registers initial death + IPFS cert upload | Initial `DeathHash` generated |
| **02. Forensic Audit** | Pathologist inputs Internal/External/Assault findings | Metadata wrapped in IPFS |
| **03. Cryptographic Seal** | Hashing of all components into a final proof | Immutable Ledger Commitment |
| **04. Integrity Audit** | Verifier compares Live DB vs. Blockchain Anchor | **Fraud Detection** |

**Hashing Logic:**
The system ensures integrity by calculating the final anchor as:
$$FinalHash = \text{SHA256}(DeathHash + ForensicFields + IPFS\_CID)$$

---

### 🏗️ Tech Stack
* **Frontend:** React.js + Tailwind CSS (High-Fidelity Forensic UI)
* **Backend:** FastAPI (Python)
* **Storage:** IPFS via Pinata (Decentralized Evidence)
* **Blockchain:** Solidity Smart Contracts (EVM Compatible)

---

### 🚀 Key Features
* **Immutable Fingerprint:** On-chain storage of record hashes.
* **The Audit Loop:** Real-time detection of database manipulation.
* **Sensitive Data Wrapping:** Medico-legal evidence is stored in encrypted IPFS metadata to protect victim dignity.
