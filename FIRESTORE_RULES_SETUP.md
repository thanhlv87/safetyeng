# 🔥 Firestore Security Rules Setup

## ⚠️ Lỗi: "Missing or insufficient permissions"

Lỗi này xảy ra vì Firestore Security Rules đang chặn quyền truy cập. Bạn cần cập nhật rules trong Firebase Console.

## 📋 Các bước sửa lỗi:

### Bước 1: Truy cập Firebase Console

1. Vào https://console.firebase.google.com/
2. Chọn project: **safety-eng**
3. Click **Firestore Database** (menu bên trái)
4. Click tab **Rules** (ở trên cùng)

### Bước 2: Cập nhật Security Rules

Xóa toàn bộ nội dung hiện tại và paste đoạn code sau:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - chỉ user đã đăng nhập mới đọc/ghi được data của chính họ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Lessons collection - tất cả user đã đăng nhập đều có thể đọc và ghi (để seed lessons)
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Bước 3: Publish Rules

1. Click nút **"Publish"** (màu xanh, góc trên bên phải)
2. Đợi vài giây để rules được deploy

### Bước 4: Test lại ứng dụng

1. Refresh trang Vercel
2. Đăng nhập lại bằng Google
3. Lỗi sẽ biến mất ✅

## 🔒 Giải thích Security Rules

### Users Collection
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
- **Chỉ user đã đăng nhập** mới được phép truy cập
- **Mỗi user chỉ đọc/ghi data của chính họ**
- Ngăn user A đọc/sửa data của user B

### Lessons Collection
```javascript
match /lessons/{lessonId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```
- **Tất cả user đã đăng nhập** đều đọc được lessons
- **Auto-seeding**: Khi user truy cập lesson chưa có trong DB, app tự động tạo (write)
- Lessons là public data cho tất cả users

## ⚠️ Lưu ý Bảo mật

### ❌ KHÔNG sử dụng rule này (không an toàn):
```javascript
allow read, write: if true; // Ai cũng đọc/ghi được - NGUY HIỂM!
```

### ❌ KHÔNG sử dụng rule test mode:
```javascript
allow read, write: if request.time < timestamp.date(2024, 12, 31);
```
Rule này sẽ hết hạn và app ngừng hoạt động!

### ✅ Rule hiện tại là an toàn:
- Yêu cầu authentication
- User chỉ truy cập data của chính họ
- Lessons được protect bằng authentication

## 🐛 Troubleshooting

### Lỗi: "Rules published successfully" nhưng vẫn báo lỗi permission
**Giải pháp**:
1. Đợi 1-2 phút (rules cần thời gian propagate)
2. Clear browser cache và refresh
3. Đăng xuất và đăng nhập lại

### Lỗi: "Simulator error" khi test rules
**Giải pháp**: Ignore - test trực tiếp trên app thực

### Lỗi: "FirebaseError: PERMISSION_DENIED"
**Nguyên nhân**: User chưa đăng nhập hoặc token hết hạn

**Giải pháp**: Đăng xuất và đăng nhập lại

## 📊 Kiểm tra Rules đang active

1. Vào Firestore → Rules tab
2. Xem phần "Published rules"
3. Đảm bảo có `match /users/{userId}` và `match /lessons/{lessonId}`

## 🎯 Test Rules (Optional)

Firebase có Rules Simulator:

1. Vào Firestore → Rules tab
2. Click "Rules Playground" (góc phải)
3. Test với:
   - **Location**: `databases/(default)/documents/users/test123`
   - **Request type**: `get`
   - **Authentication**: Enabled, uid = `test123`
   - Click "Run" → Kết quả: **Allowed** ✅

## ✅ Hoàn tất

Sau khi publish rules, app sẽ hoạt động bình thường:
- ✅ User có thể đăng nhập
- ✅ Profile được lưu vào Firestore
- ✅ Lessons được load/seed tự động
- ✅ Progress được track
