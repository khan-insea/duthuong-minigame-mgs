import { createClient } from '@supabase/supabase-js';
import { Participant } from './types';

// Read env variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are validly provided
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial high-quality medical and patient demo data for Bệnh viện Mắt Sài Gòn motif
const DEFAULT_DEMO_PARTICIPANTS: Participant[] = [
  {
    id: 'demo-1',
    name: 'BS. Nguyễn Minh Anh (Khoa Giác Mạc)',
    code: '102',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'demo-2',
    name: 'Đoàn Thị Thu Thảo (Khúc xạ viên)',
    code: '859',
    avatar_url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: 'demo-3',
    name: 'Trần Hoàng Nam (Bệnh nhân FemtoLASIK)',
    code: '334',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'demo-4',
    name: 'Phạm Minh Đức (Phẫu thuật Phaco)',
    code: '674',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'demo-5',
    name: 'ThS. BS Lê Hoàng Nam (Chuyên gia cận thị)',
    code: '459',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-6',
    name: 'Lê Thu Trang (Khách hàng ReLEx SMILE)',
    code: '294',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// LocalStorage Persistence utility
const getLocalParticipants = (): Participant[] => {
  const localData = localStorage.getItem('msg_participants');
  if (!localData) {
    localStorage.setItem('msg_participants', JSON.stringify(DEFAULT_DEMO_PARTICIPANTS));
    return DEFAULT_DEMO_PARTICIPANTS;
  }
  try {
    return JSON.parse(localData);
  } catch (e) {
    return DEFAULT_DEMO_PARTICIPANTS;
  }
};

const saveLocalParticipants = (participants: Participant[]) => {
  localStorage.setItem('msg_participants', JSON.stringify(participants));
};

// Abstracted APIs for the application to interact with either Supabase or LocalStorage fallback
export const db = {
  async fetchParticipants(): Promise<Participant[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Lỗi khi lấy dữ liệu từ Supabase, chuyển sang chế độ dự phòng:', error);
        return getLocalParticipants();
      }
      return data || [];
    }
    return getLocalParticipants();
  },

  async insertParticipant(participant: Omit<Participant, 'id' | 'created_at'>): Promise<Participant> {
    const newParticipant: Participant = {
      ...participant,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('participants')
        .insert([
          {
            name: participant.name,
            code: participant.code,
            avatar_url: participant.avatar_url,
            is_active: participant.is_active
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Lỗi thêm dữ liệu Supabase, lưu tạm vào offline storage:', error);
        // Fallback save locally
        const list = getLocalParticipants();
        list.unshift(newParticipant);
        saveLocalParticipants(list);
        return newParticipant;
      }
      return data;
    } else {
      const list = getLocalParticipants();
      
      // Check code unique
      if (list.some(p => p.code === participant.code)) {
        throw new Error('Mã số dự thưởng này đã tồn tại trong hệ thống!');
      }

      list.unshift(newParticipant);
      saveLocalParticipants(list);
      return newParticipant;
    }
  },

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant> {
    if (supabase) {
      const { data, error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Lỗi cập nhật dữ liệu Supabase, cập nhật cục bộ:', error);
        const list = getLocalParticipants();
        const index = list.findIndex(p => p.id === id);
        if (index !== -1) {
          list[index] = { ...list[index], ...updates };
          saveLocalParticipants(list);
          return list[index];
        }
        throw new Error('Không tìm thấy người tham gia');
      }
      return data;
    } else {
      const list = getLocalParticipants();
      const index = list.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Không tìm thấy người tham gia');
      }

      // Check unique code if code is changed
      if (updates.code && updates.code !== list[index].code) {
        if (list.some(p => p.code === updates.code && p.id !== id)) {
          throw new Error('Mã số dự thưởng này đã tồn tại trong hệ thống!');
        }
      }

      list[index] = { ...list[index], ...updates };
      saveLocalParticipants(list);
      return list[index];
    }
  },

  async deleteParticipant(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Lỗi xóa dữ liệu Supabase, xóa cục bộ:', error);
        const list = getLocalParticipants();
        const filtered = list.filter(p => p.id !== id);
        saveLocalParticipants(filtered);
        return true;
      }
      return true;
    } else {
      const list = getLocalParticipants();
      const filtered = list.filter(p => p.id !== id);
      saveLocalParticipants(filtered);
      return true;
    }
  },

  /**
   * Helper to upload avatar file.
   * If Supabase is active, uploads to the 'avatars' storage bucket.
   * If Offline, converts to Base64 data URL.
   */
  async uploadAvatar(file: File): Promise<string> {
    // Validate type (jpg, jpeg, png, webp)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận các tệp hình ảnh định dạng JPG, JPEG, PNG, WEBP!');
    }

    // Limit size to 2.5MB
    const maxSize = 2.5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Tệp tải lên quá lớn! Giới hạn tối đa là 2.5MB.');
    }

    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `avatar_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Lỗi khi tải ảnh lên Supabase Storage:', uploadError);
        // Fallback convert to Base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
          reader.readAsDataURL(file);
        });
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } else {
      // Local Base64 FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Không thể đọc tệp ảnh'));
        };
        reader.readAsDataURL(file);
      });
    }
  }
};
