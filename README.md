# Unified Business Platform

Beginner-friendly Spring Boot modular monolith with Auth, Tickets, Orders, and Billing.

## Features
- JWT auth with refresh tokens and role-based access control
- Ticket management with comments and assignment
- Staff role can view/manage all tickets, orders, invoices, and customers via a dedicated staff panel
- Orders with products and order items
- Billing with invoices and payments
- Audit logging for key actions

## Tech Stack
- Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- PostgreSQL (default, configurable)
- React + Vite frontend (`frontend` folder)

## Getting Started (Backend)
1. Create a PostgreSQL database `ubp`
2. Update credentials in `src/main/resources/application.yml`
3. Run:
   - `mvn spring-boot:run`

## Getting Started (Frontend)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Default Notes
- Update `app.jwt.secret` with a long random value (32+ chars).
- Roles are auto-created on startup.
- Sample products are seeded on first run.
- Demo users (password `Password123`): `admin@demo.com`, `staff@demo.com`, `customer@demo.com`.
