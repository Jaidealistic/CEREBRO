import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';

const CertNotification = ({ type, content }) => {
  const [loading, setLoading] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportId, setReportId] = useState(null);

  const handleReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/notify-cert', {
        type,
        content
      });
      setReportId(response.data.report_id);
      setReported(true);
    } catch (error) {
      console.error("Failed to report", error);
    }
    setLoading(false);
  };

  if (reported) {
     return (
        <div className="mt-4 p-3 bg-green-900/30 text-green-400 rounded border border-green-800">
           <div className="flex items-center gap-2 mb-1">
                <ShieldAlert size={20} />
                <span className="font-bold">Reported to CERT</span>
           </div>
           <div className="text-xs text-gray-400 font-mono ml-7">
                Ref ID: {reportId || 'PENDING-ACK'}
           </div>
        </div>
     );
  }

  return (
    <button
      onClick={handleReport}
      disabled={loading}
      className={`mt-4 flex items-center gap-2 px-4 py-2 rounded bg-red-800 hover:bg-red-700 text-white font-medium transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <ShieldAlert size={20} />
      {loading ? 'Reporting...' : 'Report Phishing to CERT'}
    </button>
  );
};

export default CertNotification;
