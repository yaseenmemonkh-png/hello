# Investment Platform (InvestPro)

## Overview

InvestPro is a full-stack cryptocurrency investment platform featuring weekly (10% ROI) and monthly (50% ROI) investment plans. The platform includes Google/Gmail authentication via Replit Auth, locked investments until plan completion, countdown timers, minimum $100 deposits, and a $5 referral bonus system. Built with a modern TypeScript stack, it features a React frontend with shadcn/ui components and an Express backend connected to a PostgreSQL database via Drizzle ORM.

## Recent Updates (October 2025)

### Deposit Tracking System (October 11, 2025)
- **Plan-Based Deposit Tracking**: All deposits now tracked with plan type and admin destination address
  - Added `planType` field to transactions table (weekly or monthly)
  - Added `depositToAddress` field to transactions table (admin TRC20 destination)
  - Frontend sends selected plan type with deposit requests
  - Backend validates plan type and assigns correct admin address:
    * Weekly deposits → TLYFVE2osiDPDwXrBuziWtkxLCsgfYvppM
    * Monthly deposits → TPkL2MzntUSx4686rDv34eZRYxrRj5NmpG
  - Transaction records include complete audit trail (user source, admin destination, plan type)
- **Enhanced Logging**: Comprehensive logging for deposit and withdrawal tracking
  - [DEPOSIT] logs show user, amount, plan, source/destination addresses, referral code
  - [DEPOSIT COMPLETED] logs show transaction ID and status
  - [DEPOSIT SUMMARY] provides one-line summary for admin review
  - [REFERRAL BONUS] logs detail referral bonus processing
  - [WITHDRAWAL] logs track withdrawal requests with destination addresses

### Latest Fixes (October 10, 2025)
- **TRC20 Address Collection & Deposit Validation**: Users must register their TRC20 wallet address during onboarding
  - Required TRC20 address field added to users table (unique, immutable once set)
  - Onboarding page with Tron address validation (format: T + 33 characters)
  - POST /api/profile/trc20 endpoint enforces one-time address setting
  - Dashboard redirects to /onboarding if TRC20 address not set
  - Plan-specific deposit addresses shown in deposit dialog:
    * Weekly Plan: TLYFVE2osiDPDwXrBuziWtkxLCsgfYvppM
    * Monthly Plan: TPkL2MzntUSx4686rDv34eZRYxrRj5NmpG
  - Deposit dialog displays user's registered TRC20 address with warning that only deposits from that address will be accepted
  - Copy functionality for deposit addresses
- **Fixed Critical Double Payout Bug with Atomic Completion**: Investment completion now uses atomic UPDATE to prevent race conditions
  - Atomic WHERE clause `is_completed=false` ensures only ONE process can complete an investment
  - `completeInvestment()` returns boolean indicating if THIS call completed it
  - Only processes payout (principal + profit) if atomic completion succeeds
  - Prevents duplicate payouts even under concurrent worker and manual completion
  - Clear logging when investment already completed by another process
- **Maintained Replit Sub-based User IDs**: User identification remains via Replit Auth `sub` to preserve data integrity
- **Added Withdrawal Processing Notice**: 24-hour processing time notice displayed in withdrawal dialog
- **Hourly Investment Worker**: Background process automatically completes investments and distributes profits when endDate is reached

### Balance Calculation Fix
- **Fixed critical bug**: Available balance was incorrectly calculating as negative
- **New logic**: Available balance = current balance (investment amounts already deducted when created)
- **Locked balance**: Shown for informational purposes only, indicates amount in active investments
- **Investment completion**: Principal + profit returned to balance when investments mature

### New Features
- **Tiered Referral System**: Multi-level rewards for successful referrals
  - **Tier 1 (10 referrals)**: $50 one-time bonus
  - **Tier 2 (50 referrals)**: 1% lifetime commission on all referral investments
  - **Tier 3 (100 referrals)**: VIP Partner badge + higher profit share
  - Base reward: $5 per successful referral deposit
- **Countdown Timer**: Shows time remaining until investment completion (days/hours/minutes/seconds)
- **Minimum Deposit**: $100 minimum enforced on both frontend and backend
- **Locked Investments**: Investment principals locked until plan duration completes
- **Gmail/Google Login**: Available through Replit Auth integration (also supports GitHub, email/password)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe UI development
- **Vite** as the build tool and development server with hot module replacement
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** (React Query) for server state management, data fetching, and caching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives providing accessible, customizable components
- **Tailwind CSS** for utility-first styling with a custom dark theme
- Component configuration managed via `components.json` with path aliases for clean imports
- Design system uses CSS variables for consistent theming across components

**State Management Pattern**
- Server state handled by React Query with custom query functions
- Authentication state managed through `useAuth` hook querying `/api/auth/user`
- Form state managed locally with React Hook Form and Zod validation
- Toast notifications for user feedback via custom toast hook

**Key Frontend Features**
- Landing page with authentication (supports Google/Gmail, GitHub, email/password)
- TRC20 onboarding page for new users to register their Tron wallet address (immutable once set)
- Dashboard with investment stats, active investment countdown timers, transaction history
- Investment plan selection and creation dialogs (Weekly 10% ROI, Monthly 50% ROI)
- Wallet management displaying registered TRC20 address with copy functionality
- Deposit dialog with plan-specific admin addresses and user TRC20 address validation
- Withdrawal dialog showing available balance vs locked balance
- Real-time countdown timers for active investments
- Referral program card showing earnings and referral code
- FAQ and Terms pages with updated information

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js with TypeScript
- Request logging middleware tracking API response times
- JSON body parsing with raw body preservation for webhook verification
- Session-based authentication using `express-session` with PostgreSQL storage

