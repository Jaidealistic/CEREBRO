import React, { useState } from 'react';
import Analyzer from './components/Analyzer';
import Layout from './components/Layout';
import ThreatFeed from './components/ThreatFeed';
import IncidentLogs from './components/IncidentLogs';

function App() {
  const [mode, setMode] = useState('email'); // 'email' or 'url'

  return (
    <Layout mode={mode} setMode={setMode}>
        {/* Dynamic Header Text */}
        <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                {mode === 'email' && 'Analyze Suspicious Communications'}
                {mode === 'url' && 'Verify URL Reputation'}
                {mode === 'threat-feed' && 'Global Threat Intelligence'}
                {mode === 'incident-logs' && 'Security Incident History'}
            </h1>
            <p className="text-bny-muted text-lg max-w-2xl">
                 {mode === 'email' && 'Advanced NLP engine detects semantic anomalies and urgency triggers in email bodies.'}
                 {mode === 'url' && 'Real-time threat intelligence checks combined with BERT-based heuristic analysis.'}
                 {mode === 'threat-feed' && 'Live stream of malicious indicators from internal and external sources.'}
                 {mode === 'incident-logs' && 'Audit trail of all analyzed artifacts and their risk assessments.'}
            </p>
        </div>

        {mode === 'email' || mode === 'url' ? (
          <Analyzer mode={mode} key={mode} />
        ) : mode === 'threat-feed' ? (
          <ThreatFeed />
        ) : (
          <IncidentLogs />
        )}
    </Layout>
  );
}

export default App;

