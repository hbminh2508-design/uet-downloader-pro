# UET Downloader Pro

**Tác giả & Bản quyền:** HBM (HBM - Dawn)  
**Nền tảng hỗ trợ:** Firefox 109+, Google Chrome, Microsoft Edge, Cốc Cốc, Brave

Tiện ích mở rộng (Browser Extension) giúp sinh viên trường Đại học Công nghệ – ĐHQGHN (UET) **tự động hóa tải hàng loạt bài giảng (Google Drive), tài liệu và bài tập** trên hệ thống [portal.uet.vnu.edu.vn](https://portal.uet.vnu.edu.vn) chỉ với 1 cú click.

---

## 💡 Nguồn gốc & Lời cảm ơn (Acknowledgements)

Extension này được thiết kế và phát triển bởi **HBM (HBM - Dawn)**, xuất phát từ việc mượn ý tưởng công cụ tải file ban đầu của tác giả **XD4T**. 

Từ phiên bản gốc của XD4T (vốn chỉ hỗ trợ tải file đơn giản trong mục *Tập tin*), **HBM** đã nghiên cứu, viết lại toàn bộ kiến trúc và phát triển thêm hàng loạt tính năng đột phá nhằm giải quyết triệt để những bất tiện khi tải bài giảng trên hệ thống UET Portal:
- **Tự động tải bài giảng Google Drive từ Trang chủ / Học phần:** Trước đây sinh viên phải click từng bài giảng ➔ mở trang trung gian ➔ bấm nút mở tab mới ➔ vào Google Drive rồi mới tải được. HBM đã tự động hóa 100% quy trình này ngay từ giao diện danh sách môn học.
- **Tự động dọn dẹp tab:** Cơ chế tự động đóng các tab Google Drive sau khi tải xong, giúp trình duyệt luôn gọn gàng, không bị mở tràn lan tab rác.
- **Tải ngầm chống chặn:** Sử dụng WebExtension API cao cấp giúp tải 10, 20 file liên tiếp mà không bao giờ bị trình duyệt (đặc biệt là Firefox) chặn pop-up hay hỏi xác nhận lặp đi lặp lại.
- **Giao diện hiện đại & chọn nhanh cả chương:** Thiết kế lại thanh công cụ nổi tinh tế, đồng nhất và bổ sung ô tick chọn toàn bộ bài học trong 1 chương.

---

## ✨ Tính năng nổi bật

1. **Tải bài giảng Google Drive 1-Click ngay tại Trang chủ / Học phần:**
   - Ô checkbox được gắn trực tiếp ở đầu mỗi bài giảng (`Bài giảng chương 1-full`, `Bài tập...`).
   - Tự động phân giải link bài giảng, chuyển link Google Drive (`/file/d/ID/view`) thành link tải trực tiếp (`drive.usercontent.google.com/...&confirm=t`) và tải thẳng về thư mục Downloads.
2. **Tự động đóng tab Google Drive ("tránh bừa ra"):**
   - Mọi tab mở ra để tải đều được extension kiểm soát và tự động đóng ngay sau 3.5 giây, giữ không gian làm việc của bạn luôn ngăn nắp.
3. **Chọn nhanh theo từng Chương / Học phần:**
   - Ô checkbox ngay đầu tiêu đề chương (ví dụ: *▾ Chương 1: Véc-tơ và hình học không gian*) cho phép bạn chọn hoặc bỏ chọn toàn bộ bài giảng của chương đó chỉ với 1 click.
4. **Hỗ trợ đầy đủ tab Tập tin (/files):**
   - Tick chọn nhiều tài liệu môn học và tải về cùng lúc.
5. **Thanh công cụ nổi hiện đại (by HBM - Dawn):**
   - Nằm cố định ở góc dưới bên phải màn hình.
   - Hiển thị số lượng mục đã chọn: `Đã chọn: [N]`.
   - Nút **Chọn tất cả** & **Bỏ chọn** hoạt động tức thì.
   - Nút **Tải đã chọn** hiển thị tiến độ thời gian thực (`⏳ Đang lấy link 1/6...` ➔ `⬇ Đang tải 1/6...`).
   - Chữ ký thương hiệu: **`by HBM - Dawn`**.

---

## 🚀 Hướng dẫn cài đặt

### 1. Dành cho Firefox

1. Mở Firefox, gõ vào thanh địa chỉ:
   ```text
   about:debugging#/runtime/this-firefox
   ```
   rồi nhấn **Enter**.
2. Bấm nút **Nạp tiện ích bổ sung tạm thời…** (*Load Temporary Add-on…*).
3. Chọn file `manifest.json` trong thư mục extension của bạn.
4. *(Nên làm)* Bấm vào biểu tượng mảnh ghép 🧩 ở thanh công cụ góc phải trên của Firefox và ghim tiện ích ra ngoài.

> 💡 *Mỗi lần cập nhật code:* Bạn chỉ cần vào lại trang `about:debugging` và bấm nút **Tải lại** (*Reload*) ở mục extension là xong!

### 2. Dành cho Google Chrome / Microsoft Edge / Cốc Cốc / Brave

1. Mở trang quản lý tiện ích:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Cốc Cốc: `coccoc://extensions`
2. Bật công tắc **Chế độ dành cho nhà phát triển** (*Developer mode*).
3. Bấm **Tải tiện ích đã giải nén** (*Load unpacked*).
4. Chọn thư mục chứa extension (thư mục chứa file `manifest.json`).

---

## 📖 Hướng dẫn sử dụng

1. Đăng nhập vào [portal.uet.vnu.edu.vn](https://portal.uet.vnu.edu.vn) và vào môn học của bạn (ví dụ môn *Giải tích 2*).
2. Tại **Trang chủ** hoặc tab **Các học phần**:
   - Tick chọn các bài giảng muốn tải (hoặc tick ô vuông ở đầu tên chương để chọn cả chương).
3. Tại tab **Tập tin**:
   - Tick chọn các file tài liệu cần tải.
4. Nhìn xuống thanh công cụ ở góc phải bên dưới:
   - Bấm nút xanh **Tải đã chọn**.
   - Extension sẽ tự động lấy link, tải các bài giảng từ Google Drive về máy lần lượt và tự động dọn sạch các tab vừa mở!

---

## 📄 License

Dự án phát hành theo giấy phép **MIT License**.  
Bản quyền thuộc về **HBM (HBM - Dawn)** © 2026.
