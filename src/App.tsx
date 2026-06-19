import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, isSupabaseConfigured } from './supabaseClient';
import { Participant, AppView } from './types';
import BackgroundPattern from './components/BackgroundPattern';
import WelcomeScreen from './components/WelcomeScreen';
import ParticipantGrid from './components/ParticipantGrid';
import AdminPanel from './components/AdminPanel';
import NotFound from './components/NotFound';
import { ShieldCheck, Database, RefreshCw } from 'lucide-react';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [appView, setAppView] = useState<AppView>('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverError, setServerError] = useState('');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Monitor path changes for simple client-side routing
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Override pushState & replaceState to listen to inside-app navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Fetch participants function with loader settings
  const loadData = useCallback(async (showQuietSync = false) => {
    if (showQuietSync) {
      setIsSyncing(true);
    } else {
      setIsLoading(true);
    }
    setServerError('');
    try {
      const data = await db.fetchParticipants();
      setParticipants(data);
    } catch (e: any) {
      console.error('Lỗi khi tải dữ liệu người tham gia:', e);
      setServerError('Có lỗi xảy ra khi đồng bộ với cơ sở dữ liệu. Đang chuyển sang dữ liệu nội bộ.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Sync data on initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Database operations
  const handleAddParticipant = async (name: string, code: string, avatarUrl: string, is_active: boolean) => {
    setIsSyncing(true);
    try {
      const newParticipant = await db.insertParticipant({
        name,
        code,
        avatar_url: avatarUrl,
        is_active
      });
      // Prepend to state list
      setParticipants(prev => [newParticipant, ...prev]);
      return newParticipant;
    } catch (err: any) {
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateParticipant = async (id: string, updates: Partial<Participant>) => {
    setIsSyncing(true);
    try {
      const updated = await db.updateParticipant(id, updates);
      setParticipants(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    setIsSyncing(true);
    try {
      const success = await db.deleteParticipant(id);
      if (success) {
        setParticipants(prev => prev.filter(p => p.id !== id));
      }
      return success;
    } catch (err: any) {
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    return await db.uploadAvatar(file);
  };

  // Render correct view based on Simple Path Router logic
  const renderView = () => {
    if (currentPath === '/admin' || currentPath === '/admin/') {
      return (
        <AdminPanel
          participants={participants}
          onAdd={handleAddParticipant}
          onUpdate={handleUpdateParticipant}
          onDelete={handleDeleteParticipant}
          onUploadAvatar={handleUploadAvatar}
          isSyncing={isSyncing}
          isSupabaseActive={isSupabaseConfigured}
        />
      );
    }

    if (currentPath === '/' || currentPath === '/index.html') {
      if (appView === 'welcome') {
        return (
          <WelcomeScreen
            participants={participants}
            onEnter={() => setAppView('grid')}
          />
        );
      } else {
        return (
          <ParticipantGrid
            participants={participants}
            onRefresh={() => loadData(true)}
            onBackToWelcome={() => setAppView('welcome')}
            isSyncing={isSyncing}
            isSupabaseActive={isSupabaseConfigured}
          />
        );
      }
    }

    // Anything else gets a custom stylized 404
    return <NotFound />;
  };

  // Render a beautiful, professional, smooth loading screen while initial fetch happens
  if (isLoading) {
    return (
      <div id="app-loading-screen" className="relative min-h-screen bg-gradient-to-tr from-[#F4FFF8] to-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <BackgroundPattern />
        <div className="relative z-10 space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#009B4D] opacity-25 animate-ping absolute" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-t-[#009B4D] border-r-transparent border-b-[#00A859] border-l-transparent"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase">Mắt Sài Gòn</h3>
            <p className="text-gray-400 text-xs tracking-widest font-mono">ĐANG KHỞI CHẠY THIẾT BỊ TRÌNH CHIẾU SỐ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 relative select-none">
      {/* Dynamic Animated background cross pattern */}
      <BackgroundPattern />

      {/* Database Quick bar alerts in footer (Except when fullscreen is requested implicitly) */}
      <div id="database-status-footer" className="fixed bottom-3 left-3 z-40 bg-white/95 border border-slate-100 py-1 px-3 rounded-full shadow-md text-[10px] text-gray-500 font-semibold max-sm:hidden flex items-center gap-1.5 backdrop-blur-sm">
        {isSupabaseConfigured ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-[#009B4D]" />
            <span>Kênh truyền thông ổn định • Supabase Cloud Live</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Chế độ Demo nội bộ • Thiết lập VITE_SUPABASE_URL để chạy cloud</span>
          </>
        )}
      </div>

      {serverError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-lg flex items-center gap-2">
          <span>⚠️ {serverError}</span>
        </div>
      )}

      {/* Main View Area with high-quality Framer motion transition wrapper */}
      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath + appView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
