import { motion } from 'motion/react';
import { EyeOff, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div id="not-found-wrapper" className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 z-10 relative py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
        className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-emerald-100 max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-5 rounded-full text-red-500 shadow-inner flex items-center justify-center">
            <EyeOff className="w-12 h-12 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-[#006B3F] font-mono leading-none mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-3">
          Không tìm thấy liên kết này!
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Đường dẫn không tồn tại trên hệ thống trình chiếu Mắt Sài Gòn. Vui lòng bấm bên dưới để về trang chủ hoặc trang quản lý của Admin.
        </p>

        <div className="space-y-2">
          <a
            href="/"
            className="w-full bg-[#009B4D] hover:bg-[#006B3F] text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Về Trang Chủ Trình Chiếu
          </a>
          
          <a
            href="/admin"
            className="w-full text-[#009B4D] hover:bg-[#F4FFF8] border border-emerald-100 py-2.5 rounded-xl font-bold transition-all cursor-pointer inline-block text-xs"
          >
            Vào Trang Quản Trị Admin
          </a>
        </div>
      </motion.div>
    </div>
  );
}
