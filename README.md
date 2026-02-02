# 📊 Mini ERP Accounting System (MERN Stack)

A full-featured ERP-style accounting system built with the MERN stack, focused on invoice-based financial management, secure authentication, real-time analytics, and business insights.

This project simulates real-world SaaS accounting software used by small and medium businesses.

---

## 🚀 Features

### 🔐 Authentication System
- Email registration with OTP verification
- Secure login using JWT stored in HTTP-only cookies
- Auto login with `/me` endpoint
- Logout
- Forgot password & reset password via email
- OTP expiration & security handling

---

### 🧾 Invoice Management (Core ERP Logic)
- Dynamic invoice items (name, price, quantity)
- Automatic subtotal & total calculations
- Partial payment support
- Remaining balance tracking
- Payment methods:
  - Cash
  - Visa
  - Bank Transfer
- Invoice status auto detection:
  - Paid
  - Partial
  - Unpaid
- Client phone tracking
- Unique invoice number generation
- Create / Update / Delete invoices

---

### 🔍 Advanced Filters & Search
- Pagination
- Filter by:
  - Status
  - Payment method
  - Client phone
  - Invoice number
- Sorting:
  - Newest first
  - Oldest first
- Date range filters:
  - Today
  - This week
  - This month
  - Last month
  - Last 3 months

---

### 📊 Dashboard & Analytics
- Total invoices count
- Paid / partial / unpaid statistics
- Total income
- Remaining unpaid balance
- Line charts:
  - Invoice count over time
  - Income over time
- Product analytics:
  - Total quantity sold per product
  - Revenue per product

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (email OTP & reset)
- bcrypt (password hashing)

### Frontend (planned / optional)
- React
- Charts (Recharts / Chart.js)
- PDF invoice generation

---

## 📂 Project Structure

src/<br>
┣ config/<br>
┃ ┗ db.js<br>
┣ models/<br>
┃ ┣ User.js<br>
┃ ┣ Otp.js<br>
┃ ┗ Invoice.js<br>
┣ controllers/<br>
┃ ┣ authController.js<br>
┃ ┣ invoiceController.js<br>
┃ ┗ dashboardController.js<br>
┣ routes/<br>
┃ ┣ authRoutes.js<br>
┃ ┣ invoiceRoutes.js<br>
┃ ┗ dashboardRoutes.js<br>
┣ middleware/<br>
┃ ┗ authMiddleware.js<br>
┗ server.js<br>


---

## ⚙️ Environment Variables

Create a `.env` file in the root:


NODE_ENV=development

PORT=5000
MONGO_URI=mongodb+srv://faresdevm_db_user:zpt1fOKESXnsHcv3@erb-system.ukdzeyo.mongodb.net/?appName=erb-system
JWT_SECRET=8f3b2a91c7e44c58b8a0e2f9a7d6c4b1e0f9a2d3c6b7e8a4f5d9c1a2b3e4f6
EMAIL_USER=fares.dev.m@gmail.com
EMAIL_PASS=lbmj jrky tkgy twnw
CLIENT_URL=http://localhost:3000

## Auth

| Method | Endpoint | Description |
|------|---------|------------|
| POST | /api/auth/register | Send OTP to email |
| POST | /api/auth/verify-otp | Verify OTP & create account |
| POST | /api/auth/login | Login user |
| GET  | /api/auth/me | Auto login (get current user) |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/forget-password | Send reset password link |
| POST | /api/auth/reset-password/:token | Reset password |


## Invoice

| Method | Endpoint | Description |
|------|---------|------------|
| POST | /api/invoices | Create new invoice |
| GET | /api/invoices | Get invoices with filters |
| PUT | /api/invoices/:id | Update invoice |
| DELETE | /api/invoices/:id | Delete invoice |


## Dashboard Stats

| Method | Endpoint | Description |
|-------|---------|------------|
| GET | /api/dashboard/stats | System statistics |
| GET | /api/dashboard/charts | Line chart data |
| GET | /api/dashboard/products | Product analytics |


