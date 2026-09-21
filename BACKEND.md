# 🌾 KisanCare Backend Architecture & Source Code

> **Full Detailed Documentation**: See [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md) for the complete 15-section architecture document with full production source code.

## Quick Index of Backend Modules & Code

- **Server Entry Point**: [`server/index.js`](./server/index.js) — Express.js server, middleware, CORS, routing, and SPA fallback.
- **AI Vision Lesion Scanner**: [`server/routes/diagnose.js`](./server/routes/diagnose.js) — Pathology mapping, confidence scoring, and remedies.
- **Computer Vision Pixel Engine**: [`src/utils/lesionVisionEngine.js`](./src/utils/lesionVisionEngine.js) — Excess Green Index (EGI), necrosis/chlorosis segmentation, centroid spatial clustering.
- **Income Estimator & Advisory**: [`server/routes/advisory.js`](./server/routes/advisory.js) — 3-tier stochastic earnings model (Low, Expected, High) & direct market bonus.
- **APMC Mandi Rates & Marketplace**: [`server/routes/market.js`](./server/routes/market.js) — Live mandi prices and direct peer-to-peer farmer listings.
- **Certified Seed Store**: [`server/routes/seeds.js`](./server/routes/seeds.js) — Sowing density calculators and subsidized seed orders.
- **Cold Storage & Transport**: [`server/routes/facilities.js`](./server/routes/facilities.js) — Post-harvest preservation hubs and rural haulage fleet.
- **Authentication & RBAC**: [`server/routes/auth.js`](./server/routes/auth.js) — Farmer phone OTP login and APMC Admin verification.
- **Market Oversight Analytics**: [`server/routes/analytics.js`](./server/routes/analytics.js) — Macro-economic trading metrics and MSP compliance.
- **Data Persistence**: [`server/data/`](./server/data/) — Atomic JSON data stores.

---

### How to Run the Backend Locally

```bash
# Start backend on port 5001
node server/index.js

# Check health
curl http://localhost:5001/api/health
```

For the complete technical documentation with architecture diagrams, API schemas, and full code listings, open:
👉 **[BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)**
