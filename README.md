# Brawldex Helper & Quick Copy Extension

<p align="center">
  <img src="icons/icon128.png" alt="Brawldex Helper Logo" width="96" height="96">
</p>

<p align="center">
  <b>Tiện ích hỗ trợ người chơi Brawldex toàn diện: Đồng bộ tài khoản, Quản lý đội hình, Balo & Trang bị, Cửa hàng và 1-Click Copy lệnh bot.</b><br>
  <i>A comprehensive companion extension for Brawldex players: Account Sync, Roster Management, Bag & Held Items, Shop, and 1-Click Bot Commands.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge%20%7C%20Brave-success.svg" alt="Browser Support">
  <img src="https://img.shields.io/badge/Languages-Ti%E1%BA%BFng%20Vi%E1%BB%87t%20%7C%20English-orange.svg" alt="Languages">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## 🇻🇳 TIẾNG VIỆT

### 1. Giới Thiệu
**Brawldex Helper & Quick Copy** là tiện ích mở rộng (Extension) dành cho trình duyệt Chrome, Edge, Brave, Cốc Cốc, được thiết kế chuyên biệt để nâng tầm trải nghiệm của người chơi trên nền tảng **Brawldex** (`brawldex.live`). Tiện ích hoạt động độc lập, tải dữ liệu siêu nhanh và khắc phục triệt để các hạn chế gián đoạn của phiên bản web.

---

### 2. Các Tính Năng Nổi Bật

#### 🎴 Thẻ Huấn Luyện Viên & Đội Hình (Trainer & Roster)
- **Calling Card thời gian thực:** Hiển thị cấp độ (Level), điểm Rating, số dư Coins / Kẹo / Đá quý và ảnh nhân vật Trainer cùng Pokémon đồng hành.
- **Thống kê chiến đấu:** Theo dõi tổng số mạng hạ gục (KOs), số trận Thắng / Thua, Tỷ lệ Thắng (Win Rate) và danh sách Plate bảo hộ.
- **Quản lý Pokémon chuyên sâu:** Xem chi tiết 4 chiêu thức, hệ nguyên tố, năng lượng đánh (Energy 3/3), trạng thái Shiny, tiến hóa và gắn thẻ Yêu thích (Favorite ⭐).

#### ⚡ 1-Click Copy Siêu Tốc
- **Copy lệnh Chat:** 1-Click copy ngay lệnh bot Discord / Twitch:
  - `!join <code>`: Lệnh tham gia trận đấu nhanh.
  - `Code`: Copy nhanh mã Pokémon (ví dụ: `ABC-XYZ`).
  - `!party <code>`: Lệnh tạo phòng đội hình.
  - `Link`: Lấy đường dẫn trực tiếp ảnh Sprite pixel art chất lượng cao.
- **Copy hàng loạt:** Nút `📋 Copy tất cả !join` gom toàn bộ mã của các Pokémon đang lọc chỉ trong 1 lần nhấn.

#### 🎒 Balo & Quản Lý Trang Bị (Bag & Held Items)
- **Theo dõi kho tiêu hao (Consumables):** Đếm chính xác số lượng Kẹo hiếm (Rare Candy), Đĩa TM (TM Disc), Nước Shiny (Shiny Potion), Bụi Shiny (Shiny Dust) và Hộp Capsule (Item Capsule).
- **Mở Capsule & Đổi Potion:** Hỗ trợ mở Capsule nhận trang bị ngẫu nhiên hoặc ghép 3 Bụi Shiny thành 1 Bình Shiny trực tiếp.
- **Kho Held Items & Gắn trang bị:** Xem toàn bộ Held Items trong túi, trang bị hoặc gỡ bỏ trang bị cho từng Pokémon với giao diện trực quan.

#### 🛒 Cửa Hàng & Chợ Đen (Shop & Black Market)
- **Hàng ngày (Today's Stock):** Cập nhật danh sách Pokémon và Plate theo chu kỳ 8 tiếng.
- **Kiểm tra ví tiền thông minh:** Tự động phát hiện số dư thiếu và hiển thị thẻ báo thiếu tiền, ẩn nút mua để tránh bấm nhầm giao dịch lỗi.
- **Luôn có sẵn (Always in Stock):** Mua bóng Pokeball, Great Ball, Ultra Ball, Master Ball, đĩa kỹ năng TM Disc và Ability Patch.
- **Chợ đen (Black Market):** Theo dõi tình trạng mở/đóng cửa và danh sách vật phẩm chợ đen độc quyền.

#### 🔍 Tra Cứu Pokédex Offline 1025 Loài
- Tích hợp sẵn bộ dữ liệu đầy đủ 1025 loài Pokémon (Gen 1 đến Gen 9) ngay trong extension, không cần kết nối mạng để tìm kiếm chỉ số cơ bản, hệ và hình ảnh.

#### 🌐 Đa Ngôn Ngữ & Bảo Mật
- Hỗ trợ chuyển đổi song ngữ mượt mà giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧** trong phần Cài đặt.
- **An toàn 100%:** Hoạt động hoàn toàn phía Client (Client-side), dữ liệu lưu trữ trong bộ nhớ cục bộ trình duyệt (`chrome.storage.local`), không gửi dữ liệu cá nhân ra máy chủ thứ ba.

---

### 3. Hướng Dẫn Cài Đặt

1. **Tải mã nguồn:**
   - Clone repo về máy: `git clone https://github.com/<your-username>/brawldex-helper-extension.git`
   - Hoặc tải file `.zip` từ mục Releases và giải nén.
2. **Mở trang quản lý tiện ích trên trình duyệt:**
   - **Google Chrome / Brave / Cốc Cốc:** Truy cập `chrome://extensions/`
   - **Microsoft Edge:** Truy cập `edge://extensions/`
3. Bật công tắc **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
4. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén).
5. Chọn thư mục chứa file `manifest.json`.
6. Ghim biểu tượng **Brawldex Helper** lên thanh công cụ để sử dụng.