**Authentication System**
- **Replit Auth** (OpenID Connect) integration via `openid-client` and Passport.js
- Session storage in PostgreSQL using `connect-pg-simple`
- Authentication middleware (`isAuthenticated`) protecting routes
- User profile synced from Replit claims to local database
- Session TTL of 1 week with secure, HTTP-only cookies

**API Design**
- RESTful endpoints under `/api` namespace
- Authentication routes: `/api/auth/user`, `/api/login`, `/api/callback`
- Profile routes: `/api/profile/trc20` (POST - set TRC20 address, one-time only)
- Investment routes: `/api/investment-plans`, `/api/investments`
- Transaction routes: `/api/transactions`, `/api/transactions/deposit`, `/api/transactions/withdraw`
- FAQ routes: `/api/faqs`
- Protected routes require authentication via middleware

**Database Layer**
- **Drizzle ORM** for type-safe database operations
- **Neon Serverless** PostgreSQL driver with WebSocket support
- Database connection pooling via `@neondatabase/serverless`
- Schema defined in `shared/schema.ts` for code sharing between client and server

### Data Storage Solutions

**PostgreSQL Database Schema**
- **sessions** - Express session storage (sid, sess, expire)
- **users** - User profiles with balance, profit tracking, referral system, referredBy field, successfulReferrals, lifetimeCommissionRate, isVipPartner, trc20Address (unique, immutable)
- **investment_plans** - Plan definitions (weekly 10%/monthly 50% ROI, $100 min, duration days)
- **investments** - User investments with status tracking, profit accumulation, completion dates
- **transactions** - Complete transaction history (deposits, withdrawals, profits, investments, referral bonuses, tier bonuses)
- **faqs** - Frequently asked questions for user support

**Investment & Balance Logic**
- **Investment Creation**: Amount deducted from user balance immediately
- **Locked Balance**: Sum of active investment principals (calculated, not stored)
- **Available Balance**: Current balance (can be withdrawn immediately)
- **Investment Completion**: Auto-completes when endDate reached, returns principal + profit to balance
- **Referral Bonus**: $5 added to referrer's balance on first successful deposit from referred user
- **Referral Tier System**:
  - Successful referral tracked when referred user makes first $100+ deposit
  - Tier 1 (10 successful referrals): $50 bonus automatically added to balance
  - Tier 2 (50 successful referrals): 1% lifetime commission on all future referral investments
  - Tier 3 (100 successful referrals): VIP Partner status with exclusive badge
  - Lifetime commission: Automatically calculated and added when referred users invest

**Key Schema Features**
- UUID primary keys with `gen_random_uuid()` default
- Decimal types for financial precision (15,2)
- Enum types for plan types and transaction statuses
- Timestamp tracking for created/updated records
- Foreign key relationships between users, investments, and transactions

**Data Access Pattern**
- Storage abstraction layer (`IStorage` interface) in `server/storage.ts`
- `DatabaseStorage` implementation with Drizzle queries
- Centralized database operations for maintainability
- Transaction support for atomic operations (deposits, withdrawals)

### Authentication and Authorization

**OpenID Connect Flow**
- Discovery endpoint configuration from Replit OIDC provider
- PKCE flow with state and nonce validation
- Token refresh handled by `openid-client`
- User claims extracted and stored in session

**Session Management**
- PostgreSQL-backed session store for persistence
- Session secret from environment variable
- Secure cookies with 1-week expiration
- Session data includes user claims and tokens

**Authorization Strategy**
- Route-level protection via `isAuthenticated` middleware
- User ID extracted from session claims (sub)
- Operations scoped to authenticated user (no cross-user access)
- 401 responses trigger client-side re-authentication

### External Dependencies

**Replit Services**
- **Replit Auth** - Primary authentication provider via OIDC (supports Google/Gmail, GitHub, email/password)
- **Replit Database** - PostgreSQL provisioned through Replit infrastructure
- Requires `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET` environment variables
- Replit-specific Vite plugins for development (cartographer, dev banner, runtime errors)

**Investment Plans**
- **Weekly Plan**: 10% ROI, 7 days duration, $100 minimum investment
- **Monthly Plan**: 50% ROI, 30 days duration, $100 minimum investment
- Investments locked until completion, countdown timer shows time remaining
- Auto-completion when endDate reached, principal + profit returned to balance

**Database Provider**
- **Neon Database** - Serverless PostgreSQL with WebSocket connections
- Connection string via `DATABASE_URL` environment variable
- WebSocket constructor polyfill using `ws` library for Node.js compatibility

**UI Component Dependencies**
- **Radix UI** - Unstyled, accessible component primitives (dialogs, dropdowns, etc.)
- **Lucide React** - Icon library for consistent iconography
- **date-fns** - Date formatting and manipulation
- **class-variance-authority** - Component variant management
- **cmdk** - Command palette component

**Development Tools**
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast bundling for production build
- **Drizzle Kit** - Database migration and schema management
- Replit-specific development plugins for enhanced DX

**Key Design Decisions**
- Serverless PostgreSQL chosen for Replit deployment compatibility
- Session storage in database for horizontal scalability
- Shared schema between client/server eliminates type duplication
- React Query eliminates need for Redux/Context for server state
- Shadcn/ui provides customizable components without library lock-in