# Mắt Sài Gòn - Participant Presentation System (Hệ thống Trình chiếu Người tham gia)

Ứng dụng web trình chiếu người tham gia/Bác sĩ/Bệnh nhân trực quan sinh động trên màn hình TV, máy chiếu lớn. Giao diện được thiết kế lấy cảm hứng từ phòng chờ **Kahoot!** sôi động nhưng sử dụng màu sắc thương hiệu đặc trưng của **Bệnh Viện Mắt Sài Gòn** (Medical Green).

---

## 🚀 Tính năng nổi bật (Key Features)

### 👥 Trải nghiệm Người dùng (Client Page `/`)
- **Màn hình chào mừng phong cách Kahoot!**: Sôi động, bắt mắt, tích hợp **Nhạc nền Synthesizer điện tử** tự tổng hợp bằng Web Audio API siêu mượt mà (có nút tắt/mở linh hoạt).
- **Trình chiếu dạng lưới (Grid Mesh)**: Hiển thị tối ưu dạng thẻ trên màn hình lớn (TV/Projector), avatar hình tròn tinh tế cùng mã đăng ký 6 số nổi bật, rõ nét.
- **Tính năng TV Fullscreen**: Phù hợp trình chiếu chuyên nghiệp, tự động co giãn tối ưu kích thước màn hình.
- **Tự động làm mới dữ liệu (Auto Polling)**: Đồng bộ thay đổi hiển thị ngay lập tức từ tầng cơ sở dữ liệu sau mỗi vài giây (có thể chỉnh thời gian 3s, 5s, 10s hoặc tắt).
- **Tìm kiếm tức thì**: Lọc danh sách theo Tên hoặc Mã số 6 số tiện dụng.

### 🛡️ Trang quản lý admin (Admin Control Panel `/admin`)
- **Bảo mật**: Đăng nhập bằng mật khẩu lấy trực tiếp từ biến môi trường `ADMIN_PASSWORD`.
- **Thêm/Sửa/Xóa người tham gia**: Quản lý đầy đủ các trường thông tin (Họ và tên, Mã số, Avatar, Trạng thái hoạt động).
- **Trình tải ảnh Kéo & Thả (Drag & Drop Avatar Upload)**: Tải file ảnh trực quan dưới 2.5MB, tự động đồng bộ lên Supabase Storage hoặc chuyển đổi chuỗi dự phòng. Có sẵn các nhãn Bác sĩ/Bệnh nhân mẫu để chọn nhanh khi chạy demo offline.
- **Tạo mã số ngẫu nhiên 6 số**: Nút nhấn hỗ trợ sinh mã 6 số tự động đảm bảo không trùng lặp mã với bất kỳ người nào đã đăng ký.

---

## 🛠️ Hướng dẫn cài đặt và chạy dưới Local (Local Development)

### Bước 1: Cài đặt Dependencies
Mở terminal và chạy lệnh:
```bash
npm install
```

### Bước 2: Thiết lập môi trường (Environment Variables)
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mở tệp `.env` vừa tạo và chỉnh sửa các giá trị:
```env
# Kết nối Supabase (Bỏ trống hoặc giữ nguyên để tự động chạy chế độ Offline Demo dự phòng mượt mà)
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Mật khẩu quản trị Admin trên trang /admin (Mặc định nếu chưa điền là 123456)
VITE_ADMIN_PASSWORD="123456"
```

### Bước 3: Chạy ứng dụng chế độ DEV
Bật máy chủ phát triển cục bộ:
```bash
npm run dev
```
Mở trình duyệt truy cập:
- Trang chủ trình chiếu: `http://localhost:3000` (hoặc cổng được Vite cung cấp)
- Trang quản trị admin: `http://localhost:3000/admin`

### Bước 4: Đóng gói sản phẩm (Build cho Production)
```bash
npm run build
```

### Bước 5: Chạy thử bản Preview sau đóng gói
```bash
npm run preview
```

---

## 🗄️ Cấu hình cơ sở dữ liệu Supabase

Để các thiết bị trình chiếu có thể lưu trữ thông tin thực và đồng bộ hai chiều trực tiếp, bạn hãy thực hiện 2 cấu hình sau trên bảng điều khiển Supabase của mình:

### 1. Tạo bảng `participants` (SQL Editor)
Hãy truy cập vào dự án Supabase của bạn, nhấp vào mục **SQL Editor** và chạy đoạn lệnh sau:

```sql
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Hàm tự động thay đổi updated_at cột khi cập nhật hàng dữ liệu
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tạo kích hoạt trigger
drop trigger if exists update_participants_updated_at on participants;

create trigger update_participants_updated_at
before update on participants
for each row
execute function update_updated_at_column();
```

### 2. Tạo Storage Bucket lưu trữ Avatar
- Truy cập vào mục **Storage** của dự án Supabase.
- Bấm **New Bucket** để tạo một bucket mới.
- Đặt tên chính xác là `avatars`.
- **RẤT QUAN TRỌNG:** Tích chọn chế độ **Public bucket** để người xem có thể truy xuất hình ảnh trực tiếp không cần ký quyền.

---

## ⚡ Triển khai lên Vercel (Vercel Deployment)

Để deploy nhanh chóng trang web lên dịch vụ đám mây Vercel miễn phí:

1. Đăng tải mã nguồn của dự án lên kho lưu trữ **GitHub** (hoặc GitLab).
2. Đăng nhập vào trang quản trị **Vercel** (`https://vercel.com`).
3. Chọn **Add New Project**, chọn Import Repository GitHub vừa đẩy lên.
4. Tại phần thiết lập thông tin dự án, mở khóa mục **Environment Variables** và cấu hình 3 biến liên kết:
   - `VITE_SUPABASE_URL` = (Địa chỉ URL của dự án Supabase lấy từ phần Project Settings -> API)
   - `VITE_SUPABASE_ANON_KEY` = (Khóa anon lấy từ Project Settings -> API)
   - `VITE_ADMIN_PASSWORD` = (Mật khẩu bạn mong muốn sử dụng để mở khóa màn hình `/admin`)
5. Bấm nút **Deploy**. Chỉ mất khoảng 1 phút, dự án của bạn sẽ hoàn tất kích hoạt trực tuyến quốc tế sản xuất hoàn mỹ!
