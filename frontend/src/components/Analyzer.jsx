import React, { useState } from 'react';
import axios from 'axios';
import ExplanationViz from './ExplanationViz';
import CertNotification from './CertNotification';
import { Loader2, Search, AlertTriangle, CheckCircle, Shield, Globe, Lock } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Analyzer = ({ mode }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = mode === 'email' ? 'http://localhost:5000/api/analyze/email' : 'http://localhost:5000/api/analyze/url';
  const placeholder = mode === 'email' 
    ? "Paste the email header and body here for deep analysis..." 
    : "Enter the full URL (e.g., http://suspicious-site.com/login)...";

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = mode === 'email' ? { text: input } : { url: input };
      const response = await axios.post(endpoint, payload);
      setResult(response.data);
    } catch (err) {
        console.error(err);
      setError("Analysis failed. Please check the backend connection.");
    }
    setLoading(false);
  };

  const isPhishing = result && (result.prediction === 'Spam' || result.prediction === 'Phishing');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      
      {/* Input Section */}
      <Motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bny-card border border-gray-800 rounded-xl p-1 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-bny-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <textarea
          className="w-full h-48 p-6 bg-black/40 text-gray-200 resize-none font-mono text-sm border-none focus:ring-0 placeholder-gray-600 focus:bg-black/60 transition-colors rounded-lg"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="bg-gray-900/80 p-3 flex justify-between items-center rounded-b-lg border-t border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                {mode === 'email' ? <Lock size={12} /> : <Globe size={12} />}
                <span>Secure Input Channel • End-to-End Encrypted</span>
            </div>
            <button
                onClick={handleAnalyze}
                disabled={loading || !input.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-bny-gold to-bny-goldDark hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-bny-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Processing...' : 'Run Analysis'}
            </button>
        </div>
      </Motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
            <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded flex items-center gap-3"
            >
            <AlertTriangle size={20} /> {error}
            </Motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Score Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={`p-6 rounded-xl border border-gray-800 bg-black/40 backdrop-blur-sm relative overflow-hidden ${isPhishing ? 'shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_30px_rgba(34,197,94,0.1)]'}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${isPhishing ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Risk Assessment</h3>
                        
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-3xl font-bold ${isPhishing ? 'text-red-500' : 'text-green-500'}`}>
                                {result.prediction.toUpperCase()}
                            </span>
                            {isPhishing ? <AlertTriangle size={32} className="text-red-500" /> : <Shield size={32} className="text-green-500" />}
                        </div>
                        
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                            <div 
                                className={`h-full ${isPhishing ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-500 font-mono">
                            <span>Confidence Signal</span>
                            <span>{(result.confidence * 100).toFixed(2)}%</span>
                        </div>
                        
                        {/* Threat Intel Widget */}
                        {result.third_party_analysis && (
                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <h4 className="text-xs text-bny-gold uppercase tracking-widest mb-3">Live Forensics & Intel</h4>
                                <div className="space-y-3">
                                    {/* Main Threat Source */}
                                    <div className="bg-white/5 rounded p-3 text-sm border border-gray-700/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400">Threat Database</span>
                                            <span className="text-xs text-gray-500">{result.third_party_analysis.source}</span>
                                        </div>
                                        <div className={`font-bold flex items-center gap-2 ${
                                            result.third_party_analysis.status === 'Clean' || result.third_party_analysis.status === 'Clean' 
                                                ? 'text-green-400' 
                                                : 'text-red-400'
                                        }`}>
                                            {result.third_party_analysis.status === 'Clean' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                                            {result.third_party_analysis.status}
                                        </div>
                                    </div>

                                    {/* Forensic Details (If available) */}
                                    {result.third_party_analysis.forensics && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* DNS */}
                                            <div className="bg-black/40 rounded p-3 text-xs border border-gray-800">
                                                <div className="text-gray-500 mb-1">DNS Resolution</div>
                                                <div className="font-mono text-gray-300">
                                                    {result.third_party_analysis.forensics.dns.status === 'Active' 
                                                        ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Active</span> 
                                                        : <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> {result.third_party_analysis.forensics.dns.status}</span>
                                                    }
                                                </div>
                                                <div className="text-gray-600 mt-1 truncate" title={result.third_party_analysis.forensics.dns.ip}>
                                                    {result.third_party_analysis.forensics.dns.ip}
                                                </div>
                                            </div>

                                            {/* SSL */}
                                            <div className="bg-black/40 rounded p-3 text-xs border border-gray-800">
                                                <div className="text-gray-500 mb-1">SSL Certificate</div>
                                                <div className="font-mono text-gray-300">
                                                    {result.third_party_analysis.forensics.ssl.valid 
                                                        ? <span className="text-green-400 flex items-center gap-1"><Lock size={10} /> Valid</span> 
                                                        : <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> Invalid</span>
                                                    }
                                                </div>
                                                <div className="text-gray-600 mt-1 truncate" title={result.third_party_analysis.forensics.ssl.issuer}>
                                                    {result.third_party_analysis.forensics.ssl.issuer || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isPhishing && (
                             <div className="mt-6">
                                <CertNotification type={mode === 'email' ? 'Phishing Email' : 'Malicious URL'} content={input} />
                             </div>
                        )}
                    </div>
                </div>

                {/* Explanation Viz */}
                <div className="lg:col-span-2">
                    <ExplanationViz attributions={result.attributions} prediction={result.prediction} />
                </div>

            </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analyzer;
