import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const user_id = "admin1";
      const res = await getAuditLogs(user_id);
      setLogs(res);
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </div>
  );
};

export default AuditLogs;
