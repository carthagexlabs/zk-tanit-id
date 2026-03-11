import React from "react";

interface CredentialMeta {
  type: string;
  expiry: string;
  issuer: string;
}

export default function CredentialDashboard({ creds }: { creds: CredentialMeta[] }) {
  const now = new Date();

  const checkStatus = (expiry: string) => {
    const exp = new Date(expiry);
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (isNaN(diffDays)) return "⚪ Unknown";
    if (diffDays <= 0) return "🔴 Expired";
    if (diffDays < 30) return "🟡 Expiring Soon";
    return "🟢 Valid";
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h2>My Credentials</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Type</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Issuer</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Expiry</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {creds.map((c, i) => (
            <tr key={i}>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{c.type}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{c.issuer}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{c.expiry}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{checkStatus(c.expiry)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
