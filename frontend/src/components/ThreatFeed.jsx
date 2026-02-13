import React, { useEffect, useState } from 'react';
import { Shield, ExternalLink, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import axios from 'axios';

const ThreatFeed = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/threat-feed');
        setThreats(response.data);
      } catch {
        setError('Failed to load threat feed. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Syncing with Global Threat Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded flex items-center gap-3">
        <AlertTriangle size={20} /> {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-bny-gold" /> Global Threat Intelligence
            </h2>
            <p className="text-gray-400 text-sm mt-1">Real-time feed from URLHaus & Global Defense Network</p>
         </div>
         <div className="px-4 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-mono border border-green-800 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE FEED
         </div>
      </div>

      <div className="bg-bny-card border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/40 text-xs uppercase bg-gray-900/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Threat Source</th>
                <th className="px-6 py-4">Indicator (URL/Hash)</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {threats.map((threat, index) => (
                <Motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white">{threat.source}</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-400 truncate max-w-xs" title={threat.url}>
                    {threat.url}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-900/30">
                        <AlertTriangle size={10} /> {threat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-500 font-bold">{threat.severity}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{threat.timestamp}</td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatFeed;
