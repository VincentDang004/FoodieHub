# TFOOD - Ứng Dụng Đặt Đồ Ăn

## Giới Thiệu

TFOOD là ứng dụng web cho phép người dùng đặt hàng đồ ăn trực tuyến. Ứng dụng bao gồm một backend API được xây dựng với Express.js và một frontend được xây dựng với React.

## Cấu Trúc Dự Án

```
NNPTUDM/
├── backend/          # API Server (Express.js + MySQL)
│   ├── src/
│   │   ├── app.js
│   │   ├── config/    # Cấu hình database
│   │   ├── controllers/   # Logic xử lý requests
│   │   ├── middleware/    # Authentication middleware
│   │   ├── routes/    # Định tuyến API
│   │   └── uploads/   # Thư mục lưu file upload
│   └── package.json
└── frontend/         # React Application
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── package.json
```

## Yêu Cầu

- **Node.js** (phiên bản 14+)
- **npm** hoặc **yarn**
- **MySQL** (chạy qua Laragon)
- **Apache** (chạy qua Laragon)

## Hướng Dẫn Cài Đặt

### 1. Cài Đặt Database

- Mở **Laragon**
- Khởi động **MySQL** từ Laragon
- Tạo database theo cấu hình ở `backend/src/config/db.js`

### 2. Cài Đặt Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## Hướng Dẫn Chạy Ứng Dụng

### 1. Khởi Động Database (Laragon)

- Mở **Laragon**
- Bật **MySQL**
- Bật **Apache** (nếu cần)

### 2. Khởi Động Backend API

```bash
cd backend
npm start
```


### 3. Khởi Động Frontend

Mở terminal khác:

```bash
cd frontend
npm start
```


## Công Nghệ Sử Dụng

### Backend
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcrypt** - Mã hóa mật khẩu
- **jsonwebtoken** - Authentication token
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Auto reload

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Scripts** - Build tools

## Ghi Chú

- Đảm bảo MySQL đang chạy trước khi khởi động backend
- Backend và frontend chạy trên các port khác nhau
- Sử dụng Laragon để quản lý Apache và MySQL dễ dàng hơn
