import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, ShieldAlert, User, Search, PlusCircle, Trash2, Edit2, 
  ToggleLeft, ToggleRight, UploadCloud, RefreshCw, LogOut, CheckCircle, 
  Circle, HelpCircle, Activity, Undo 
} from 'lucide-react';
import { Participant } from '../types';
import SaigonEyeLogo from './SaigonEyeLogo';

interface AdminPanelProps {
  participants: Participant[];
  onAdd: (name: string, code: string, avatarUrl: string, is_active: boolean) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Participant>) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<string>;
  isSyncing: boolean;
  isSupabaseActive: boolean;
}

export default function AdminPanel({
  participants,
  onAdd,
  onUpdate,
  onDelete,
  onUploadAvatar,
  isSyncing,
  isSupabaseActive,
}: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Filter States
  const [adminSearch, setAdminSearch] = useState('');

  // Drag and drop avatar upload reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Retrieve password from environment variables or default to 123456
  const ADMIN_PASSWORD = (import.meta as any).env.VITE_ADMIN_PASSWORD || '123456';

  // Handles Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      // Save session inside memory/sessionStorage
      sessionStorage.setItem('msg_admin_logged_in', 'true');
    } else {
      setLoginError('Mật khẩu sai! Vui lòng kiểm tra lại cấu hình ADMIN_PASSWORD.');
    }
  };

  // Check login session storage on mount
  useEffect(() => {
    const isSessionActive = sessionStorage.getItem('msg_admin_logged_in') === 'true';
    if (isSessionActive) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('msg_admin_logged_in');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Auto generate random 3 digit unique number
  const generateRandom6DigitCode = () => {
    let attempts = 0;
    while (attempts < 50) {
      const code = Math.floor(100 + Math.random() * 900).toString();
      const codeExists = participants.some(p => p.code === code && p.id !== editingParticipant?.id);
      if (!codeExists) {
        setFormCode(code);
        return;
      }
      attempts++;
    }
    // Safe fallback if unique is super full (which is rare with 900 space)
    setFormCode(Math.floor(100 + Math.random() * 900).toString());
  };

  // Drag and drop upload functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processAvatarFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processAvatarFile(files[0]);
    }
  };

  const processAvatarFile = async (file: File) => {
    setAvatarUploadLoading(true);
    setFormError('');
    try {
      const publicUrl = await onUploadAvatar(file);
      setFormAvatarUrl(publicUrl);
    } catch (err: any) {
      setFormError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  // Handle addition or modification submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validations
    if (!formName.trim()) {
      setFormError('Không được để trống Tên người tham gia!');
      return;
    }
    
    if (formName.length < 2) {
      setFormError('Tên phải có độ rộng ít nhất 2 ký tự!');
      return;
    }

    // Auto-generate 3-digit unique code if blank
    let finalCode = formCode.trim();
    if (!finalCode) {
      let attempts = 0;
      while (attempts < 50) {
        const temp = Math.floor(100 + Math.random() * 900).toString();
        const codeExists = participants.some(p => p.code === temp && p.id !== editingParticipant?.id);
        if (!codeExists) {
          finalCode = temp;
          break;
        }
        attempts++;
      }
      if (!finalCode) {
        finalCode = Math.floor(100 + Math.random() * 900).toString();
      }
    }

    // Validate 3 digit code pattern exactly
    if (!/^\d{3}$/.test(finalCode)) {
      setFormError('Mã số dự thưởng bắt buộc phải là 3 chữ số liên tiếp! (Ví dụ: 193)');
      return;
    }

    // Checking unique codes
    const isCodeDuplicated = participants.some(p => p.code === finalCode && p.id !== editingParticipant?.id);
    if (isCodeDuplicated) {
      setFormError('Lỗi: Mã số 3 số này đã thuộc về một người tham gia khác! Mã bắt buộc không trùng nhau.');
      return;
    }

    try {
      if (editingParticipant) {
        // Confirm editing
        const isConfirmed = window.confirm(`Bạn có chắc chắn muốn lưu những thay đổi này cho "${editingParticipant.name}"?`);
        if (!isConfirmed) return;

        // Edit mode
        await onUpdate(editingParticipant.id, {
          name: formName.trim(),
          code: finalCode,
          avatar_url: formAvatarUrl,
          is_active: formIsActive
        });
        setFormSuccess('Cập nhật người tham gia thành công!');
      } else {
        // Add mode
        await onAdd(formName.trim(), finalCode, formAvatarUrl, formIsActive);
        setFormSuccess('Thêm người tham gia mới thành công!');
      }

      // Close Form and clean up
      setTimeout(() => {
        setIsFormOpen(false);
        setEditingParticipant(null);
        resetForm();
      }, 1200);

    } catch (err: any) {
      setFormError(err.message || 'Không thể ghi nhận thông tin. Hãy thử lại.');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormAvatarUrl('');
    setFormIsActive(true);
    setFormError('');
    setFormSuccess('');
    setEditingParticipant(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (p: Participant) => {
    setEditingParticipant(p);
    setFormName(p.name);
    setFormCode(p.code);
    setFormAvatarUrl(p.avatar_url);
    setFormIsActive(p.is_active);
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa "${name}" ra khỏi hệ thống vĩnh viễn?`);
    if (isConfirmed) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Lỗi không thể xóa!');
      }
    }
  };

  const handleToggleActive = async (p: Participant) => {
    const actionWord = p.is_active ? 'ẨN (tắt hiển thị)' : 'HIỂN THỊ (bật)';
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái của "${p.name}" thành ${actionWord} ngoài trang chủ?`);
    if (!isConfirmed) return;

    try {
      await onUpdate(p.id, { is_active: !p.is_active });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái hiển thị!');
    }
  };

  // Search filter
  const filteredParticipants = participants.filter(
    p => 
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
      p.code.includes(adminSearch)
  );

  // Authentication Box (If not logged in yet)
  if (!isAuthenticated) {
    return (
      <div id="admin-login-wrapper" className="min-h-[80vh] flex items-center justify-center relative px-4 z-10 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-emerald-100 max-w-md w-full relative"
        >
          {/* Logo brand motif inside login */}
          <div className="flex justify-center mb-6">
            <SaigonEyeLogo variant="vertical" iconSize={60} />
          </div>

          <h1 className="text-xl font-extrabold text-slate-800 text-center mb-1 uppercase tracking-tight">
            Quản trị viên
          </h1>
          <p className="text-gray-500 text-xs text-center mb-6">
            Hệ thống quản lý thông tin các người tham gia trình chiếu. Bạn cần nhập mật khẩu quản lý để tiếp tục.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-password-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu Admin
              </label>
              <input
                id="admin-password-field"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 outline-none focus:border-[#009B4D] focus:ring-1 focus:ring-emerald-100 rounded-xl bg-slate-50 transition-all font-mono"
                required
              />
            </div>

            {loginError && (
              <div id="login-error-msg" className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
                {loginError}
              </div>
            )}

            <button
              id="submit-login-btn"
              type="submit"
              className="w-full bg-[#009B4D] hover:bg-[#006B3F] text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              ĐĂNG NHẬP HỆ THỐNG
            </button>
          </form>

          {/* Quick Notice to developer */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
            <span className="block text-[11px] text-gray-500 leading-normal">
              Mật khẩu mặc định được định cấu hình bằng biến môi trường <strong>ADMIN_PASSWORD</strong> (hoặc là <strong>123456</strong> nếu chưa cài đặt)
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard View (Logged in Admin)
  return (
    <div id="admin-dashboard-container" className="relative z-10 w-full px-4 max-w-7xl mx-auto py-8">
      
      {/* Admin Dashboard header */}
      <div id="admin-header-nav" className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-md border border-emerald-50">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <SaigonEyeLogo variant="full" iconSize={34} className="scale-95 origin-left" />
          <div className="h-8 w-px bg-gray-200 max-md:hidden" />
          <div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-[#009B4D] uppercase font-mono">
              HỆ THỐNG QUẢN TRỊ VIÊN
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-normal">
              QUẢN LÝ NGƯỜI THAM GIA
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Status badge for Supabase connection */}
          {isSupabaseActive ? (
            <span id="supabase-online-status" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-bold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              Supabase Connected
            </span>
          ) : (
            <span id="supabase-offline-status" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs font-bold">
              Offline Demo Mode
            </span>
          )}

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="p-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 rounded-xl transition-all cursor-pointer bg-white"
            title="Đăng xuất"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Database Setup Helper panel */}
      {!isSupabaseActive && (
        <div id="setup-instruction-panel" className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 mb-8 text-neutral-800 text-sm">
          <h3 className="font-extrabold text-[#006B3F] text-base mb-2 flex items-center gap-1">
            💡 Hướng dẫn cấu hình kết nối database Supabase thực tế:
          </h3>
          <p className="mb-3 text-slate-600">
            Ứng dụng hiện đang lưu trữ tạm thời tại <strong>LocalStorage</strong> của trình duyệt này để bạn trải nghiệm ngay. Để dữ liệu lưu trữ vĩnh viễn và đồng bộ đa màn hình trên Vercel, vui lòng thiết lập các Biến môi trường (Environment Variables) sau trên Vercel:
          </p>
          <ul className="list-disc pl-5 space-y-1 bg-white p-4 rounded-xl text-xs font-mono text-slate-700 border border-emerald-100 mb-2">
            <li><strong>VITE_SUPABASE_URL</strong>: Địa chỉ URL dự án Supabase</li>
            <li><strong>VITE_SUPABASE_ANON_KEY</strong>: API Anonymous Key của Supabase</li>
            <li><strong>VITE_ADMIN_PASSWORD</strong>: Mật khẩu trang quản trị Admin mong muốn (VD: saigoneye2026)</li>
          </ul>
          <span className="text-xs text-emerald-800 font-semibold block">⚠️ Đừng quên tạo <strong>Table: participants</strong> và <strong>Storage Bucket: avatars</strong> công khai (Public) trên Supabase theo SQL đính kèm ở chân trang!</span>
        </div>
      )}

      {/* Main Panel Search and Insert controls */}
      <div id="admin-action-row" className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="admin-search-input"
            type="text"
            placeholder="Tìm theo tên hoặc mã dự thưởng 3 số..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 outline-none focus:border-[#009B4D] focus:ring-1 focus:ring-emerald-50 rounded-xl text-slate-800 transition-all font-medium text-sm"
          />
        </div>

        <button
          id="btn-trigger-add-form"
          onClick={openAddForm}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#009B4D] hover:bg-[#006B3F] text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all cursor-pointer text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          THÊM NGƯỜI MỚI
        </button>
      </div>

      {/* Form overlay for Adding / Editing Participant */}
      <AnimatePresence>
        {isFormOpen && (
          <div id="form-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Form title */}
              <div className="bg-gradient-to-r from-[#006B3F] to-[#009B4D] text-white p-6 rounded-t-3xl flex justify-between items-center">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {editingParticipant ? 'CẬP NHẬT THÔNG TIN' : 'THÊM NGƯỜI THAM GIA MỚI'}
                </h2>
                <button
                  id="close-form-btn"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold"
                >
                  X
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                
                {/* Name */}
                <div>
                  <label htmlFor="form-name-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Họ và tên người tham gia *
                  </label>
                  <input
                    id="form-name-field"
                    type="text"
                    required
                    placeholder="VD: Bác sĩ Lê Minh Tâm, Nguyễn Văn A..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 outline-none focus:border-[#009B4D] rounded-xl text-slate-800 transition-all font-medium text-sm"
                  />
                </div>

                {/* 3 Digit code & Code builder */}
                <div>
                  <label htmlFor="form-code-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Mã số dự thưởng (3 số không trùng) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="form-code-field"
                      type="text"
                      required
                      maxLength={3}
                      placeholder="VD: 194"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="flex-grow px-4 py-2.5 border border-slate-200 outline-none focus:border-[#009B4D] rounded-xl text-slate-800 font-mono text-center tracking-widest text-lg font-bold"
                    />
                    <button
                      id="btn-random-code-generate"
                      type="button"
                      onClick={generateRandom6DigitCode}
                      className="px-4 py-2 bg-slate-100 hover:bg-[#F4FFF8] text-[#009B4D] border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all whitespace-nowrap"
                    >
                      Tạo mã ngẫu nhiên
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Bao gồm đúng 3 chữ số viết liền nhau. Ví dụ: 123
                  </span>
                </div>

                {/* Avatar upload (Drag & drop support) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Hình đại diện (Avatar)
                  </label>
                  
                  {/* File Selector visual drag box */}
                  <div
                    id="avatar-dropzone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                      isDragging 
                        ? 'border-[#00A859] bg-[#E9FAF0]' 
                        : 'border-slate-200 hover:border-[#009B4D] bg-slate-50/50 hover:bg-[#F4FFF8]'
                    }`}
                  >
                    <input
                      id="hidden-file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />

                    {avatarUploadLoading ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 text-[#009B4D] animate-spin mb-2" />
                        <span className="text-xs font-bold text-[#006B3F]">Đang xử lý & tải ảnh lên...</span>
                      </div>
                    ) : formAvatarUrl ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={formAvatarUrl}
                          alt="Avatar upload preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 mb-2 bg-[#F4FFF8]"
                        />
                        <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Đã liên kết ảnh thành công!
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 block">Click để thay đổi</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 text-[#009B4D] mb-1.5 opacity-80" />
                        <span className="text-xs font-bold text-slate-800">Tải ảnh đại diện lên</span>
                        <span className="text-[10px] text-gray-400 mt-1">Kéo thả ảnh hoặc click để chọn</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">Chỉ JPG, PNG, WEBP dưới 2.5MB</span>
                      </div>
                    )}
                  </div>

                  {/* Preset Quick Loader Options if user has no file ready */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Không có ảnh? Chọn nhanh Bác Sĩ/Bệnh Nhân mẫu:</span>
                    {[
                      { name: 'Nữ Bác sĩ', url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200' },
                      { name: 'Nam Bác sĩ', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' },
                      { name: 'Bệnh nhân Nữ', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
                      { name: 'Bệnh nhân Nam', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setFormAvatarUrl(preset.url)}
                        className="text-[10px] px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-[#009B4D] rounded-full transition-all font-semibold cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Bật hiển thị (Is Active)</span>
                    <span className="block text-[11px] text-gray-500">Nếu bật, hồ sơ này sẽ lập tức xuất hiện trên lưới trình chiếu chính.</span>
                  </div>
                  <button
                    id="toggle-is-active-btn"
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className="text-[#009B4D] text-lg focus:outline-none transition-all cursor-pointer"
                  >
                    {formIsActive ? (
                      <ToggleRight className="w-12 h-12 text-[#009B4D]" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Form Message Prompts */}
                {formError && (
                  <div id="form-error-banner" className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div id="form-success-banner" className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                {/* Form Action Controls */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="btn-form-cancel"
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingParticipant(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    id="btn-form-submit"
                    type="submit"
                    disabled={avatarUploadLoading}
                    className="flex-1 py-3 bg-[#009B4D] hover:bg-[#006B3F] disabled:opacity-50 text-white rounded-xl font-bold transition-all text-sm cursor-pointer"
                  >
                    LUU THÔNG TIN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Database list representation table */}
      <div id="admin-table-wrapper" className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Table header meta info */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Danh sách tất cả người tham gia ({filteredParticipants.length})
          </span>
          <span className="text-xs text-gray-400">Có thể click cột hiển thị để bật/tắt nhanh</span>
        </div>

        {participants.length === 0 ? (
          <div className="p-16 text-center">
            <span className="text-gray-500 font-medium block text-base mb-2">Chưa có người tham gia</span>
            <span className="text-xs text-gray-400 block max-w-sm mx-auto leading-relaxed">
              Hãy bấm vào nút "Thêm người mới" góc trên bên phải để bắt đầu thiết lập thông tin người tham gia đầu tiên của dự án.
            </span>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="p-16 text-center">
            <span className="text-gray-400 block mb-2">Chưa có người tham gia nào khớp với kết quả tìm kiếm.</span>
            <button
              id="clear-search-btn"
              onClick={() => setAdminSearch('')}
              className="text-xs font-bold text-[#009B4D] hover:underline cursor-pointer"
            >
              Hủy tìm kiếm
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="participants-data-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Avatar</th>
                  <th className="py-4 px-6">Họ và tên</th>
                  <th className="py-4 px-6 text-center">Mã số dự thưởng</th>
                  <th className="py-4 px-6 text-center">Trạng thái hiển thị</th>
                  <th className="py-4 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => (
                  <tr
                    id={`table-row-${p.code}`}
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-[#F4FFF8]/40 transition-colors text-sm"
                  >
                    {/* Picture column */}
                    <td className="py-4 px-6">
                      <img
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm bg-slate-50"
                        onError={(e) => {
                          (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=009B4D&color=fff&size=100`;
                        }}
                      />
                    </td>

                    {/* Name column */}
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {p.name}
                    </td>

                    {/* Unique digital registered code presentation */}
                    <td className="py-4 px-6 text-center font-mono font-bold text-[#009B4D] text-base tracking-wider">
                      {p.code}
                    </td>

                    {/* Quick active/inactive status toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        id={`btn-toggle-row-${p.code}`}
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          p.is_active
                            ? 'bg-[#E9FAF0] text-[#009B4D] border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.is_active ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Đang Bật</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Đang Tắt</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit, Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-edit-row-${p.code}`}
                          onClick={() => openEditForm(p)}
                          className="p-1 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          id={`btn-delete-row-${p.code}`}
                          onClick={() => handleDeleteClick(p.id, p.name)}
                          className="p-1 px-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SQL Script View tool for easy Supabase Deployment */}
      <div id="sql-reference-panel" className="mt-12 bg-slate-900 text-slate-350 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-mono text-xs">
        <h3 className="text-white font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#00A859]" />
          SQL Script để cấu hình nhanh bảng participants trên Supabase:
        </h3>
        <p className="text-gray-400 mb-4 font-sans text-sm">
          Copy đoạn mã dưới đây và chạy trực tiếp tại mục <strong>SQL Editor</strong> trên bảng điều khiển dự án Supabase của bạn để tạo bảng và trigger cập nhật thời gian:
        </p>
        <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-[#00FF66] overflow-x-auto leading-relaxed select-all">
{`-- 1. Tạo bảng lưu trữ người tham gia (participants)
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tạo hàm tự động cập nhật thời gian thay đổi updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Tạo trigger kích hoạt khi có lệnh UPDATE
drop trigger if exists update_participants_updated_at on participants;

create trigger update_participants_updated_at
before update on participants
for each row
execute function update_updated_at_column();`}
        </pre>
        <span className="block text-gray-500 font-sans text-[11px] mt-4">
          * Đừng quên tạo thêm một <strong>Storage Bucket</strong> tên là <strong>avatars</strong> ở tab Storage của Supabase của bạn và cấu hình quyền truy cập công khai (Public) để upload ảnh nhé.
        </span>
      </div>
    </div>
  );
}
