# UET Downloader Pro

**Tác giả & Bản quyền:** HBM (HBM - Dawn)  
**Nền tảng hỗ trợ:** Firefox 109+, Google Chrome, Microsoft Edge, Cốc Cốc, Brave  
**GitHub Repository:** [https://github.com/hbminh2508-design/uet-downloader-pro](https://github.com/hbminh2508-design/uet-downloader-pro)

Tiện ích mở rộng (Browser Extension) giúp sinh viên trường Đại học Công nghệ – ĐHQGHN (UET) **tự động hóa tải hàng loạt bài giảng (Google Drive), tài liệu và bài tập** trên hệ thống [portal.uet.vnu.edu.vn](https://portal.uet.vnu.edu.vn) chỉ với 1 cú click.

---

## 💡 Nguồn gốc & Lời cảm ơn (Acknowledgements)

Extension này được thiết kế và phát triển bởi **HBM (HBM - Dawn)**, xuất phát từ việc mượn ý tưởng công cụ tải file ban đầu của tác giả **XD4T**. 

Từ phiên bản gốc của XD4T (vốn chỉ hỗ trợ tải file đơn giản trong mục *Tập tin*), **HBM** đã nghiên cứu, viết lại toàn bộ kiến trúc và phát triển thêm hàng loạt tính năng đột phá:
- **Tự động tải bài giảng Google Drive từ Trang chủ / Học phần:** Trước đây sinh viên phải click từng bài giảng ➔ mở trang trung gian ➔ bấm nút mở tab mới ➔ vào Google Drive rồi mới tải được. HBM đã tự động hóa 100% quy trình này ngay từ giao diện danh sách môn học.
- **Nhận diện mọi nút tải bài tập:** Tự động phát hiện và phân giải link đề bài, file tài liệu đính kèm bên trong trang bài tập.
- **Tự động dọn dẹp tab:** Cơ chế tự động đóng các tab Google Drive sau khi tải xong, giúp trình duyệt luôn gọn gàng, không bị mở tràn lan tab rác.
- **Tải ngầm chống chặn:** Sử dụng WebExtension API cao cấp giúp tải 10, 20 file liên tiếp mà không bao giờ bị trình duyệt (đặc biệt là Firefox) chặn pop-up hay hỏi xác nhận lặp đi lặp lại.
- **Tự động kiểm tra & Cập nhật (Auto-Update):** Tự động phát hiện bản cập nhật mới trên GitHub và hỗ trợ cập nhật 1-click qua file `cap-nhat.bat`.

---

## ✨ Tính năng nổi bật

1. **Tải bài giảng Google Drive 1-Click ngay tại Trang chủ / Học phần:**
   - Ô checkbox được gắn trực tiếp ở đầu mỗi bài giảng (`Bài giảng chương 1-full`, `Bài tập...`).
   - Tự động phân giải link bài giảng, chuyển link Google Drive (`/file/d/ID/view`) thành link tải trực tiếp (`drive.usercontent.google.com/...&confirm=t`) và tải thẳng về máy.
2. **Hỗ trợ toàn diện trang Bài tập:**
   - Nhận diện mọi loại đề bài: link Google Drive, file Canvas, tài liệu `.pdf`, `.docx`, `.pptx`, `.zip`, `.rar`.
3. **Tự động đóng tab Google Drive ("tránh bừa ra"):**
   - Mọi tab mở ra để tải đều được extension kiểm soát và tự động đóng ngay sau khi kích hoạt tải, giữ trình duyệt luôn sạch sẽ.
4. **Chọn nhanh theo từng Chương / Học phần:**
   - Ô checkbox ngay đầu tiêu đề chương (ví dụ: *▾ Chương 1: Véc-tơ và hình học không gian*) cho phép bạn chọn hoặc bỏ chọn toàn bộ bài giảng của chương đó chỉ với 1 click.
5. **Hỗ trợ đầy đủ tab Tập tin (/files):**
   - Tick chọn nhiều tài liệu môn học và tải về cùng lúc.
6. **Thanh công cụ nổi hiện đại (by HBM - Dawn):**
   - Hiển thị số lượng mục đã chọn: `Đã chọn: [N]`.
   - Nút **Chọn tất cả** & **Bỏ chọn** hoạt động tức thì.
   - Nút **Tải đã chọn** hiển thị tiến độ thời gian thực (`⏳ Đang lấy link 1/6...` ➔ `⬇ Đang tải 1/6...`).
   - Chữ ký thương hiệu: **`by HBM - Dawn`**.

---

## 🔄 Tính năng Tự động Cập nhật (Auto-Update)

Extension được tích hợp cơ chế tự động theo dõi phiên bản mới từ GitHub:
1. **Thông báo khi có bản mới:**
   - Khi có commit mới hoặc phiên bản mới trên GitHub, extension sẽ hiển thị nút nổi bật: `🚀 Có bản v...` trên thanh công cụ và huy hiệu `NEW` trên icon trình duyệt.
2. **Cập nhật siêu tốc trong 2 giây:**
   - Trong thư mục extension trên máy tính, bạn chỉ cần **nhấp đúp chuột vào file `cap-nhat.bat`**.
   - Script sẽ tự động kéo toàn bộ code mới nhất từ GitHub về thư mục extension của bạn.
   - Sau đó, bạn chỉ cần vào trình duyệt (`about:debugging` hoặc `chrome://extensions`) và bấm nút **Tải lại** (*Reload*) là xong!

---

## 🚀 Hướng dẫn cài đặt

### 1. Dành cho Firefox

1. Tải mã nguồn về máy: Bấm nút xanh **`Code`** ➔ **`Download ZIP`** trên GitHub và giải nén.
2. Mở Firefox, gõ vào thanh địa chỉ:
   ```text
   about:debugging#/runtime/this-firefox
   ```
   rồi nhấn **Enter**.
3. Bấm nút **Nạp tiện ích bổ sung tạm thời…** (*Load Temporary Add-on…*).
4. Chọn file `manifest.json` trong thư mục vừa giải nén.
5. *(Nên làm)* Bấm vào biểu tượng mảnh ghép 🧩 ở thanh công cụ góc phải trên của Firefox và ghim tiện ích ra ngoài.

### 2. Dành cho Google Chrome / Microsoft Edge / Cốc Cốc / Brave

1. Tải mã nguồn về máy (Download ZIP và giải nén).
2. Mở trang quản lý tiện ích:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Cốc Cốc: `coccoc://extensions`
3. Bật công tắc **Chế độ dành cho nhà phát triển** (*Developer mode*).
4. Bấm **Tải tiện ích đã giải nén** (*Load unpacked*).
5. Chọn thư mục chứa extension (thư mục chứa file `manifest.json`).

---

## 📄 License

Dự án phát hành theo giấy phép **MIT License**.  
Bản quyền thuộc về **HBM (HBM - Dawn)** © 2026.
