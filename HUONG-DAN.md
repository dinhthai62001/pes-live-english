# 🎓 Lớp Học English A2 của Pess & Po – Quiz tương tác TikTok LIVE

Lớp học trực tiếp: **bài tập chạy ngay trên bảng đen** (không còn video). Người xem bình luận đáp án, trả lời đúng và nhanh thì được điểm. Lớp có **47 ghế**: 40 ghế thường (8 cột × 5 hàng) và **7 ghế VIP** to ở giữa dành cho 7 bạn tặng nhiều xu nhất (người nhiều nhất ngồi ghế giữa to nhất, có vương miện 👑; học sinh mini tóc ngắn / tóc dài), ai đến sau đứng ở **hành lang**. Bạn **điểm cao** ở hành lang sẽ được mời vào ngồi; bạn **tặng quà** luôn được ưu tiên hơn và còn được phong chức cấp A1 (chỉ hiện nhẹ, không kêu gọi trên màn hình).

(Bản video cũ được lưu ở `backup-video/`.)

---

## 1. Chạy

```bash
npm install     # 1 lần duy nhất
npm start
```

| Địa chỉ | Dùng để |
|---|---|
| `http://localhost:3000/` | Xem lớp học trên web |
| `http://localhost:3000/?clean=1` | Đưa vào TikTok LIVE Studio / OBS (Browser source **1080 × 1920**, hoặc 720 × 1280 cũng tự co đúng) |
| `http://localhost:3000/control.html` | Bảng điều khiển cho streamer |
| `http://localhost:3000/?demo=1` | Chạy thử: bạn ảo tự vào lớp, trả lời, thả tim, tặng quà |

Kết nối LIVE: mở `control.html`, nhập username kênh TikTok đang live (không cần `@`), bấm **Kết nối**. Chấm xanh = đã nhận dữ liệu.

## 2. Cách chơi (người xem làm gì)

Mỗi vòng ~30 giây: **giới thiệu câu → làm bài → công bố đáp án → câu tiếp theo**.

- **Chọn đáp án (A/B/C/D)**: bình luận `A`, `B`, `C` hoặc `D` (nhận cả `đáp án b`, hoặc gõ đúng nội dung đáp án). Mỗi bạn chọn 1 lần.
- **Điền từ**: bình luận từ tiếng Anh đúng. Được thử tối đa 3 lần. Có 2 kiểu: điền chữ còn thiếu (lộ sẵn chữ cái đầu) và sắp xếp chữ cái bị xáo. Nửa thời gian và 3/4 thời gian sẽ gợi ý thêm một chữ.
- Trả lời xong hiện bong bóng 💭 trên bàn (chưa lộ đúng/sai). Hết giờ bong bóng lật thành ✓ hoặc ✗, kèm điểm bay lên.
- **Điểm**: nhanh nhất +5, nhì +3, ba +2, những bạn đúng còn lại +1. Đúng liên tiếp có ngọn lửa 🔥 trên bàn.
- Cuối vòng bảng hiện **Đáp án**, giải thích tiếng Việt, số bạn đúng và bảng **10 bạn trả lời nhanh nhất**. Bảng thi đua tích lũy giữ ở cột phải; bảng chuyên cần nằm phía dưới và hiện tối đa 10 bạn. Like được 1 sao, follow 1 sao, chia sẻ 2 sao; mỗi xu quà được 10 sao.
- Bạn ngoài hành lang vẫn trả lời và tính điểm bình thường, chỉ là không hiện trên bàn.

## 3. Ghế ngồi, hành lang, chức vụ

