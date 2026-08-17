# 🛍️ ShopSphere — Modern E-Commerce Frontend

A modern, high-performance, and feature-packed e-commerce web application built with **React 19, TypeScript, Redux Toolkit, Tailwind CSS v4, and Framer Motion**.

---

## ✨ Features & User Experience

- 💎 **Modern UI/UX Design**: Clean glassmorphism, responsive navigation drawer, dark/light theme toggle, and smooth micro-interactions.
- 🔍 **Live Fuzzy Search (Fuse.js)**: Instant keyboard-driven global search modal with fuzzy matching across product names, categories, and descriptions.
- 💖 **Persistent Wishlist**: Save favorite items with one-click "Move to Cart" and local storage synchronization.
- 🎯 **Advanced Catalog & Filters**: Multi-category pills, dynamic price slider, minimum rating selector, and sorting (Price, Newest, Ratings).
- 🏷️ **Promo Code Simulator**: Apply discount coupons (`SHOPSHERE10` for 10% off) with live price recalculation.
- 💳 **Dual Checkout Experience**:
  - **Instant Demo Checkout / COD**: Fast end-to-end checkout with atomic stock adjustment and order receipt generation.
  - **Razorpay Integration**: Real-time payment modal with automated verification.
- 📦 **Order Tracking & Invoice Viewer**: Visual 4-step delivery progress stepper (`Placed` -> `Paid` -> `In Transit` -> `Delivered`), order cancellation, and printable invoice receipts.
- 🤖 **AI Shopping Assistant**: Floating AI chatbot with quick prompt suggestions for deals, return policies, and order tracking.
- 🛠️ **Full Admin Suite**: Metrics dashboard (Total Revenue, Orders, Products, Users), live inventory management, and order status transitions.

---

## 🛠️ Tech Stack

- **Framework**: React 19 & Vite 7
- **Language**: TypeScript 5.8
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: Tailwind CSS v4, tw-animate-css, Radix UI Primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **Search**: Fuse.js (Fuzzy client-side search)
- **Toasts**: Sonner

---

## 🧑‍💻 Quickstart Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` in the root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start Development Server
```bash
npm run dev
```
Client runs at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shopshere.com` | `Admin@12345` |
| **Customer** | `user@shopshere.com` | `User@12345` |

---

## 🧩 License
MIT License.
