# AuraWear — Modern Fashion E-Commerce Platform

A production-minded, beginner-friendly full-stack MERN (MongoDB, Express.js, React, Node.js + Tailwind CSS) fashion e-commerce web application inspired by contemporary platforms like Myntra and Zara.

Built with an original brand identity, clean minimalist architecture, cookie-based authentication, server-authoritative pricing and inventory controls, and a dedicated admin operations suite.

---

## Table of Contents
1. [Project Overview & Key Features](#project-overview--key-features)
2. [Tech Stack](#tech-stack)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Security & Authentication Architecture](#security--authentication-architecture)
5. [Environment Variables](#environment-variables)
6. [Local Installation & Setup](#local-installation--setup)
7. [Database Seeding & Test Accounts](#database-seeding--test-accounts)
8. [API Documentation](#api-documentation)
9. [Deployment Readiness & Production Guide](#deployment-readiness--production-guide)
10. [Future Roadmap](#future-roadmap)

---

## Project Overview & Key Features

### 1. Customer Experience
- **Editorial Homepage**: Hero showcase, department highlights (Men, Women, Kids), and popular product grids.
- **Dynamic Catalogue**: Server-side filtering by Department (`Men`, `Women`, `Kids`, `Unisex`), Category (`Topwear`, `Bottomwear`, `Dresses`, `Outerwear`, `Footwear`, `Accessories`), Brand, and Available Sizes (`XS`, `S`, `M`, `L`, `XL`), plus In-Stock toggles.
- **Sorting & Pagination**: Real-time sorting by Price (Low to High / High to Low), Newest Arrivals, Popularity, and Biggest Discounts with server-driven pagination.
- **Keyword Search**: Instant search across product titles, descriptions, categories, and tags.
- **Product Details**: Multi-angle image preview, size and color selectors, real-time stock alert badges, and accordion care guidelines.
- **Persistent Shopping Bag**: Database-backed cart tied to user profile; validates quantities against live inventory stock.
- **Seamless Checkout**: Address collection with one-click autofill from saved profile addresses, Cash on Delivery (COD) payment, and breakdown of subtotal, 5% GST tax, and shipping.
- **Order Tracking**: Visual status tracker (`PLACED` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED` or `CANCELLED`).
- **Order Cancellation**: Eligible orders can be cancelled directly by the customer, automatically returning purchased items to inventory stock.
- **Profile & Address Book**: Save multiple delivery addresses and manage personal account details.

### 2. Admin Operations Suite
- **Metrics Dashboard**: Total gross revenue, order volume, active products, registered customer count, and low-stock alert counters.
- **Inventory & Product CRUD**: Add, edit, inspect, and delete products with image URLs, sizing, colors, pricing, and discount specifications.
- **Order Fulfillment Pipeline**: Filter orders by status and transition tracking states with automatic delivery and payment reconciliation.
- **User Directory**: View registered customer directory and safely manage administrator roles.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS v3, Axios, Lucide React |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), `bcryptjs`, HTTP-Only Cookies, `helmet`, `express-rate-limit`, CORS |

---

## Architecture & Project Structure

```
e commerce/
├── client/                     # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Pagination, etc.
│   │   │   └── product/        # ProductCard, ProductGrid, ProductFilters
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/         # HomePage, ProductsPage, ProductDetailPage, LoginPage, RegisterPage
│   │   │   ├── customer/       # CartPage, CheckoutPage, OrdersPage, OrderDetailPage, ProfilePage
│   │   │   └── admin/          # AdminDashboard, AdminProducts, AdminProductForm, AdminOrders, AdminUsers
│   │   ├── services/           # api.js (Axios instance with withCredentials)
│   │   ├── App.jsx             # React Router route registry
│   │   ├── index.css           # Tailwind directives & modern scrollbars
│   │   └── main.jsx            # React root with providers
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Logout, Profile
│   │   ├── productController.js# Catalogue filtering, search, sorting, admin CRUD
│   │   ├── cartController.js   # Bag item management & price summaries
│   │   ├── orderController.js  # Server-calculated orders & stock decrement
│   │   └── adminController.js  # Analytics, status transitions, user roles
│   ├── middleware/
│   │   ├── authMiddleware.js   # protect & adminOnly middleware
│   │   └── errorMiddleware.js  # Centralized error handler & Mongoose Cast/Duplicate handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt pre-save hashing
│   │   ├── Product.js          # Product schema with calculated finalPrice & text indexes
│   │   ├── Cart.js             # User shopping cart schema
│   │   └── Order.js            # Order snapshots, pricing breakdown, and status history
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── generateToken.js    # JWT generation & HTTP-only cookie setting
│   │   └── seedData.js         # 20+ fashion products & demo accounts seeder
│   ├── testFlows.js            # Automated integration test suite
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express application entrypoint
│
└── README.md
```

---

## Security & Authentication Architecture

1. **No Tokens in localStorage**:
   Authentication tokens are **never** stored in `localStorage` or `sessionStorage` (which are susceptible to XSS). Authentication is handled via secure **HTTP-only Cookies**:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true, // Inaccessible to JavaScript
     secure: process.env.NODE_ENV === 'production',
     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });
   ```

2. **Server-Authoritative Pricing & Stock**:
   The frontend **never** dictates prices, order totals, or stock deductions. When placing an order (`POST /api/orders`), the server queries the database directly, calculates prices and taxes, verifies available stock, decrements inventory, and records fixed historical price snapshots in the order document.

3. **Role-Based Access Control (RBAC)**:
   - `protect` verifies token authenticity and attaches `req.user`.
   - `adminOnly` verifies `req.user.role === 'admin'`. Normal customers attempting to access admin APIs receive an HTTP `403 Forbidden` response.

4. **Resource Isolation**:
   Users can only view and cancel their own orders. Modifying or viewing orders belonging to another account returns an HTTP `403 Forbidden`.

5. **Rate Limiting & Helmet**:
   - `express-rate-limit` protects authentication endpoints (`/api/auth/*`) from credential brute-forcing.
   - `helmet` secures HTTP response headers.

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/aurawear
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended; v22 verified)
- MongoDB Server running locally or a MongoDB Atlas URI

### 1. Clone & Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Ensure MONGO_URI in .env is correct
```

### 2. Seed Database
Populate 20 fashion products, an Admin account, and a Customer account:
```bash
npm run seed
```

### 3. Run Backend Server
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 4. Setup & Run Frontend
In a separate terminal:
```bash
cd client
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

---

## Database Seeding & Test Accounts

The seeder inserts 20 realistic apparel items across Men, Women, Kids, and Accessories with realistic sizes, colors, and prices.

### Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@aurawear.com` | `Admin@12345` | Full access to Admin Console, Products CRUD, Orders & Users |
| **Customer** | `customer@aurawear.com` | `Customer@12345` | Browse catalogue, cart, checkout, orders, profile |

> **Tip**: The login page includes quick **"Demo Customer"** and **"Demo Admin"** one-click buttons for instant portfolio testing!

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Sign in and receive HTTP-only cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Fetch currently authenticated user profile *(Protected)*
- `PUT /api/auth/profile` — Update user profile & saved addresses *(Protected)*

### Products (`/api/products`)
- `GET /api/products` — List products with filters (`gender`, `category`, `brand`, `size`, `inStock`, `search`), sorting (`newest`, `popularity`, `price-asc`, `price-desc`), and pagination
- `GET /api/products/:id` — Get single product details
- `GET /api/products/meta/filters` — Get distinct filter options (categories, brands, genders, sizes)
- `POST /api/products` — Create product *(Admin Only)*
- `PUT /api/products/:id` — Update product & stock *(Admin Only)*
- `DELETE /api/products/:id` — Delete product *(Admin Only)*

### Shopping Bag (`/api/cart`)
- `GET /api/cart` — Fetch user's bag with calculated totals *(Protected)*
- `POST /api/cart` — Add item with size and color *(Protected)*
- `PUT /api/cart/:itemId` — Update quantity *(Protected)*
- `DELETE /api/cart/:itemId` — Remove item *(Protected)*
- `DELETE /api/cart` — Clear bag *(Protected)*

### Orders (`/api/orders`)
- `POST /api/orders` — Place order, decrement stock, snapshot prices *(Protected)*
- `GET /api/orders/my-orders` — Get authenticated user's order history *(Protected)*
- `GET /api/orders/:id` — Get single order details *(Owner or Admin)*
- `PUT /api/orders/:id/cancel` — Cancel order & restore inventory *(Owner or Admin)*

### Admin Operations (`/api/admin`)
- `GET /api/admin/stats` — Revenue, orders, products, customers, low-stock metrics *(Admin Only)*
- `GET /api/admin/orders` — List all orders with status filter *(Admin Only)*
- `PUT /api/admin/orders/:id/status` — Update order status *(Admin Only)*
- `GET /api/admin/users` — List registered users *(Admin Only)*
- `PUT /api/admin/users/:id/role` — Update user role *(Admin Only)*

---

## Automated Verification Suite

An automated end-to-end integration test runner is included in `server/testFlows.js`. To execute:
```bash
cd server
node testFlows.js
```
This tests all 19 major flow criteria (Health check, catalog listing, customer registration, session validation, bag pricing, order creation, inventory decrements, cancellation stock recovery, and RBAC 403 authorization guards).

---

## Deployment Readiness & Production Guide

The application is structured for independent frontend and backend deployment:

### 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow your backend IP in Network Access.
3. Copy the connection string and set `MONGO_URI` in production environment variables.

### 2. Backend: Render / Railway / Fly.io
1. Create a Web Service pointing to the `server/` directory.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<Atlas Connection String>`
   - `JWT_SECRET=<Strong Random Secret>`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`

### 3. Frontend: Vercel / Netlify
1. Connect your GitHub repository to Vercel and select the `client/` root.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variable:
   - `VITE_API_URL=https://your-backend-domain.onrender.com/api`

---

## Future Roadmap
- [ ] Integration of live payment gateway (Razorpay / Stripe) alongside Cash on Delivery
- [ ] Direct Cloudinary image upload widget for the Admin product creation form
- [ ] User product reviews and ratings submission
- [ ] Wishlist / Save for Later functionality
- [ ] Email order confirmation receipts via Nodemailer / SendGrid
