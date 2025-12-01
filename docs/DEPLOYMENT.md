# Hướng dẫn Deploy lên GitHub Pages

## 📋 Các file đã được tạo/cập nhật

1. ✅ **vite.config.ts** - Đã thêm cấu hình `base: '/Project-Tracker/'`
2. ✅ **.github/workflows/deploy.yml** - GitHub Actions workflow để tự động deploy

## 🚀 Các bước để deploy

### Bước 1: Cấu hình GitHub Repository

1. Đẩy code lên GitHub repository của bạn:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment configuration"
   git push origin main
   ```

2. Vào repository trên GitHub, chọn **Settings** → **Pages**

3. Trong phần **Source**, chọn:
   - Source: **GitHub Actions**

### Bước 2: Thêm Secret cho API Key (Nếu cần)

Nếu ứng dụng của bạn sử dụng `GEMINI_API_KEY`:

1. Vào **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Thêm secret:
   - Name: `GEMINI_API_KEY`
   - Value: `<your-api-key-here>`

### Bước 3: Chạy Deployment

Workflow sẽ tự động chạy khi bạn push code lên branch `main`. Bạn cũng có thể:

1. Vào tab **Actions** trên GitHub
2. Chọn workflow "Deploy to GitHub Pages"
3. Click **Run workflow** để chạy thủ công

### Bước 4: Kiểm tra Website

Sau khi deployment thành công, website sẽ có địa chỉ:
```
https://<username>.github.io/Project-Tracker/
```

## ⚙️ Tùy chỉnh

### Thay đổi tên repository

Nếu repository của bạn có tên khác, cập nhật trong `vite.config.ts`:

```typescript
base: '/ten-repository-cua-ban/',
```

### Thay đổi branch chính

Nếu branch chính của bạn là `master` thay vì `main`, sửa trong `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - master  # Thay đổi từ main sang master
```

## 🔍 Kiểm tra lỗi

Nếu deployment thất bại:

1. Vào tab **Actions** trên GitHub
2. Click vào workflow run bị lỗi
3. Xem logs để tìm nguyên nhân
4. Các lỗi thường gặp:
   - Thiếu dependencies: Chạy `npm install` local để kiểm tra
   - Build lỗi: Chạy `npm run build` local để test
   - Thiếu permissions: Kiểm tra Settings → Actions → General → Workflow permissions

## 📝 Ghi chú

- Workflow sẽ tự động chạy mỗi khi có push lên branch `main`
- Build artifacts sẽ được lưu trong thư mục `dist`
- Chỉ có một deployment chạy cùng lúc (concurrency control)
