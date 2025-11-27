# 🚀 Hướng dẫn Deploy SafetySpeak lên Vercel

## ✅ Đã hoàn thành (Code đã được push)

- ✅ Di chuyển Firebase API keys vào environment variables
- ✅ Sửa lỗi CORS cho Google Sign-In
- ✅ Cài đặt Tailwind CSS đúng cách (không dùng CDN)
- ✅ Cấu hình Vercel với `vercel.json`
- ✅ Build thành công trên local

## 📋 Các bước Deploy

### Bước 1: Deploy lên Vercel

#### Option A: Vercel Dashboard (Khuyến nghị)

1. Truy cập https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Chọn **"Import Git Repository"**
4. Tìm và chọn repository: `thanhlv87/safetyeng`
5. Vercel sẽ tự động detect framework là **Vite**
6. **KHÔNG** click Deploy ngay - Chuyển sang Bước 2

### Bước 2: Thêm Environment Variables

1. Trong màn hình Import project, click **"Environment Variables"**
2. Thêm từng biến sau (chọn **Production, Preview, Development** cho mỗi biến):

```
VITE_FIREBASE_API_KEY
AIzaSyCyaykbJsyKg7G1tWA8CqIa6_auQlSNG18

VITE_FIREBASE_AUTH_DOMAIN
safety-eng.firebaseapp.com

VITE_FIREBASE_PROJECT_ID
safety-eng

VITE_FIREBASE_STORAGE_BUCKET
safety-eng.firebasestorage.app

VITE_FIREBASE_MESSAGING_SENDER_ID
578945090646

VITE_FIREBASE_APP_ID
1:578945090646:web:d38806477c189921eae7f7

VITE_FIREBASE_MEASUREMENT_ID
G-R8PQVW0TQT
```

3. Click **"Deploy"**

### Bước 3: Lấy URL Vercel

Sau khi deploy xong (khoảng 2-3 phút), bạn sẽ nhận được URL:
- Format: `https://safetyeng.vercel.app` hoặc `https://safetyeng-[random].vercel.app`
- Copy URL này

### Bước 4: ⚠️ QUAN TRỌNG - Authorize Domain trong Firebase

**Nếu bỏ qua bước này, Google Sign-In sẽ KHÔNG hoạt động!**

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: **safety-eng**
3. Vào **Authentication** (menu bên trái)
4. Click tab **Settings**
5. Scroll xuống phần **"Authorized domains"**
6. Click **"Add domain"**
7. Paste URL Vercel của bạn (VD: `safetyeng.vercel.app`) - **KHÔNG** bao gồm `https://`
8. Click **"Add"**

### Bước 5: Test ứng dụng

1. Mở URL Vercel trong trình duyệt
2. Click **"Sign in with Google"**
3. Nếu thành công → ✅ Hoàn tất!
4. Nếu gặp lỗi → Xem phần Troubleshooting bên dưới

## 🐛 Troubleshooting

### Lỗi 1: "This app is not authorized to use Firebase Authentication"
**Nguyên nhân**: Domain Vercel chưa được thêm vào Firebase authorized domains

**Giải pháp**:
1. Kiểm tra lại Bước 4
2. Đảm bảo domain **KHÔNG** có `https://` phía trước
3. Đợi 1-2 phút sau khi thêm domain, sau đó thử lại

### Lỗi 2: "auth/unauthorized-domain"
**Nguyên nhân**: Tương tự lỗi 1

**Giải pháp**: Làm theo Bước 4 ở trên

### Lỗi 3: "Cross-Origin-Opener-Policy would block..."
**Nguyên nhân**: Đã được fix trong code (vercel.json)

**Giải pháp**:
1. Đảm bảo bạn đã pull code mới nhất
2. Redeploy trên Vercel (Deployments → ... → Redeploy)

### Lỗi 4: Environment variables không load
**Nguyên nhân**: Chưa thêm env variables trong Vercel

**Giải pháp**:
1. Vào Vercel project → Settings → Environment Variables
2. Thêm tất cả biến từ Bước 2
3. Redeploy

### Lỗi 5: Trang trắng / blank screen
**Nguyên nhân**:
- Environment variables bị thiếu
- Hoặc lỗi JavaScript

**Giải pháp**:
1. Mở DevTools (F12) → Console tab
2. Xem error message cụ thể
3. Kiểm tra Network tab xem có file nào 404 không

## 📱 Custom Domain (Optional)

Nếu muốn dùng domain riêng (VD: safetyspeak.com):

1. Vào Vercel project → Settings → Domains
2. Thêm custom domain
3. Cập nhật DNS records theo hướng dẫn của Vercel
4. **QUAN TRỌNG**: Thêm custom domain vào Firebase authorized domains (Bước 4)

## 🔄 Auto-deployment

Mỗi khi bạn push code lên GitHub branch `main`, Vercel sẽ tự động:
1. Detect thay đổi
2. Build lại ứng dụng
3. Deploy lên production

Không cần làm gì thêm!

## 📊 Monitoring

Xem logs và analytics:
- Vercel Dashboard → Your Project → Deployments
- Click vào deployment bất kỳ để xem logs chi tiết
- Tab "Analytics" để xem traffic

## 🎉 Hoàn tất!

Nếu mọi thứ hoạt động:
- ✅ Người dùng có thể đăng nhập bằng Google
- ✅ Dữ liệu được lưu vào Firebase Firestore
- ✅ Ứng dụng chạy nhanh và ổn định

**Next steps**:
- Share URL với users
- Monitor Firebase usage quota
- Setup custom domain (optional)
