# 🐛 Debug Authentication Issues

## Vấn đề: Đã đăng nhập Google nhưng app vẫn hiển thị màn hình login

### 📋 Các bước debug:

## Bước 1: Kiểm tra Console Logs

1. Mở trang web trên Vercel
2. Nhấn **F12** → Tab **Console**
3. Click "Sign in with Google"
4. Quan sát các log sau:

### ✅ Flow thành công:
```
Checking for redirect result...
Getting redirect result...
No redirect result (normal page load)
Auth state changed: logged out
[Redirect sang Google...]
[Redirect về app]
Checking for redirect result...
Getting redirect result...
✅ Signed in via redirect: your-email@gmail.com
Auth state changed: logged in
```

### ❌ Nếu thấy lỗi:

#### Lỗi 1: "auth/unauthorized-domain"
```
❌ Redirect result error: auth/unauthorized-domain ...
```
**Nguyên nhân**: Domain Vercel chưa được thêm vào Firebase

**Giải pháp**:
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Project: **safety-eng**
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Thêm domain Vercel (VD: `safetyeng.vercel.app`) - KHÔNG có `https://`
6. Click **"Add"**
7. Thử lại

#### Lỗi 2: "Missing or insufficient permissions"
```
❌ FirebaseError: Missing or insufficient permissions
```
**Nguyên nhân**: Firestore Security Rules chưa được deploy

**Giải pháp**: Xem [FIRESTORE_RULES_SETUP.md](FIRESTORE_RULES_SETUP.md)

#### Lỗi 3: "No redirect result" nhưng không có "Auth state changed"
```
Checking for redirect result...
Getting redirect result...
No redirect result (normal page load)
```
Sau đó... không có gì

**Nguyên nhân**: `subscribeToAuth` không được gọi hoặc Firebase không initialize đúng

**Giải pháp**:
1. Kiểm tra Network tab xem có error khi load Firebase không
2. Kiểm tra Console có error về env variables không

## Bước 2: Kiểm tra Environment Variables

Đảm bảo tất cả biến môi trường đã được thêm vào Vercel:

1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Kiểm tra có đủ 7 biến:
   - ✅ `VITE_FIREBASE_API_KEY`
   - ✅ `VITE_FIREBASE_AUTH_DOMAIN`
   - ✅ `VITE_FIREBASE_PROJECT_ID`
   - ✅ `VITE_FIREBASE_STORAGE_BUCKET`
   - ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - ✅ `VITE_FIREBASE_APP_ID`
   - ✅ `VITE_FIREBASE_MEASUREMENT_ID`

3. Nếu thiếu → Thêm vào
4. Sau khi thêm → **Redeploy** project (Deployments → ... → Redeploy)

## Bước 3: Kiểm tra Network Tab

1. F12 → Tab **Network**
2. Filter: `firestore` hoặc `firebase`
3. Click "Sign in with Google"
4. Xem các request:

### ✅ Request thành công:
- Status: **200 OK** hoặc **204 No Content**
- Nhiều request đến `firebaseapp.com`, `googleapis.com`

### ❌ Nếu thấy lỗi:
- **401 Unauthorized**: API key sai hoặc không được set
- **403 Forbidden**: Domain chưa authorize
- **404 Not Found**: Project ID sai
- **CORS error**: Firestore rules chưa đúng

## Bước 4: Kiểm tra Application Storage

1. F12 → Tab **Application** (Chrome) hoặc **Storage** (Firefox)
2. Mở **Local Storage** → URL của bạn
3. Tìm key có prefix `firebase:authUser`

### ✅ Nếu có:
- User đã đăng nhập vào Firebase
- Vấn đề là app không nhận được state update

### ❌ Nếu không có:
- User chưa đăng nhập thành công
- Quay lại Bước 1 kiểm tra lỗi

## Bước 5: Test trên Incognito/Private Mode

1. Mở **Incognito Window** (Ctrl+Shift+N)
2. Vào URL Vercel
3. Sign in with Google
4. Xem có khác biệt không

**Lý do**: Cache hoặc stale auth state có thể gây vấn đề

## Bước 6: Kiểm tra Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Project: **safety-eng**
3. **Authentication** → **Users** tab
4. Xem có user mới được tạo sau khi sign in không

### ✅ Nếu có user:
- Google Sign-In thành công
- Vấn đề là app không nhận được hoặc không lưu data

### ❌ Nếu không có user:
- Sign-In thất bại hoàn toàn
- Kiểm tra lại Authorized Domains

## Các lỗi thường gặp và cách fix:

### "Redirect loop" - Trang cứ reload mãi
**Nguyên nhân**: `handleRedirectResult` gọi lại `signInWithRedirect`

**Giải pháp**: Không nên có. Kiểm tra code không gọi `loginWithGoogle()` tự động.

### User hiển thị trong Firebase Console nhưng app vẫn stuck
**Nguyên nhân**: Firestore rules chặn việc tạo user document

**Giải pháp**:
1. Deploy Firestore rules (xem [FIRESTORE_RULES_SETUP.md](FIRESTORE_RULES_SETUP.md))
2. Hoặc check Console logs xem có error "Missing or insufficient permissions"

### "Loading..." spinner không biến mất
**Nguyên nhân**: `setLoading(false)` không được gọi

**Giải pháp**:
1. Check Console xem có error không
2. Đảm bảo `subscribeToAuth` callback được gọi (xem log "Auth state changed")

## Test cuối cùng:

Nếu tất cả đều pass, test flow hoàn chỉnh:

1. ✅ Click "Sign in with Google"
2. ✅ Redirect sang Google
3. ✅ Chọn tài khoản
4. ✅ Redirect về app
5. ✅ Console log: "✅ Signed in via redirect: email@gmail.com"
6. ✅ Console log: "Auth state changed: logged in"
7. ✅ Hiển thị Profile Setup form
8. ✅ Điền Job Title & Company
9. ✅ Click "Save & Continue"
10. ✅ Chuyển sang Dashboard

Nếu vẫn không work → Report issue với screenshot của Console logs!
