# 📁 vip-history – Hall of Fame & Đại Gia Lớp Học

Hệ thống ghi nhận và chào mừng tự động dành cho:
1. **Học sinh giỏi**: **Chỉ lấy đúng Top 1, 2, 3** bảng điểm thi đua khi kết thúc bài học.
2. **Người nạp tiền (Donate)**: **Thêm HẾT TẤT CẢ** những ai đã nạp tiền (dù chỉ 1 xu hay hàng ngàn xu) khi kết thúc bài học.

---

## ⚡ Quy Tắc Vận Hành Quan Trọng

### 1. Chỉ thêm vào danh sách khi bấm "Kết thúc bài học"
- Trong suốt quá trình live, dữ liệu không được ghi vào file `vip-history`.
- Khi streamer bấm **Kết thúc bài học** (`action: "end"` trên trang điều khiển), server mới chính thức tổng kết:
  - Bảng điểm cao nhất: Lọc lấy Top 1, Top 2, Top 3.
  - Người nạp tiền: Lấy toàn bộ danh sách những bạn có `coins > 0`.
  - Ghi nhận vào file `vip-history/data.json`.

### 2. Đọc 1 lần duy nhất rồi tự động xoá khỏi data
- Khi một bạn trong danh sách tham gia vào phòng live tiếp theo:
  - Hệ thống phát hiện danh hiệu (Đại gia / Thủ khoa / Combo) → Hiển thị banner quý tộc + hiệu ứng pháo sáng + phát giọng đọc TTS chào mừng.
  - **Lập tức xoá bạn đó khỏi `data.json`**.
  - Nếu bạn đó bị rớt mạng, thoát ra vào lại hoặc vào lại ở các buổi sau: **Sẽ KHÔNG bị đọc lại nữa**.
  - Bạn đó chỉ được chào lại nếu ở buổi học tiếp theo lại tiếp tục nạp tiền hoặc lại lọt Top 1-2-3 điểm thi!

---

## 🎭 Phân loại lời chào

- **👑💎 Combo Đại gia Học bá**: Vừa lọt Top 1-3 điểm vừa có nạp tiền.
- **💎 Đại gia Top 1**: Người nạp nhiều xu nhất hoặc ≥ 500 xu (*Chủ tịch trải thảm đỏ, sếp lớn giá đáo*).
- **💵 Đại gia Top 2-3**: Người đứng Top 2-3 nạp tiền (*Phó chủ tịch, Đại gia xế hộp*).
- **💖 Mạnh thường quân hảo tâm**: Tất cả các bạn nạp tiền còn lại (*Tri ân tấm lòng vàng tiếp sức lớp học*).
- **🏆 Thủ khoa & Á khoa**: Top 1, 2, 3 điểm bài học (*Quán quân tri thức, kỷ lục gia*).
