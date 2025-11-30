# Tresse - Premium E-commerce Web App

Tresse is a **PERN (PostgreSQL, Express, React, Node.js) e-commerce web app** specializing in **hair care products**, including hair tools and treatments. Shoppers can browse by **brand** or **category** and enjoy a luxurious, premium shopping experience. While currently focused on hair essentials, the platform will expand to other categories like **skincare, makeup, and wellness** in the future, with **one delivery fee or free shipping** across all products.

Users can log in either via **local authentication** or **Google OAuth**.

---

## Features

**Key features of Tresse:**

```text
- Browse products by brand or category.
- Detailed product pages with variants and stock information.
- User authentication: Local login and Google OAuth.
- Admin panel to manage users and products (backend only for now).
- Order management: View orders, complete purchases, and track order items.
- Shopping cart functionality.
- Premium, luxury-themed UI.
- Future expansion for skincare, makeup, wellness categories.
- One delivery fee or free shipping across products.

```
**Installation & Setup**

## 1. Clone the Repository
**Clone the repository and navigate into it:**
```bash
git clone https://github.com/yourusername/tresse.git
cd tresse

```

## 2. Backend Setup
**Navigate to the backend folder and install dependencies:**
```bash
cd backend
npm install

```

**Set Environment Variables by creating a .env file in the backend folder:**

```env
PORT=9000
DATABASE_URL=your_postgresql_database_url
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

```

## 3. Frontend Setup
**Navigate to the frontend folder and install dependencies:**

```bash
cd ../frontend
npm install

```

**Set Environment Variables by creating a .env file in the frontend folder:**

```env
REACT_APP_API_URL=http://localhost:9000


```

## 4. Running the App

**Start the backend server:**

```bash
cd backend
npm run dev

```

**Start the frontend app:**

```bash
cd ../frontend
npm start

```

## 5. Testing Backend
**Run backend tests using Jest and Supertest:**

```bash
cd backend
npm test

```

## 6. Security & Middleware

**Overview of backend security and middleware:**

- Authentication Middleware (isLoggedIn): Protects routes that require a logged-in user.
- Admin Middleware (isAdmin): Protects routes that require admin access.
- Sensitive backend files like passport.js should remain private and not exposed publicly.
- Backend uses session-based authentication with secure SESSION_SECRET.

## 7. Live Demo
  
- Check out the live app here: [Tresse App](https://tresse.onrender.com)


## 8. Future Plans
**Planned enhancements for Tresse:**

- Expand product catalog to include skincare, makeup, and wellness.
- Integrate one delivery fee or free shipping across all items.
- Add wishlist and product reviews.
- Enhance premium UI experience across all pages.
- Improve payment and order tracking system.

## 9. Contributing
**Steps to contribute to this project:**

1. Fork the repository.
2. Create a new branch:
   git checkout -b feature-name
3. Commit your changes:
   git commit -m "Description"
4. Push to your branch:
   git push origin feature-name
5. Open a Pull Request

## 10. License
**This project is licensed under the MIT License.**

## 11. Contact
**For questions or collaboration, contact:**

leezabethyomi@gmail.com