- Vào phòng live / bình luận / thả tim → có ghế thì ngồi, **hết ghế thì ra hành lang** (hàng chờ hiện avatar + "+N").
- **Thứ tự ưu tiên vào ghế: tặng quà (nhiều xu trước) → điểm cao → đến sớm.**
- Cuối mỗi vòng, bạn **điểm cao ngoài hành lang** được đổi chỗ với bạn đang ngồi mà điểm thấp hơn (tối đa 3 lượt đổi mỗi vòng). Bạn đã tặng quà **không bị đổi xuống**.
- Bạn tặng quà vào ngồi ngay, kể cả khi lớp đầy: chen vào chỗ của bạn ít điểm và ít hoạt động nhất. Bạn tặng nhiều xu nhất ngồi ghế đẹp nhất (hàng đầu, giữa lớp).
- Mỗi bạn có kiểu tóc, màu tóc, màu da riêng theo ID (tóc ngắn / tóc dài); ảnh đại diện TikTok hiện thành vòng tròn nhỏ cạnh tên. Quà tặng chỉ là tùy chọn, không có chữ mời gọi trên màn hình.
- **Chức vụ theo tổng xu đã tặng** (sửa ở `thanks.js`, mảng `LEVELS`):

| Xu | Cấp | Chức vụ | Danh hiệu |
|---|---|---|---|
| 1+ | A1.1 | Đại gia tập sự | Rich Rookie |
| 10+ | A1.2 | Đại gia nhí | Little Tycoon |
| 50+ | A1.3 | Đại gia phố | Street Boss |
| 200+ | A1.4 | Đại gia xế hộp | Car Baron |
| 500+ | A1.5 | Tỷ phú | Billionaire |
| 1500+ | A1.6 | Vua đại gia | Mega Tycoon |

Huy hiệu cấp (vd `A1.3`) gắn cạnh bạn ở bàn, màu nơ cổ áo đổi theo cấp. Lên cấp thì banner ghi "THĂNG CHỨC". Độ hoành tráng của pháo giấy/lời cảm ơn theo số xu của **một lần** tặng.

## 4. Bài tập (trình độ A2)

Ngân hàng ở `questions.js`: **~1.400 câu chọn đáp án và ~1.100 câu điền từ**, xen kẽ 2 chọn đáp án : 1 điền từ, không lặp cho đến khi dùng hết.

- **Ngữ pháp A2 (soạn tay, có giải thích tiếng Việt):** quá khứ đơn, so sánh hơn / nhất, will – going to – might, hiện tại hoàn thành (ever, never, already, yet, for, since), must / mustn't / don't have to / should, much – many – few – little – enough – too, giới từ, liên từ và câu điều kiện loại 1, động từ + -ing / to, mệnh đề quan hệ, tính từ – trạng từ, câu hỏi đuôi, cụm động từ, giao tiếp hằng ngày (chỉ đường, đặt món, điện thoại, mời, xin phép).
- **Từ vựng A2 (~560 từ, 17 chủ đề):** du lịch, sức khỏe, mua sắm, ẩm thực, nhà cửa, quần áo – ngoại hình, nghề nghiệp, sở thích – thể thao, công nghệ – truyền thông, thời tiết – thiên nhiên, thành phố, cảm xúc – tính cách, động từ, tính từ, tần suất, học tập, số thứ tự. Tự sinh Anh→Việt, Việt→Anh, đoán emoji, điền chữ, sắp xếp chữ cái.
- **Sinh tự động:** nói giờ (rưỡi, kém 15, hơn 15, kém...), trái nghĩa, tìm từ khác loại.

Thêm từ: sửa chuỗi `VOCAB_RAW` (dạng `en|nghĩa|emoji|cờ;`, dùng chính tả Mỹ). Thêm câu ngữ pháp: thêm một dòng vào mảng `G` (chọn đáp án) hoặc `F` (điền từ). Bản câu hỏi A1 cũ nằm ở `backup-video/questions-a1.js`.

## 5. Giọng đọc

**Chọn giọng bằng `TTS_ENGINE` trong `.env`:** `google` (mặc định: giọng Google Translate, trả về dưới 1 giây, cần internet, lỗi thì tự dùng giọng máy), `say` (giọng máy macOS như ban đầu, offline), `edge` (giọng Microsoft bên dưới, hay hơn nhưng đôi khi trả trễ). Giọng Google không chỉnh được tốc độ.

