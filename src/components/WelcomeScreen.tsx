import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, Users, ChevronRight } from 'lucide-react';
import { Participant } from '../types';
import SaigonEyeLogo from './SaigonEyeLogo';

interface WelcomeScreenProps {
  onEnter: () => void;
  participants: Participant[];
}

export default function WelcomeScreen({ onEnter, participants }: WelcomeScreenProps) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [synthInterval, setSynthInterval] = useState<any>(null);
  const activeCount = participants.filter(p => p.is_active).length;

  // Synthesize soft, rhythmic electronic lobby melody (Kahoot-inspired upbeat vibe)
  const startLobbyMusic = () => {
    try {
      const Context = window.AudioContext || (window as any).webkitAudioContext;
      if (!Context) return;
      const ctx = new Context();
      setAudioCtx(ctx);

      // Loop sequence
      const notes = [
        329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 440.00, 392.00,
        329.63, 392.00, 523.25, 587.33, 493.88, 392.00, 440.00, 523.25
      ];
      let step = 0;

      const playStep = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const now = ctx.currentTime;
        
        // Lead Voice
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Triangel wave makes a bright, sweet game-lobby vibe
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        
        // ADSR envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        // Low pass filter to make it warmer
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        osc.connect(gain);
        gain.connect(filter);
        filter.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);

        // Simple bass/beat synth companion
        if (step % 2 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(step % 4 === 0 ? 110 : 98, now);
          
          bassGain.gain.setValueAtTime(0, now);
          bassGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.2);
        }

        step++;
      };

      // Play immediate first note
      playStep();
      const interval = setInterval(playStep, 240); // BPM friendly pace
      setSynthInterval(interval);
      setIsPlayingMusic(true);
    } catch (e) {
      console.warn('Audio synthesis warning: User needs interaction or permissions.', e);
    }
  };

  const stopLobbyMusic = () => {
    if (synthInterval) {
      clearInterval(synthInterval);
      setSynthInterval(null);
    }
    if (audioCtx) {
      if (audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch (e) {
          console.warn('AudioContext close error:', e);
        }
      }
      setAudioCtx(null);
    }
    setIsPlayingMusic(false);
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      stopLobbyMusic();
    } else {
      startLobbyMusic();
    }
  };

  // Safe cleanup
  useEffect(() => {
    return () => {
      if (synthInterval) clearInterval(synthInterval);
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch (e) {
          // already closed or invalid state
        }
      }
    };
  }, [synthInterval, audioCtx]);

  return (
    <div id="welcome-wrapper" className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-4 z-10 py-12">
      {/* Sound Toggle Floating Widget - Top Right */}
      <motion.button
        id="toggle-music-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMusic}
        className="absolute top-4 right-4 bg-white/95 text-[#009B4D] border border-emerald-100 hover:bg-[#E9FAF0] p-3 rounded-full shadow-lg transition-colors flex items-center gap-2 cursor-pointer z-50 text-sm font-medium"
      >
        {isPlayingMusic ? (
          <>
            <Volume2 className="w-5 h-5 animate-pulse text-[#00A859]" />
            <span className="max-md:hidden">Đang phát nhạc nền</span>
          </>
        ) : (
          <>
            <VolumeX className="w-5 h-5 text-gray-400" />
            <span className="max-md:hidden text-gray-500">Bật nhạc Kahoot</span>
          </>
        )}
      </motion.button>

      {/* Main Logo & Presentation Intro Card */}
      <motion.div
        id="welcome-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-emerald-100 max-w-2xl w-full relative overflow-hidden"
      >
        {/* Decorative corner accents matching Saigon Eye brand */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#009B4D]" />
        <div className="absolute top-0 right-0 w-2 h-full bg-[#00A859]" />

        {/* Saigon Eye Hospital Creative Logo */}
        <div className="flex justify-center mb-10 mt-2">
          <motion.div
            id="brand-logo-container"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <SaigonEyeLogo variant="full" iconSize={72} />
          </motion.div>
        </div>

        {/* Institution Brand */}
        <div id="welcome-header" className="space-y-4 mb-8">
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight font-extrabold max-sm:text-xl uppercase max-w-xl mx-auto leading-tight">
            DANH SÁCH THAM GIA CHƯƠNG TRÌNH QUAY SỐ MAY MẮN
          </h1>
          <p className="text-gray-600 text-xs md:text-sm max-w-xl mx-auto leading-relaxed px-2 font-medium">
            Kết quả sẽ được công bố trong chương trình Livestream <span className="text-[#009B4D] font-extrabold">GIẢI CỨU "ĐÔI MẮT VĂN PHÒNG" TRONG THỜI KỶ NGUYÊN SỐ</span> được phát trực tiếp trên <span className="font-bold text-slate-800">Fanpage Bệnh viện Mắt Sài Gòn Kiên Giang</span> vào lúc <span className="text-[#009B4D] font-bold">10:00, ngày 24/6/2026</span>
          </p>
        </div>

        {/* Dynamic Join counter dashboard */}
        <div id="welcome-stats" className="bg-[#F4FFF8] border border-emerald-50 rounded-2xl p-5 mb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-[#009B4D] font-mono">{participants.length}</div>
            <div className="text-xs text-emerald-800 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5 justify-center">
              <Users className="w-4 h-4" />
              SỐ NGƯỜI THAM GIA DỰ THƯỞNG
            </div>
          </div>
        </div>

        {/* Large Enter Button */}
        <div className="space-y-4">
          <motion.button
            id="start-presentation-btn"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 155, 77, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              stopLobbyMusic();
              onEnter();
            }}
            className="w-full bg-[#009B4D] text-white hover:bg-[#00A859] py-4 px-8 rounded-2xl font-bold text-lg shadow-xl cursor-pointer transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            KIỂM TRA DANH SÁCH
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
          
          <div className="text-xs text-gray-400">
            Không cần nhập mã số • Không cần đăng nhập • Click để xem danh sách trực tiếp
          </div>
        </div>
      </motion.div>

      {/* Fun footer elements styled like Kahoot Lobby bottom status */}
      <div id="welcome-footer" className="mt-12 text-[#006B3F] flex items-center gap-3 text-sm font-semibold opacity-85 bg-white/70 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-sm border border-emerald-50">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        Hệ thống tự động đồng bộ thời gian thực với Supabase Cloud
      </div>
    </div>
  );
}
