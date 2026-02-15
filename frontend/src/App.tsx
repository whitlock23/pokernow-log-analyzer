import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import StatsTable from './components/StatsTable'
import PlayerMapping from './components/PlayerMapping'
import { LayoutDashboard, Users, UploadCloud, Menu, X, Github, Moon, Sun } from 'lucide-react'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'mapping'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard'); // Switch to dashboard after upload
  };

  const NavButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
      }}
      className={`${
        activeTab === tab
          ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all w-full sm:w-auto`}
    >
      <Icon 
        size={18} 
        className={`mr-3 ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'}`} 
      />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:shadow-indigo-300 dark:group-hover:shadow-indigo-800/50 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
                  <LayoutDashboard size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                    PokerLog<span className="text-indigo-600 dark:text-indigo-400">Analyzer</span>
                  </h1>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pro Analytics Suite</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <div className="bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 flex gap-2 backdrop-blur-sm">
                <NavButton tab="dashboard" label="Dashboard" icon={LayoutDashboard} />
                <NavButton tab="upload" label="Upload Logs" icon={UploadCloud} />
                <NavButton tab="mapping" label="Player Mapping" icon={Users} />
              </div>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden gap-3">
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl absolute w-full z-50 shadow-lg animate-in slide-in-from-top-5">
            <div className="pt-2 pb-4 space-y-1 px-4">
              <NavButton tab="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <NavButton tab="upload" label="Upload Logs" icon={UploadCloud} />
              <NavButton tab="mapping" label="Player Mapping" icon={Users} />
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatsTable refreshTrigger={refreshTrigger} />
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 p-8 sm:p-10 relative overflow-hidden transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
                        <UploadCloud size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Upload Session Logs</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Import your PokerNow CSV files to generate comprehensive analytics and insights.</p>
                    </div>
                    <Upload onUploadSuccess={handleDataUpdate} />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-xl">
                      <Users size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Player Mapping</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Merge multiple player IDs into single profiles</p>
                    </div>
                 </div>
                 <PlayerMapping onMappingUpdate={handleDataUpdate} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
           <span>PokerLogAnalyzer v1.3</span>
           <span>•</span>
           <span className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
             <Github size={14} /> Open Source
           </span>
        </div>
      </footer>
    </div>
  )
}

export default App