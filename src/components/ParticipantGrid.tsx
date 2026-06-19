import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, RefreshCw, ArrowLeft, Search, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { Participant } from '../types';
import SaigonEyeLogo from './SaigonEyeLogo';

interface ParticipantGridProps {
  participants: Participant[];
  onRefresh: () => Promise<void>;
  onBackToWelcome: () => void;
  isSyncing: boolean;
  isSupabaseActive: boolean;
}

export default function ParticipantGrid({
  participants,
  onRefresh,
  onBackToWelcome,
  isSyncing,
  isSupabaseActive,
}: ParticipantGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // Default to 5 seconds
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);

  // Filter only active users which the user requested: "Người tham gia đang active"
  const activeParticipants = participants.filter((p) => p.is_active);

  // Apply query filter if specified
  const filteredParticipants = activeParticipants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.includes(searchQuery)
  );

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Lỗi kích hoạt toàn màn hình: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Monitor screen state change natively to prevent desync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Polling logic
  useEffect(() => {
    if (!autoRefreshActive || refreshInterval <= 0) return;

    const timer = setInterval(() => {
      onRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshActive, refreshInterval, onRefresh]);

  return (
    <div id="grid-container" className="relative z-10 w-full px-4 max-w-7xl mx-auto py-8">
      {/* Upper Navigation Bar & Tools */}
      <div id="grid-header-nav" className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md border border-emerald-50">
        
        {/* Navigation back and branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="btn-back-home"
            onClick={onBackToWelcome}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-[#009B4D] hover:bg-[#F4FFF8] rounded-xl transition-all font-semibold cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Về màn hình chính
          </button>
          
          <div className="h-6 w-px bg-gray-200 hidden md:block" />
          
          <div className="flex items-center">
            <SaigonEyeLogo variant="full" iconSize={28} className="scale-90 origin-left" />
          </div>
        </div>

        {/* Database Mode Status Chip */}
        {!isSupabaseActive && (
          <div id="database-mode-warning" className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Chế độ Demo Offline (Dữ liệu lưu tại máy này)</span>
          </div>
        )}

        {/* Quick controls - Refresh, Fullscreen, Polling Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Polling controller */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-700">
            <label htmlFor="refresh-select" className="text-gray-500 whitespace-nowrap">Tự động làm mới:</label>
            <select
              id="refresh-select"
              value={refreshInterval}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRefreshInterval(val);
                setAutoRefreshActive(val > 0);
              }}
              className="bg-transparent font-bold text-[#009B4D] outline-none cursor-pointer"
            >
              <option value="3">Mỗi 3 giây</option>
              <option value="5">Mỗi 5 giây</option>
              <option value="10">Mỗi 10 giây</option>
              <option value="0">Tắt tự động</option>
            </select>
          </div>

          {/* Manual Refresh Trigger */}
          <button
            id="manual-refresh-btn"
            onClick={() => onRefresh()}
            disabled={isSyncing}
            className="p-2 text-slate-700 hover:text-white hover:bg-[#009B4D] disabled:opacity-50 border border-slate-200 hover:border-[#009B4D] rounded-xl transition-all cursor-pointer bg-white flex items-center justify-center"
            title="Làm mới dữ liệu ngay"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00A859]' : ''}`} />
          </button>

          {/* Fullscreen trigger */}
          <button
            id="fullscreen-mode-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#009B4D] text-white hover:bg-[#006B3F] rounded-xl font-bold shadow-sm hover:shadow transition-all cursor-pointer text-sm"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Thu Nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Trình Chiếu TV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presentation Header Details containing title and statistics */}
      <div id="presentation-banner" className="text-center mb-8 bg-gradient-to-r from-[#006B3F] to-[#009B4D] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Aesthetic design background circle */}
        <div className="absolute right-[-10%] top-[-30%] w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute left-[-5%] bottom-[-20%] w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight mb-2 uppercase">
            DANH SÁCH NGƯỜI THAM GIA DỰ THƯỞNG
          </h1>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4 text-xs font-bold text-white/90">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-green-300 rounded-full animate-bounce" />
              Tổng số người tham gia dự thưởng: {activeParticipants.length} người
            </span>
            <span>•</span>
            <span>Tự cập nhật liên tục từ mây</span>
          </div>
        </div>
      </div>

      {/* Grid Filter Search Input */}
      <div className="mb-6 relative max-w-md mx-auto">
        <Search className="w-5 h-5 text-[#009B4D] absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
        <input
          id="grid-search-input"
          type="text"
          placeholder="Tìm kiếm người tham gia theo tên hoặc mã 3 số..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 outline-none focus:border-[#009B4D] focus:ring-2 focus:ring-emerald-100 rounded-2xl shadow-sm text-slate-800 transition-all font-medium text-sm text-center"
        />
      </div>

      {/* Active Participants Mesh/Grid Area */}
      {filteredParticipants.length === 0 ? (
        <motion.div
          id="grid-empty-state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-16 text-center border border-slate-100 shadow-xl max-w-xl mx-auto"
        >
          <div className="w-20 h-20 bg-[#F4FFF8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#009B4D]">
            <Activity className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Không tìm thấy ai hiển thị
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {activeParticipants.length === 0
              ? 'Hiện tại không có thành viên nào được đặt trạng thái "Bật hiển thị" ở trang quản lý Admin.'
              : 'Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại mã số.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          id="participants-mesh-layout"
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredParticipants.map((p) => (
              <motion.div
                id={`participant-card-${p.code}`}
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(0, 107, 63, 0.12), 0 10px 10px -5px rgba(0, 107, 63, 0.04)',
                }}
                className="bg-white rounded-3xl border-2 border-emerald-100 overflow-hidden relative shadow-md flex flex-col justify-between"
              >
                {/* Colored top header block of card */}
                <div className="h-2 bg-[#009B4D]" />

                {/* Main Card Information Area */}
                <div className="p-6 text-center flex flex-col items-center flex-grow">
                  
                  {/* Photo area with absolute unique color background ring */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-[#00A859] opacity-30 animate-ping" />
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10 bg-emerald-50"
                      onError={(e) => {
                        // Fallback to random colored placeholder
                        (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=009B4D&color=fff&size=150`;
                      }}
                    />
                  </div>

                  {/* Name of the participant */}
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center px-2">
                    {p.name}
                  </h3>
                </div>

                {/* Large visual 6-Digit code styled like Kahoot answers */}
                <div className="bg-[#F4FFF8] border-t border-emerald-50 px-4 py-3 text-center rounded-b-3xl">
                  <div className="text-xs text-emerald-800 font-extrabold font-mono tracking-widest uppercase mb-1 opacity-70">
                    MÃ SỐ DỰ THƯỞNG
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-[#009B4D] font-mono tracking-widest bg-white border border-emerald-100 rounded-2xl py-1.5 shadow-inner">
                    {p.code}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
