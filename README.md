# 💰 Finance Dashboard Backend

A scalable and well-structured backend system for managing financial records, user roles, and dashboard analytics.
This project demonstrates clean architecture, role-based access control, and efficient data aggregation using modern backend technologies.

---

# 🚀 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT (JSON Web Tokens)
* **Language:** JavaScript

---

# 🧠 Architecture Overview

The project follows a **layered architecture** to ensure maintainability and separation of concerns:

```
Route → Controller → Service → Database (Prisma)
```

### Folder Structure

```
src/
 ├── controllers/     # Handles request/response
 ├── services/        # Business logic
 ├── routes/          # API routes
 ├── middleware/      # Auth, RBAC, validation, error handling
 ├── prisma/          # Prisma schema
 ├── config/          # Environment & configs
 ├── utils/           # Helper functions
 ├── app.js
 └── server.js
```

---

# 🔐 Authentication & Authorization

### Authentication

* JWT-based authentication
* Passwords are securely hashed using bcrypt
* Token includes user ID and role

### Role-Based Access Control (RBAC)

| Role    | Permissions                          |
| ------- | ------------------------------------ |
| VIEWER  | View dashboard only                  |
| ANALYST | View financial records + dashboard   |
| ADMIN   | Full access (CRUD + user management) |

Authorization is enforced using middleware:

```
authMiddleware → roleMiddleware → controller
```

---

# 🧾 Data Models

### User

* id (UUID)
* email (unique)
* password (hashed)
* role (ADMIN, ANALYST, VIEWER)
* status (ACTIVE, INACTIVE)
* createdAt

---

### FinancialRecord

* id (UUID)
* userId (relation to User)
* amount (positive number)
* type (INCOME, EXPENSE)
* category (string)
* date (timestamp)
* notes (optional)
* createdAt

---

# 📡 API Endpoints

## 🔑 Auth APIs

* `POST /auth/signup` → Register user
* `POST /auth/login` → Login and get JWT
* `GET /users/me` → Get current user

---

## 💳 Transaction APIs

* `POST /transactions` → Create record *(ADMIN only)*
* `GET /transactions` → Get records *(ANALYST, ADMIN)*
* `GET /transactions/:id` → Get single record
* `PUT /transactions/:id` → Update record *(ADMIN only)*
* `DELETE /transactions/:id` → Delete record *(ADMIN only)*

### Filtering & Pagination

```
GET /transactions?type=EXPENSE&category=food&startDate=...&endDate=...&page=1&limit=10
```

---

## 📊 Dashboard APIs

### Summary

```
GET /dashboard/summary
```

Returns:

* Total Income
* Total Expense
* Net Balance

---

### Category Breakdown

```
GET /dashboard/category-breakdown
```

---

### Trends

```
GET /dashboard/trends?period=monthly
```

---

### Recent Activity

```
GET /dashboard/recent
```

---

# 📊 Aggregation Logic

Efficient queries are used for analytics:

* `SUM(amount)` for totals
* `GROUP BY category` for breakdown
* `GROUP BY month` for trends

This avoids unnecessary in-memory computations and improves performance.

---

# ✅ Validation & Error Handling

### Validation

* Input validation for all APIs
* Ensures:

  * Amount is positive
  * Valid enum values
  * Proper date format

### Error Handling

* Centralized error middleware
* Consistent response format:

```
{
  "error": "Validation error",
  "details": ["Amount must be positive"]
}
```

---

# ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone <your-repo-link>
cd finance-dashboard-backend
```

### 2. Install Dependencies

```
npm install
```

### 3. Setup Environment Variables

Create `.env` file:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your_secret_key"
PORT=5000
```

---

### 4. Prisma Setup

```
npx prisma generate
npx prisma migrate dev --name init
```

---

### 5. Run Server

```
npm run dev
```

---

# 🧪 Sample API Usage

### Signup

```
POST /auth/signup
{
  "email": "test@example.com",
  "password": "123456",
  "role": "ADMIN"
}
```

---

### Create Transaction

```
POST /transactions
Authorization: Bearer <token>

{
  "amount": 500,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2026-04-01",
  "notes": "Dinner"
}
```

---

# 🔍 Assumptions Made

* Each financial record belongs to a single user
* Categories are stored as simple strings for simplicity
* JWT-based authentication is sufficient for this scope
* Role-based permissions are predefined and static

---

# 🚀 Possible Improvements

* Category normalization (separate table)
* Soft delete for transactions
* Rate limiting
* Unit & integration tests
* Swagger API documentation
* Caching for dashboard APIs

---

# 🎯 Key Highlights

* Clean and modular architecture
* Strong role-based access control
* Efficient database queries for analytics
* Scalable and maintainable design

---

# 📌 Conclusion

This backend system is designed to be:

* Simple yet extensible
* Efficient for financial data processing
* Easy to integrate with a frontend dashboard

It demonstrates practical backend engineering skills including API design, data modeling, access control, and system organization.

---