---

### 4. Hướng Dẫn Sử Dụng Lần Đầu

1. Mở và đăng nhập tài khoản của bạn tại trang game: [https://www.brawldex.live/](https://www.brawldex.live/)
2. Nhấp vào icon tiện ích trên thanh công cụ.
3. Bấm nút **Đồng bộ Web** (icon đám mây ☁️) hoặc vào phần **Cài đặt (⚙️)** bấm **Tự động bắt từ tab Brawldex**.
4. Tiện ích sẽ tự động nhận diện tài khoản, đồng bộ toàn bộ Pokémon, Balo và số dư của bạn!

---
---

## 🇬🇧 ENGLISH

### 1. Overview
**Brawldex Helper & Quick Copy** is a feature-packed browser extension for Google Chrome, Microsoft Edge, Brave, and Chromium-based browsers, tailored specifically for **Brawldex** (`brawldex.live`) players. It runs blazing-fast, operates locally, and provides seamless tools for team management, item tracking, shopping, and fast bot commands.

---

### 2. Key Features

#### 🎴 Real-time Trainer Calling Card & Roster
- **Live Profile Card:** Displays Level, Rating, Coins, Candies, Nuggets balance, active Trainer sprite, and Emblem/Partner Pokémon.
- **Battle Statistics:** Tracks Total KOs, Wins, Losses, Win Rate %, and active defense Plates.
- **In-depth Pokémon Inspector:** Inspect elemental types, 4 active moves, Energy points (3/3), Shiny status, evolutions, and toggle Favorites (⭐).

#### ⚡ 1-Click Fast Actions
- **Instant Bot Command Copying:**
  - `!join <code>`: Fast join command for Discord / Twitch chat bots.
  - `Code`: Copies the pure Pokémon code (e.g. `ABC-XYZ`).
  - `!party <code>`: Generates party creation command.
  - `Link`: Direct URL to high-resolution pixel art sprites.
- **Batch Copy:** Click `📋 Copy All !join` to copy all commands for currently filtered Pokémon in one shot.

#### 🎒 Inventory & Held Items Management
- **Consumables Counter:** Live tracker for Rare Candies, TM Discs, Shiny Potions, Shiny Dust, and Item Capsules.
- **Capsule Opener & Crafting:** Open Item Capsules for unowned random held items or craft 3 Shiny Dust into 1 Shiny Potion directly.
- **Held Items Equipment:** Browse all held items in your bag, equip or unequip them to any Pokémon with instant sync.

#### 🛒 Daily Shop & Black Market
- **Today's Stock:** Synchronized with the 8-hour rotation cycle for Pokémon and Plates.
- **Smart Budget Protection:** Automatically calculates coin/diamond deficits, hides unaffordable buy buttons, and shows exact remaining currency needed.
- **Always in Stock:** Quick access to Pokéballs, Great Balls, Ultra Balls, Master Balls, TM Discs, and Ability Patches.
- **Black Market Radar:** Real-time open/closed status indicator with stock listings.

#### 🔍 Offline 1025-Species Pokédex
- Bundled with a full offline database covering all 1025 Pokémon species across Gen 1 to Gen 9. Search instantly without network lag.

#### 🌐 Bilingual & Privacy-First
- Instant language toggle between **English 🇬🇧** and **Tiếng Việt 🇻🇳** in Settings.
- **100% Private & Safe:** Operates strictly on client-side storage (`chrome.storage.local`). No personal tokens or sensitive data are transmitted to external servers.

---

### 3. Installation Guide

1. **Get the Code:**
   - Clone this repository: `git clone https://github.com/<your-username>/brawldex-helper-extension.git`
   - Or download and extract the `.zip` archive from Releases.
2. **Open Extensions page in your browser:**
   - **Chrome / Brave:** Navigate to `chrome://extensions/`
   - **Microsoft Edge:** Navigate to `edge://extensions/`
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. Pin **Brawldex Helper** to your browser toolbar for easy access.

---

### 4. First-time Setup

1. Open and sign in to your account at: [https://www.brawldex.live/](https://www.brawldex.live/)
2. Open the extension popup from the toolbar.
3. Click the **Web Sync** button (cloud icon ☁️) or open **Settings (⚙️)** and click **Auto-Detect from Brawldex Tab**.
4. The extension will automatically sync your Owner ID, Pokémon roster, bag inventory, and wallet balance!

---

### 5. License
Distributed under the **MIT License**. Free for personal and community use.
