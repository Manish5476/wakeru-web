# TripSplit / Wakeru — Next.js Web Application

The official web companion application for **TripSplit / Wakeru**, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and strict TypeScript. This application delivers complete functional and design parity with the React Native mobile client (`TripSplit/` and `TripSplitNative/`), powered by the production backend at `https://wakeru.onrender.com/api/v1`.

---

## 🌟 Key Features

### 1. Unified Traveler Dashboard (`/dashboard`)
- Financial overview KPI cards (Net Balance, Gross Owe, Gross Owed, Active Trips).
- Quick Action modals (Create Trip, Add Expense, Scan Receipt, Settle Up).
- Active trips portfolio with live budget consumption meters.
- Real-time recent activity stream and outstanding counterparty balance shortcuts.

### 2. Comprehensive Trip Hub (`/trips` & `/trips/[id]`)
- Multi-tab trip workspace:
  - **Overview**: Budget health, daily breakdown, and multi-currency exchange rates.
  - **Expenses**: Searchable expense ledger with category filtering and CSV export.
  - **Settlements**: Greedy Min-Cash-Flow Debt Simplification engine.
  - **Itinerary**: Day-by-day travel schedule and collaborative packing checklist.
  - **Companions**: Member management, permissions (Owner, Editor, Viewer), and invite codes.

### 3. Expense Ledger & Split Engine (`/expenses`)
- Real-time search across expenses, categories, and counterparties.
- 4 supported split models: **Equal**, **Exact Amount**, **Percentage**, and **Shares**.
- Integrated Receipt OCR Scanner (`/expenses/receipt-scanner`) with automatic line-item parsing.

### 4. Personal Finance OS (`/finance`)
- **Cash Flow Overview**: Inflows vs outflows visualizer with month-over-month delta.
- **Transactions Ledger**: Searchable personal financial transactions.
- **Category Budgets**: Dynamic progress bars with threshold alerts (Healthy, 80% Warning, 100% Exceeded).
- **Personal Lending & IOUs**: Track peer-to-peer debts outside of group trips.
- **Scheduled Bills**: Manage recurring subscriptions and utility obligations.

### 5. Cross-Trip Balances & Settlements (`/balances`)
- Aggregated net balances across all trips and counterparties.
- **Native UPI Settle-Up**: Generates standard `upi://pay` deep links and QR codes for one-tap payments in Google Pay, PhonePe, and Paytm.

### 6. Social & Community (`/friends`)
- Friend directory, pending requests, and live user search (`/friends/search`).

### 7. Activity & Notifications (`/notifications`)
- Live top-bar unread badge dynamically refreshed from `/notifications/unread-count`.
- Filter by category, mark individual or all items as read, and delete notifications.

### 8. Account & Security (`/profile` & `/profile/sessions`)
- Profile details, avatar picture upload (`/users/profile-picture`), and UPI VPA configuration.
- Active device session monitor with remote token revocation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher

### Installation & Environment Setup
1. Clone the repository and navigate to `wakeru-web`:
   ```bash
   cd wakeru-web
   ```
2. Configure environment variables by copying the example:
   ```bash
   cp .env.example .env.local
   ```
   *By default, `.env.example` points to the live Render backend at `https://wakeru.onrender.com/api/v1`.*

3. Install dependencies (already resolved in workspace):
   ```bash
   npm install
   ```

### Running the App
- **Development Server:**
  ```bash
  npm run dev
  ```
  Visit `http://localhost:3000` in your browser.

- **Run Automated Tests:**
  ```bash
  npm test
  ```
  Executes unit and backend integration tests validating split math, debts, envelopes, and live API connectivity.

- **Type Check:**
  ```bash
  npx tsc --noEmit
  ```

- **Production Build:**
  ```bash
  npm run build
  npm start
  ```

---

## 🏛️ Architecture Overview

- **App Router (`src/app`)**: Route groups for authenticated travelers `(traveler)` and public auth pages (`login`, `register`, `forgot-password`).
- **API Services Layer (`src/api`)**: Strongly typed clients (`tripsApi`, `expensesApi`, `financeApi`, `ledgerApi`, `settlementsApi`, `friendsApi`, `notificationsApi`) with automatic `Authorization: Bearer` token injection and UUID `Idempotency-Key` headers on mutations.
- **Auth Context (`src/features/auth/AuthContext.tsx`)**: Lightweight Firebase Identity Toolkit REST integration requiring zero external heavy SDKs, with persistent token storage and quick developer role switching.
- **Design System (`src/design-system`)**: Reusable UI components (Button, Card, Input, Modal, Badge, Dropdown, Table, Spinner, Toast) styled with modern Tailwind CSS v4 utility classes.

---

## 📚 Migration Documentation

For exhaustive architectural audits, API matrices, and implementation details:
- [Repository Audit](../docs/web-migration/REPOSITORY_AUDIT.md)
- [API Integration Matrix](../docs/web-migration/API_INTEGRATION_MATRIX.md)
- [Feature Parity Matrix](../docs/web-migration/FEATURE_PARITY_MATRIX.md)
- [Implementation Plan](../docs/web-migration/IMPLEMENTATION_PLAN.md)
- [Implementation Report](../docs/web-migration/IMPLEMENTATION_REPORT.md)
