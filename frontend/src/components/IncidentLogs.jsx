import React, { useEffect, useState } from 'react';
import { Activity, Loader2, AlertTriangle, CheckCircle, Mail, Globe, Clock, Search } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import axios from 'axios';

const IncidentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/incident-logs');
        setLogs(response.data);
      } catch {
        console.error('Failed to load incident history.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Retrieving Security Events...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="text-bny-gold" /> Security Incident Logs
            </h2>
            <p className="text-gray-400 text-sm mt-1">History of analyzed communications and sites</p>
         </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center p-12 bg-bny-card border border-gray-800 rounded-xl text-gray-500">
            <Search className="mx-auto mb-4 opacity-20" size={48} />
            <p>No incidents recorded yet. Run an analysis to populate logs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <Motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-bny-card border border-gray-800 p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.prediction === 'Phishing' || log.prediction === 'Spam' 
                            ? 'bg-red-900/20 text-red-500' 
                            : 'bg-green-900/20 text-green-500'
                    }`}>
                        {log.prediction === 'Phishing' || log.prediction === 'Spam' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-200">{log.prediction}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                                {(log.confidence * 100).toFixed(1)}% Confidence
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                             {log.type === 'Email Analysis' ? <Mail size={12} /> : <Globe size={12} />}
                             <span className="font-mono text-xs opacity-70 truncate max-w-[300px]">{log.target}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <Clock size={12} /> {log.timestamp}
                    </div>
                    <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-bny-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline focus:opacity-100"
                    >
                        View Details →
                    </button>
                </div>
            </Motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <Motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {selectedLog.type === 'Email Analysis' ? <Mail className="text-bny-gold"/> : <Globe className="text-bny-gold"/>}
                            Incident Details
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">ID: #{selectedLog.id} • {selectedLog.timestamp}</p>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Target Analyzed</h4>
                        <div className="bg-black/50 p-3 rounded border border-gray-800 font-mono text-sm text-gray-300 break-all">
                            {selectedLog.target}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Prediction</h4>
                            <div className={`p-3 rounded border border-gray-800 font-bold ${
                                selectedLog.prediction === 'Phishing' || selectedLog.prediction === 'Spam' ? 'text-red-500 bg-red-900/10' : 'text-green-500 bg-green-900/10'
                            }`}>
                                {selectedLog.prediction}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Confidence</h4>
                            <div className="p-3 rounded border border-gray-800 bg-gray-800/50 text-white">
                                {(selectedLog.confidence * 100).toFixed(4)}%
                            </div>
                        </div>
                    </div>

                    {/* Show Raw Date if available, or just JSON dump for now as fallback for complex objects */}
                    <div>
                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Technical Metadata</h4>
                        <pre className="bg-black/50 p-3 rounded border border-gray-800 font-mono text-xs text-green-400 overflow-x-auto">
                            {JSON.stringify(selectedLog, null, 2)}
                        </pre>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setSelectedLog(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                    >
                        Close
                    </button>
                </div>
            </Motion.div>
        </div>
      )}
    </div>
  );
};

export default IncidentLogs;
