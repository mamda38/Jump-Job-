# Night English

Giao diện học tiếng Anh chạy trên máy cá nhân, tối ưu cho những buổi học ban đêm. Nội dung được đồng bộ từ thư mục `english-learning/`; câu trả lời và tiến độ chỉ lưu trong trình duyệt.

## Yêu cầu

- Node.js 22.13 trở lên

## Chạy giao diện

```bash
npm install
npm run dev
```

Mở địa chỉ được in trong terminal, mặc định là `http://localhost:3000`.

## Nội dung Markdown

Mỗi lần chạy `npm run dev` hoặc `npm run build`, ứng dụng tự đọc lại các file bài học, bài đánh giá, từ vựng và nhật ký trong `english-learning/`.

Nếu đang chạy ứng dụng và vừa sửa Markdown, dừng rồi chạy lại `npm run dev`, hoặc chạy:

```bash
npm run content:sync
```

## Dữ liệu học tập

- Khóa lưu trữ: `english-learning:v1`.
- Dữ liệu không được ghi ngược vào Markdown và không đồng bộ sang thiết bị khác.
- Nút **Đặt lại dữ liệu** trong sidebar yêu cầu xác nhận trước khi xóa.

## Kiểm tra

```bash
npm run build
npm test
```