**Giọng thần kinh Microsoft (`TTS_ENGINE=edge`, cần internet):** dùng thư viện Python `edge-tts` trong `.venv-tts/` (gọi qua `tts_edge.py`): tiếng Việt **vi-VN-HoaiMyNeural** (nữ), tiếng Anh **en-US-EmmaNeural**. Đổi giọng trong `.env`: `TTS_EDGE_VI=vi-VN-NamMinhNeural` (giọng nam), `TTS_EDGE_EN=en-US-AvaNeural`. Câu nào tạo quá 4,5 giây thì tạm phát bằng giọng máy `say` rồi lần sau dùng bản mp3. Cài lại nếu mất: `python3 -m venv .venv-tts && .venv-tts/bin/pip install edge-tts`.

(Phần dưới là cấu hình giọng máy `say`, dùng khi mất mạng.)

Máy chủ tạo giọng nói bằng lệnh `say` của macOS (tiếng Việt **Linh**, tiếng Anh **Samantha**, chạy offline), trang lớp học chỉ phát file âm thanh nên **chạy được cả trong OBS / TikTok LIVE Studio**. File lưu cache ở `tts-cache/`, câu đã đọc rồi phát lại ngay.

- **Đọc đề:** đọc câu hỏi và cả 4 đáp án A, B, C, D (từ tiếng Anh đọc giọng Anh, phần tiếng Việt đọc giọng Việt). Câu điền từ đọc yêu cầu và nghĩa tiếng Việt.
- **Đọc đáp án:** "Đáp án là B, flight." kèm số bạn đúng, tên bạn nhanh nhất và lời chúc mừng.
- **Quà tặng:** ai tặng quà cũng được Pess & Po nói tên, cảm ơn và chúc mừng; lên cấp thì chúc mừng phong chức; quà từ 50 xu có thêm "Cả lớp vỗ tay chúc mừng". Lời cảm ơn xếp hàng nói lần lượt, không bị cắt.
- Lời đọc đề / đáp án có ưu tiên hơn lời nói thường của Pess & Po, nhưng không cắt lời cảm ơn quà.
- Tắt giọng đọc: ô **🔊** ở `control.html` (bấm Áp Dụng), hoặc mở trang với `?voice=0`. Đổi giọng/tốc độ trong `.env`: `TTS_VOICE_VI`, `TTS_VOICE_EN`, `TTS_RATE_VI` (mặc định 220, tiếng Việt đọc nhanh), `TTS_RATE_EN` (160).
- Mở bằng trình duyệt thường (không phải OBS) thì Chrome chặn tự phát tiếng: bấm vào màn hình một lần là có tiếng. Máy không phải macOS thì không có lệnh `say`, trang sẽ thử giọng của trình duyệt.

## 6. Bảng điều khiển

- **Giải lao / Tiếp tục / Qua câu này**.
- Chọn dạng bài (xen kẽ / chỉ A-B-C-D / chỉ điền từ) và **chủ đề** riêng, chỉnh số giây mỗi câu.
- **Xoá điểm**, **Xoá cả lớp**.
- Giả lập: thêm bạn ảo tự trả lời, trả lời A/B/C/D, thả tim, bạn vào lớp, tặng quà 6 mức.

## 7. Tùy chỉnh `.env`

```env
PORT=3000
TIKTOK_USERNAME=kenhcuaban
VIP_SEATS=7              # số ghế VIP ở giữa lớp (nên giữ 7); tổng số ghế mặc định = 40 ghế thường + ghế VIP = 47
STUDENT_IDLE_MIN=5       # không bình luận/thả tim quá số phút này thì bị mời khỏi ghế, hành lang hay hàng đứng (nhường người khác)
DONOR_IDLE_MIN=60        # bạn đã tặng quà được giữ chỗ lâu hơn
# SIGN_API_KEY=          # khóa eulerstream (tùy chọn)
```

Trên màn hình: `?goal=500` đổi mốc thả tim (mặc định mỗi 666 tim Pess & Po ăn mừng).
