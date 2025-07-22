
## 🛍️ Shopshere Frontend

Welcome to the frontend for **Shopshere** — a modern e-commerce shopping platform built with React, Redux, and Tailwind CSS. It offers users a seamless shopping experience and admins full control over products, orders, and users.

### 🌐 Live Website

* **Frontend**: [https://shopsheretheshoppingzone.onrender.com]
* **Backend**: [https://shopshereb.onrender.com]

---

## ⚙️ Tech Stack

* **React** (w/ Vite)
* **Redux Toolkit**
* **Tailwind CSS**
* **React Router**
* **Razorpay Integration**
* **Google OAuth Login**
* **Cloudinary (for image uploads)**

---

## 📁 Project Structure

```bash
src/
│
├── components/         # Reusable UI components
├── pages/              # Page-level components (Home, ProductDetail, Cart, etc.)
├── redux/              # Redux slices and store
├── types/              # TypeScript interfaces and types
├── assets/             # Static images and assets
└── App.tsx             # Main app and routes
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopshere-frontend.git
cd shopshere-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file in the root and add your backend URL:

```env
VITE_API_BASE_URL=https://shopshereb.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🧪 Features

### 👥 User

* Browse products, search, filter by category
* View detailed product info
* Add to cart and manage items
* Checkout and pay with Razorpay
* View order history
* Update profile and password
* Forgot/reset password

### 🛠️ Admin

* Add/edit/delete products
* View all orders with analytics
* Manage registered users
* Dashboard overview with metrics

---
