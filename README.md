# City of Mutare Digital Billing & Citizen Portal

A production-quality MVP for the City of Mutare, built with React, Node.js, and PostgreSQL.

## 🚀 Overview

The system provides a seamless interface for residents to manage their municipal accounts and a powerful dashboard for administrators to oversee city operations.

### Key Features
- **Resident Portal**: Secure login, property management, bill tracking, online payments (mock), and service request reporting with photo support.
- **Admin Dashboard**: Real-time revenue analytics, user/property management, automated monthly billing, and service request queue.
- **Billing Engine**: Automated cron job that generates monthly bills based on configurable tariffs.
- **Clean Architecture**: Modular structure with separate concerns (routes, controllers, services, middlewares).
- **Security**: JWT authentication, hashed passwords (bcrypt), and role-based access control.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Environment**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Cron**: Node-Cron
- **Validation**: Zod

## 📋 Database Schema

- **User**: Resident accounts.
- **Property**: Municipal stands/properties.
- **Bill**: Monthly invoices.
- **Payment**: Transaction history.
- **ServiceRequest**: Reported issues (e.g., water leaks).
- **Tariff**: Service rates (Water, Refuse, etc.).
- **Admin**: Administrative staff accounts.

## 🛡️ Service Request Categories
Residents can report:
- 💧 Water Leak
- 🚽 Sewer Blockage
- 🚮 Missed Refuse
- 💡 Streetlight Fault
- 💵 Billing Query

---

*Built for the people of Mutare.*
