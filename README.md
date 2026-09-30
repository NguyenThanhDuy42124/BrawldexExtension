# Brawldex Helper & Quick Copy Extension

Chrome / Edge Extension giúp tự động bắt API Supabase của trang Brawldex, hiển thị danh sách toàn bộ Pokémon và cung cấp tính năng **1-Click Copy** mã code, lệnh bot Discord/Twitch (`!join <code>`, `!party <code>`) và link sprite pixelart.

---

## 1. Cài Đặt Vào Trình Duyệt (Chrome / Edge / Brave / Cốc Cốc)

1. Mở trình duyệt và truy cập trang quản lý Extension:
   - **Chrome / Brave / Cốc Cốc:** `chrome://extensions/`
   - **Microsoft Edge:** `edge://extensions/`
2. Bật chế độ **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
3. Nhấp vào nút **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục dự án:
   `Thư mục BrawldexExtension đã giải nén`
5. Tiện ích **Brawldex Helper & Quick Copy** sẽ xuất hiện trên thanh công cụ trình duyệt!

---

## 2. Các Tính Năng Chính

- **1-Click Copy Siêu Tốc:**
  - Nút **`!join`**: Copy ngay lệnh chat bot `!join <code_pokemon>`.
  - Nút **`Code`**: Copy chỉ mã code Pokémon (ví dụ `ABC-XYZ`).
  - Nút **`!party`**: Copy lệnh tạo party `!party <code_pokemon>`.
  - Nút **`Link`**: Copy đường dẫn trực tiếp ảnh sprite pixelart của Pokémon.
- **Copy Hàng Loạt:** Nút `📋 Copy tất cả !join` gom tất cả các lệnh join của các Pokémon đang lọc chỉ trong một lần bấm.
- **Tự Động Bắt Tài Khoản (Auto-Detect):** Vào mục Cài đặt (⚙️), bấm `🔍 Tự động bắt từ tab Brawldex` khi đang mở trang `brawldex.live`.
- **Bộ Lọc & Tìm Kiếm:**
  - Lọc theo tên Pokémon (Gen 1 đến Gen 9 với 1025 loài chuẩn).
  - Lọc theo năng lượng: Đầy Energy (`3/3`), Cần sạc (`<3/3`), Đã thắng (`Has Wins`).
- **Xuất Dữ Liệu:** Hỗ trợ xuất danh sách ra file `.txt` hoặc `.json`.

---

## 3. Chạy Bằng Dòng Lệnh Python (CLI)

Nếu không muốn mở trình duyệt, bạn có thể chạy trực tiếp script:

```bash
# Xem danh sách trực tiếp trên terminal
python fetch_pokemon.py

# Xuất ra file text
python fetch_pokemon.py --export txt --output my_team.txt

# Xuất ra file json
python fetch_pokemon.py --export json --output my_team.json
```
