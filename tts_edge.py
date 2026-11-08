#!/usr/bin/env python3
"""Tạo file mp3 bằng giọng thần kinh Microsoft (thư viện edge-tts).
Dùng: tts_edge.py <voice> <rate> <out.mp3>  (nội dung đọc truyền qua stdin, UTF-8 — tránh lỗi mã hóa khi truyền qua tham số dòng lệnh)
Dịch vụ thỉnh thoảng trả về rỗng nên thử lại tối đa 4 lần."""
import asyncio, sys
import edge_tts

async def synth(text, voice, rate, out):
    last = None
    for attempt in range(4):
        try:
            data = bytearray()
            async for ch in edge_tts.Communicate(text, voice, rate=rate).stream():
                if ch["type"] == "audio":
                    data += ch["data"]
            if len(data) > 500:
                with open(out, "wb") as f:
                    f.write(data)
                return 0
            last = "rỗng"
        except Exception as e:  # NoAudioReceived, lỗi mạng...
            last = type(e).__name__
        await asyncio.sleep(0.2)
    print("edge-tts thất bại:", last, file=sys.stderr)
    return 1

if __name__ == "__main__":
    voice, rate, out = sys.argv[1], sys.argv[2], sys.argv[3]
    text = sys.stdin.buffer.read().decode("utf-8").strip()
    sys.exit(asyncio.run(synth(text, voice, rate, out)))
