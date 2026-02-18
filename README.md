# NutriGoal — AI-Powered Diet Tracking SaaS

A production-ready full-stack web application for intelligent nutrition tracking with AI-generated meal plans.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS |
| UI Components | ShadCN-style (Radix UI + CVA) |
| Charts | Chart.js + react-chartjs-2 |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js (JWT) |
| AI | OpenAI GPT-4o-mini |
| Payments | Stripe (subscriptions) |

## Features

- **Auth** — Email/password registration & login with JWT sessions
- **Onboarding** — Multi-step wizard collecting profile & goals
- **Calorie Engine** — Mifflin-St Jeor BMR + TDEE + macro splits
- **Food Logging** — 50+ food database, manual entry, daily macro tracking
- **AI Meal Plans** — GPT-4-powered 7-day plans with grocery lists (Premium)
- **Progress Tracking** — Weekly weight logs with Chart.js visualization
- **Smart Adjustments** — Auto calorie adjustment based on weekly progress (Premium)
- **Stripe Payments** — Subscription checkout + webhook handling

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/nutrigoal"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OpenAI API key (from platform.openai.com)
OPENAI_API_KEY="sk-..."

# Stripe keys (from dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Set Up the Database

```bash
# Push schema to database (development)
npm run db:push

# OR run migrations (production-ready)
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### 4. Set Up Stripe

1. Create a product in your Stripe dashboard
2. Create a recurring price (e.g., $9.99/month)
3. Copy the `price_...` ID to `STRIPE_PREMIUM_PRICE_ID`
4. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
5. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_failed`

For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nutrigoal/
├── app/
│   ├── (auth)/              # Login & register pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── food-log/        # Food logging
│   │   ├── meal-plan/       # AI meal plans
│   │   ├── progress/        # Weight progress
│   │   └── settings/        # User settings
│   ├── api/
│   │   ├── auth/            # NextAuth + register
│   │   ├── food-log/        # Food CRUD
│   │   ├── meal-plan/       # AI meal generation
│   │   ├── onboarding/      # Profile setup
│   │   ├── stripe/          # Checkout, portal, webhook
│   │   ├── user/profile/    # Profile management
│   │   └── weight-log/      # Weight tracking
│   ├── onboarding/          # Onboarding wizard page
│   └── page.tsx             # Landing page
├── components/
│   ├── dashboard/           # Charts & cards
│   ├── food-log/            # Food entry components
│   ├── layout/              # Sidebar & header
│   ├── meal-plan/           # Meal plan display
│   ├── onboarding/          # Onboarding wizard
│   ├── progress/            # Weight log form
│   ├── subscription/        # Paywall modal
│   └── ui/                  # ShadCN-style UI primitives
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── db.ts                # Prisma singleton
│   ├── openai.ts            # OpenAI client
│   └── stripe.ts            # Stripe client
├── prisma/
│   └── schema.prisma        # Database schema
├── services/
│   ├── meal-plan.ts         # OpenAI prompt & generation
│   └── progress.ts          # Progress analysis
├── types/
│   ├── index.ts             # Application types
│   └── next-auth.d.ts       # NextAuth type extensions
└── utils/
    ├── calculations.ts      # BMR/TDEE/macro calculations
    ├── cn.ts                # TailwindMerge utility
    └── formatters.ts        # Date/value formatters
```

## Subscription Model

| Feature | Free | Premium |
|---------|------|---------|
| Food logging | ✅ | ✅ |
| Macro tracking | ✅ | ✅ |
| Weight logging | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| AI Meal Plans | ❌ | ✅ |
| Smart calorie adjustments | ❌ | ✅ |
| Grocery lists | ❌ | ✅ |

## Nutrition Logic

**Calorie Calculation (Mifflin-St Jeor):**
- Male BMR: `10w + 6.25h - 5a + 5`
- Female BMR: `10w + 6.25h - 5a - 161`
- TDEE = BMR × activity multiplier

**Goal Adjustments:**
- Weight Loss: TDEE − 500 kcal
- Muscle Gain: TDEE + 300 kcal
- Maintain: TDEE

**Macro Splits:**
- Protein: 1.6g/kg (gain) or 1.2g/kg (loss)
- Fat: 25% of total calories
- Carbs: remaining calories

**Smart Calorie Adjustment (Premium):**
- Weight loss >1%/week → increase calories
- 2-week plateau → reduce calories 5%

## Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

For production, use managed PostgreSQL (Supabase, Neon, Railway) and deploy to Vercel, Railway, or similar.

## License

MIT
