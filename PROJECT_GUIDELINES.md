# Dietly — Project Guidelines

> This file is the authoritative reference for any AI agent or developer before making changes to this codebase.
> Read it in full before modifying anything.

---

## 1. Project Structure

```
C:\Dietly\
├── frontend/                  # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── App.jsx            # Router + context providers
│   │   ├── main.jsx           # React DOM mount
│   │   ├── components/        # All page sections (Navbar, Hero, PlansSlider, Testimonials, etc.)
│   │   ├── context/           # AuthContext, AdminAuthContext, DeliveryAuthContext
│   │   ├── hooks/             # useAPI.js (generic fetch + fallback)
│   │   ├── pages/             # Home, AdminLogin, AdminDashboard, DeliveryLogin, DeliveryDashboard
│   │   ├── services/          # api.js (axios clients + all API methods)
│   │   └── assets/dietly/     # Food images + logos
│   ├── .github/workflows/deploy.yml   # CI/CD pipeline
│   ├── vite.config.js         # Build config, dev proxy → localhost:5000
│   └── package.json
│
├── backend/                   # Node.js + Express 5 API
│   ├── src/
│   │   ├── server.js          # App bootstrap (CORS, middleware, routes, error handler)
│   │   ├── config/db.js       # MongoDB connection (cached, serverless-safe)
│   │   ├── models/            # Mongoose models: User, Plan, Meal, Testimonial, Order, FAQ, Stat, etc.
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # Express routers (maps to /api/*)
│   │   ├── middleware/        # auth.js (protect/authorize), validate.js, deliveryAuth.js
│   │   └── seeders/
│   │       ├── seed.js               # Full DB seed (plans, meals, testimonials, FAQs, stats)
│   │       └── updateTestimonials.js # Testimonials-only safe update script
│   ├── .github/workflows/deploy.yml  # CI/CD pipeline (same workflow as frontend)
│   ├── api/index.js           # Vercel serverless entry point
│   └── package.json
│
└── PROJECT_GUIDELINES.md      # This file
```

---

## 2. Tech Stack

| Layer       | Technology                                 |
|-------------|---------------------------------------------|
| Frontend    | React 18, Vite 6, Tailwind CSS 3, Framer Motion 11, Axios |
| Backend     | Node.js, Express 5, Mongoose 9, JWT (jsonwebtoken), bcryptjs |
| Database    | MongoDB (local: `localhost:27017/dietly`, production: managed instance on Lightsail) |
| Auth        | JWT stored in localStorage (`dietly_token`, `dietly_admin_token`, `dietly_delivery_token`) |
| Hosting     | Frontend: AWS S3 + CloudFront (`dietly.in`). Backend: AWS Lightsail + PM2 (`api.dietly.in`) |
| DNS/Proxy   | Cloudflare (proxied A records for both domains) |
| CI/CD       | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## 3. Where Key Data Lives

### Testimonials
- **Primary source**: MongoDB `testimonials` collection (served via `GET /api/testimonials`)
- **Frontend fallback**: `frontend/src/components/Testimonials.jsx` → `fallbackTestimonials` array
  - Used when the API is unreachable or returns empty
- **Seed/reset**: `backend/src/seeders/seed.js` → `const testimonials`
- **Production-safe update**: `backend/src/seeders/updateTestimonials.js` (testimonials only, no other data touched)
- **Schema fields required by UI**: `name`, `role`, `text`, `rating` (1–5)

### Plans
- **Primary source**: MongoDB `plans` collection (served via `GET /api/plans`)
- **Frontend fallback**: `frontend/src/components/PlansSlider.jsx` → `fallbackPlans` array
- **Seed**: `backend/src/seeders/seed.js` → `const plans`
- **Schema fields**: `name`, `slug`, `price`, `period`, `description`, `features[]`, `popular`, `sortOrder`, `isActive`

### Auth
- **User auth**: `POST /api/auth/login` → JWT token, `GET /api/auth/me`
- **Email normalization**: `gmail_remove_dots: false` is deliberately set in `backend/src/routes/auth.js` to handle Gmail dot aliases
- **Admin auth**: same login endpoint, role check `=== 'admin'` in `AdminAuthContext.jsx`
- **Delivery auth**: separate `POST /api/delivery/login` endpoint, `protectDeliveryAgent` middleware

### Environment Variables (backend)
| Variable      | Purpose                                |
|---------------|----------------------------------------|
| `PORT`        | Server port (default 5000)             |
| `NODE_ENV`    | `development` or `production`          |
| `MONGODB_URI` | Full MongoDB connection string         |
| `JWT_SECRET`  | JWT signing secret (rotate in prod)    |
| `JWT_EXPIRE`  | JWT expiry (e.g. `7d`)                 |
| `CORS_ORIGIN` | Comma-separated allowed origins        |

### Optional WhatsApp Enrollment Alerts
| Variable | Purpose |
|----------|---------|
| `WHATSAPP_NOTIFY_ENABLED` | Set `true` to enable WhatsApp alert after `POST /api/orders` |
| `WHATSAPP_NOTIFY_PHONE` | Destination WhatsApp number in international digits-only format (e.g. `919011154118`) |
| `WHATSAPP_NOTIFY_API_KEY` | CallMeBot API key mapped to destination number |

