import axios from "axios";

/* ============================
   Axios Instance
============================ */

const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 20000, // 20 sec max wait
  headers: {
    "Content-Type": "application/json",
  },
});


/* ============================
   Death Report (Doctor)
============================ */

export const submitDeathReport = async (data) => {
  try {

    const res = await API.post("/declare-death", data);

    return res.data;

  } catch (err) {

  console.log("FULL ERROR:", err.response?.data);

  if (err.response?.data?.detail) {
    console.log("VALIDATION ERROR:", err.response.data.detail);
  }

  throw new Error(JSON.stringify(err.response?.data?.detail));
}
};


/* ============================
   Postmortem Report
============================ */

export const submitPostmortemReport = async (data) => {
  try {

    const res = await API.post("/submit-postmortem", data);

    return res.data;

  } catch (err) {

    console.error("❌ Postmortem API Error:", err);

    if (err.response) {
      throw new Error(err.response.data?.message || "Backend Error");
    }

    throw new Error("Server Not Reachable");
  }
};


/* ============================
   Verification (Verifier)
============================ */

export const verifyReport = async (data) => {
  try {

    const res = await API.post("/verify-report", data);

    return res.data;

  } catch (err) {

    console.error("❌ Verify API Error:", err);

    if (err.response) {
      throw new Error(err.response.data?.message || "Backend Error");
    }

    throw new Error("Server Not Reachable");
  }
};


/* ============================
   Check Patient Exists
   (For Postmortem Panel)
============================ */

export const checkPatientExists = async (patient_id) => {
  try {

    const res = await API.get(`/check-patient/${patient_id}`);

    return res.data;

  } catch (err) {

    console.error("❌ Check Patient API Error:", err);

    if (err.response) {
      throw new Error(err.response.data?.message || "Backend Error");
    }

    throw new Error("Server Not Reachable");
  }
};

