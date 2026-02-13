import React from 'react';
import { Radio, Mail, Link as LinkIcon, Activity, FileText } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: IconComponent, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
      active 
        ? 'bg-gradient-to-r from-bny-gold/20 to-transparent border-l-4 border-bny-gold text-bny-gold' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <IconComponent size={20} />
    <span className="font-medium tracking-wide">{label}</span>
  </button>
);

const Layout = ({ children, mode, setMode }) => {
  return (
    <div className="min-h-screen bg-bny-dark text-white font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-gray-800 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-bny-gold to-bny-goldDark rounded-lg flex items-center justify-center shadow-lg shadow-bny-gold/20">
            <Radio className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider">CEREBRO</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Enterprise Security</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-3 px-4">Analysis Modules</h3>
            <SidebarItem 
              icon={Mail} 
              label="Email Scanner" 
              active={mode === 'email'} 
              onClick={() => setMode('email')} 
            />
            <SidebarItem 
              icon={LinkIcon} 
              label="URL Inspector" 
              active={mode === 'url'} 
              onClick={() => setMode('url')} 
            />
          </div>
          
          <div>
            <h3 className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-3 px-4">Reports</h3>
            <SidebarItem 
              icon={Activity} 
              label="Threat Feed" 
              active={mode === 'threat-feed'}
              onClick={() => setMode('threat-feed')}
            />
            <SidebarItem 
              icon={FileText} 
              label="Incident Logs" 
              active={mode === 'incident-logs'}
              onClick={() => setMode('incident-logs')}
            />
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
             <div className="bg-gray-900 rounded p-3 text-xs text-gray-500 text-center">
                System Status: <span className="text-green-500">Online</span>
                <br/>
                v2.1.0-Enterprise
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-800 bg-black/20 flex items-center justify-between px-8 backdrop-blur-sm z-10">
            <h2 className="text-xl font-light text-white">
                {mode === 'email' && 'Email Threat Analysis'}
                {mode === 'url' && 'URL Intelligence Scanner'}
                {mode === 'threat-feed' && 'Threat Intelligence Stream'}
                {mode === 'incident-logs' && 'Incident Response Logs'}
            </h2>
            <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-gray-400">SOC Connected</span>
                <div className="w-8 h-8 rounded-full bg-bny-gold flex items-center justify-center text-black font-bold">
                    A
                </div>
            </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bny-gold/5 via-transparent to-transparent pointer-events-none"></div>
            <Motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto relative z-0"
            >
                {children}
            </Motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