When enabled, every successful enrollment sends a message containing customer info, plan, amount, address, slot, coordinates, and map link.

**Never commit `.env` files.** Both repos have `.env` in `.gitignore`.

---

## 4. How to Safely Make Changes

### Updating testimonials content
1. Edit `fallbackTestimonials` in `frontend/src/components/Testimonials.jsx`
2. Edit `const testimonials` in `backend/src/seeders/seed.js`
3. Run on production server: `node src/seeders/updateTestimonials.js`
   - This only touches the testimonials collection, nothing else

### Adding a new API endpoint
1. Create/edit controller in `backend/src/controllers/`
2. Register route in `backend/src/routes/` with appropriate `protect`/`authorize` middleware
3. Mount route in `backend/src/server.js` under `/api/your-route`
4. Add API client method in `frontend/src/services/api.js`

### Changing auth logic
- Do NOT modify `backend/src/routes/auth.js` normalizeEmail options without testing Gmail dot aliases
- Do NOT remove `gmail_remove_dots: false` — this prevents login failures for dot-variant emails

### Adding a new page/section
- Add component in `frontend/src/components/`
- Import and render in `frontend/src/pages/Home.jsx` or `App.jsx`
- Follow the existing design system: use `.card`, `.badge`, `.btn-primary` CSS classes from `index.css`
- Use `useAPI(apiFn, fallback)` hook for any data fetched from the backend

---

## 5. What NOT to Do

| Risk | Why |
|------|-----|
| Do NOT commit `.env` files | Exposes database credentials and JWT secrets |
| Do NOT run `seed.js` on production without backup | It wipes Plans, Meals, FAQs, Stats, and Testimonials entirely |
| Do NOT remove `gmail_remove_dots: false` from login validation | Breaks login for Gmail dot-alias users |
| Do NOT change the CORS `app.options('/{*any}', ...)` pattern | Express 5 wildcard syntax — changing it breaks OPTIONS preflight |
| Do NOT hardcode API URLs in source | Use `import.meta.env.VITE_API_URL` (frontend) or `process.env.*` (backend) |
| Do NOT commit debug scripts with hardcoded credentials to `src/seeders/` | Security risk |
| Do NOT change `PM2 process name` from `dietly-backend` | CI pipeline's `pm2 reload dietly-backend` will fail |
| Do NOT add `localhost` URLs to frontend source | CI pipeline blocks localhost in production build output |

---

## 6. Deployment Flow

### Frontend
1. `cd frontend && npm run build` — produces `dist/`
2. `aws s3 sync dist/ s3://dietly-frontend-217343505350 --delete`
3. `aws s3 cp dist/index.html s3://dietly-frontend-217343505350/index.html --cache-control "no-cache, no-store, must-revalidate"`
4. `aws cloudfront create-invalidation --distribution-id ET4BITI46111M --paths "/*"`

### Backend
1. `scp` or `rsync` source to `/home/bitnami/dietly-backend/` on AWS Lightsail (`3.6.99.54`)
2. SSH: `cd /home/bitnami/dietly-backend && npm ci --omit=dev`
3. SSH: `pm2 reload dietly-backend` (zero-downtime reload)
4. SSH: `pm2 save`

### Seeding production DB
- Full seed (caution — wipes data): `node src/seeders/seed.js`
- Testimonials only (safe): `node src/seeders/updateTestimonials.js`

---

## 7. CI/CD Pipeline

Both `frontend/.github/workflows/deploy.yml` and `backend/.github/workflows/deploy.yml` contain the same full-stack pipeline triggered on `push` to `main`.

### Jobs
| Job | What it does |
|-----|--------------|
| `frontend-build` | `npm ci` → lint → build → validate no localhost URLs → validate production API URL in bundle → upload `dist/` artifact |
| `backend-build` | `npm ci` → lint → ensure no tracked `.env` → scan for hardcoded secrets → validate CORS config pattern → verify server starts without crash |
| `deploy` | Downloads `dist/` artifact → S3 sync → CloudFront invalidation → rsync backend → `npm ci --omit=dev` → `pm2 reload` → health check `/api/testimonials` + `/api/plans` → CORS preflight check |

### Required GitHub Secrets (set on `dietlyin/dietly-backend`)
| Secret | Value |
|--------|-------|
| `CI_GH_PAT` | GitHub PAT with cross-repo read |
| `AWS_ACCESS_KEY_ID` | AWS IAM key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `AWS_REGION` | e.g. `ap-south-1` |
| `S3_BUCKET` | `dietly-frontend-217343505350` |
| `CF_DISTRIBUTION_ID` | `ET4BITI46111M` |
| `SSH_HOST` | `3.6.99.54` |
| `SSH_USER` | `bitnami` |
| `SSH_PRIVATE_KEY` | PEM key contents |
| `SSH_PORT` | `22` |
| `BACKEND_DEPLOY_PATH` | `/home/bitnami/dietly-backend` |

### Post-deploy health checks (automated in pipeline)
- `https://api.dietly.in/api/health` — server alive
- `https://api.dietly.in/api/testimonials` — returns `success: true`
- `https://api.dietly.in/api/plans` — returns `success: true`
- OPTIONS preflight to `/api/auth/register` with `Origin: https://dietly.in` — validates CORS headers
