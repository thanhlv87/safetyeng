# Firebase Setup for Google Authentication

## ⚠️ QUAN TRỌNG: Authorize Vercel Domain

Để Google Sign-In hoạt động trên Vercel, bạn PHẢI thêm domain Vercel vào Firebase authorized domains.

### Bước 1: Lấy URL Vercel của bạn

Sau khi deploy lên Vercel, bạn sẽ có URL dạng:
- `https://your-project.vercel.app`
- Hoặc custom domain của bạn

### Bước 2: Thêm Domain vào Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: **safety-eng**
3. Vào **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Thêm domain Vercel của bạn (ví dụ: `your-project.vercel.app`)
6. Click **Add**

### Bước 3: Kiểm tra danh sách Authorized domains

Đảm bảo danh sách bao gồm:
- ✅ `localhost` (để test local)
- ✅ `safety-eng.firebaseapp.com` (Firebase default)
- ✅ `your-project.vercel.app` (Vercel production)
- ✅ `*.vercel.app` (Vercel preview deployments - optional)

## Test Authentication

1. Deploy lên Vercel
2. Truy cập URL: `https://your-project.vercel.app`
3. Click "Sign in with Google"
4. Nếu thấy lỗi **"This app is not authorized..."**, kiểm tra lại authorized domains

## Troubleshooting

### Lỗi: "Cross-Origin-Opener-Policy would block the window.closed call"
✅ **Đã fix** - Vercel headers đã được cấu hình trong `vercel.json`

### Lỗi: "This app is not authorized to use Firebase Authentication"
❌ **Cần fix** - Thêm domain Vercel vào Firebase authorized domains (theo hướng dẫn trên)

### Lỗi: "auth/unauthorized-domain"
❌ **Cần fix** - Domain chưa được authorize trong Firebase Console

## Environment Variables trên Vercel

Đảm bảo đã thêm tất cả biến môi trường trong Vercel Dashboard:

```
VITE_FIREBASE_API_KEY=AIzaSyCyaykbJsyKg7G1tWA8CqIa6_auQlSNG18
VITE_FIREBASE_AUTH_DOMAIN=safety-eng.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=safety-eng
VITE_FIREBASE_STORAGE_BUCKET=safety-eng.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=578945090646
VITE_FIREBASE_APP_ID=1:578945090646:web:d38806477c189921eae7f7
VITE_FIREBASE_MEASUREMENT_ID=G-R8PQVW0TQT
```

## Redeploy sau khi thêm Domain

Sau khi thêm domain vào Firebase, **không cần** redeploy. Thay đổi có hiệu lực ngay lập tức.
