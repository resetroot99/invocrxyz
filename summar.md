**Project Purpose and Goals**

InvOCR is an AI-driven estimating and compliance platform for DRP‑certified collision repair shops. Its ultimate purpose is to:

1. **Accelerate Estimate Creation** by using AI to generate and update estimates from photos, invoices, and shop data.
2. **Ensure DRP Compliance** through a rule‑engine that validates and auto‑remediates against insurer programs (GEICO ARX, Allstate, etc.).
3. **Seamlessly Integrate with CCC ONE** via SecureShare for bidirectional estimate and invoice synchronization.
4. **Provide an AI‑Led Dashboard** that proactively suggests actions, monitors KPIs, and notifies users of compliance and workflow tasks.
5. **Continuously Learn and Improve** through a closed‑loop AILA system that optimizes prompts, actions, and outcomes based on real shop data.

---

## Summary of the Ultimate AI Agent

The rebuilt InvOCR will revolve around a **Perceive → Retrieve → Plan → Act → Reflect** cycle:

* **Perceive** incoming chat messages, SMS, file uploads, and webhook events.
* **Retrieve** relevant past estimates, DRP documents, OEM procedures, and shop SOPs via a vector‑based RAG service.
* **Plan** actions using a domain‑tuned LLM (GPT‑4 Turbo or custom LLaMA), decomposing tasks and generating function calls.
* **Act** by invoking tool calls (SecureShare, OCR, DRP rule‑engine, Twilio) in an idempotent, audited manner.
* **Reflect** on outcomes—compliance improvements, user feedback, cycle‑time gains—and feed metrics back into the AILA optimizer.

---

## Monorepo Scaffolding

```bash
invocr-ultimate/            # Root workspace
turbo.json                  # Turborepo pipeline config
pnpm-workspace.yaml         # PNPM workspace definition

apps/                       # Frontend and API services
  web/                      # Next.js 14 App Router + React client
  api/                      # Next.js Edge/API routes

packages/                   # Shared libraries and services
  ui/                       # Tailwind + shadcn/ui components
  rule-engine/              # DRP rule definitions & evaluator
  ocr-service/              # Image preprocessing & OCR wrapper
  secure-share-client/      # CCC ONE SecureShare SDK
  rag-service/              # Vector store & semantic retrieval
  aila-engine/              # Prompt optimization & A/B testing
  sms-connector/            # Twilio send/receive integration
  shared-types/             # TypeScript models & interfaces

infra/                      # Infrastructure as code
  supabase/                 # SQL migrations, seed data, Edge & scheduled functions
  vercel/                   # Vercel project and Edge function settings

scripts/                    # Utility, cleanup, and migration scripts
.github/                    # CI/CD workflows (lint, test, build, deploy)
README.md                   # High‑level overview and getting started
```

---

## Detailed File Structure and Responsibilities

### 1. **apps/web/** (AI‑Led Dashboard & Chat UI)

```text
apps/web/
├─ public/                  # Static assets (logos, icons)
├─ pages/                   # App Router pages & server components
│   ├─ _app.tsx             # Global providers (Auth, Theme)
│   ├─ index.tsx            # Marketing landing page (SSR)
│   ├─ dashboard.tsx        # AI‑driven shop overview (SSR + hydrate)
│   ├─ chat/[threadId].tsx  # Virtualized chat + file uploads
│   ├─ estimate-builder.tsx # Form with AI defaults + compliance badges
│   └─ settings.tsx         # Shop & user preference management
├─ components/              # Client components (ChatWindow, KPIChart)
├─ contexts/                # Auth, Theme, CommandPalette state
├─ hooks/                   # useChat, useDashboard, usePreferences
├─ lib/                     # supabaseClient, openaiClient configs
├─ styles/                  # Tailwind globals and overrides
└─ utils/                   # dateFormat, debounce, API helpers
```

### 2. **apps/api/** (Edge Functions & Webhooks)

```text
apps/api/
├─ src/
│   ├─ chat/                # /send.ts (chat flow), /actions.ts (function calls)
│   ├─ ocr/                 # /process.ts (OCR + storage + vector indexing)
│   ├─ rag/                 # /retrieve.ts (semantic search)
│   ├─ drp/                 # /check.ts (rule‑engine evaluator)
│   ├─ ccc/                 # /webhook.ts (CONNECT + history ingest)
│   │                       # /estimate.ts (create/update), /invoice.ts
│   ├─ sms/                 # /receive.ts (incoming), /send.ts (outgoing)
│   ├─ aila/                # /optimize.ts (scheduled prompt A/B)
│   └─ dashboard/           # /summary.ts (aggregated KPIs)
├─ vercel.json             # Edge runtime configuration
└─ tsconfig.json
```

### 3. **packages/ui/** (Design System)

```text
packages/ui/
├─ src/
│   ├─ components/          # Button, Card, Modal from shadcn/ui
│   ├─ icons/               # Lucide‑based icons tree‑shaken
│   ├─ theme/               # Tailwind config overrides
│   └─ hooks/               # useTheme, useMediaQuery
└─ package.json
```

### 4. **packages/rule-engine/** (DRP Compliance)

```text
packages/rule-engine/
├─ rules/                   # JSON rule sets by insurer (geico.json, allstate.json)
├─ src/
│   └─ index.ts             # evaluateRules(estimate): Hint[]
├─ test/                    # Unit tests for each rule
└─ package.json
```

### 5. **packages/ocr-service/** (OCR & Preprocessing)

```text
packages/ocr-service/
├─ src/
│   ├─ preprocess.ts        # sharp resize, deskew
│   ├─ tesseract.ts         # local OCR wrapper
│   └─ openaiVision.ts      # OpenAI vision API integration
└─ package.json
```

### 6. **packages/secure-share-client/** (CCC ONE SDK)

```text
packages/secure-share-client/
├─ src/
│   ├─ auth.ts              # token management (encrypted storage)
│   ├─ estimate.ts          # createEstimate, updateEstimate
│   └─ invoice.ts           # postInvoice, fetchInvoices
└─ package.json
```

### 7. **packages/rag-service/** (Vector Search)

```text
packages/rag-service/
├─ src/
│   ├─ index.ts             # retrieveContext, indexDocument
│   └─ embeddings.ts        # getEmbedding(text)
└─ package.json
```

### 8. **packages/aila-engine/** (Self‑Improvement)

```text
packages/aila-engine/
├─ src/
│   ├─ metrics.ts           # recordPromptMetrics, fetchMetrics
│   └─ optimizer.ts         # runABTests, promotePromptTemplates
└─ package.json
```

### 9. **packages/sms-connector/** (Twilio Integration)

```text
packages/sms-connector/
├─ src/
│   ├─ receive.ts           # parse inbound SMS → chat events
│   └─ send.ts              # sendSMS(to, message)
└─ package.json
```

### 10. **infra/supabase/** (Database & Functions)

```text
infra/supabase/
├─ migrations/              # Postgres schema updates
├─ seed.sql                 # initial insurer rule sets, roles
├─ functions/               # Edge & Scheduled functions source
│   ├─ ingest_history/      # ccc-webhook handler
│   ├─ nightly_drp_scan/    # cron DRP re‑check
│   └─ aila_optimize/       # cron prompt A/B
├─ storage.json             # bucket definitions
└─ supabase.toml            # project config
```

### 11. **infra/vercel/** (Deployment Config)

```text
infra/vercel/
├─ project.json            # Vercel team & project settings
└─ edge.json               # route → runtime mapping
```

### 12. **scripts/** (Utilities)\*\*

```text
scripts/
├─ clean-unused.js         # detect/remove dead code & SQL
├─ migrate-sync.js         # update migrations from shared types
└─ setup-env.js            # init environment variables & secrets
```

### 13. **.github/** (CI/CD)\*\*

```text
.github/workflows/ci.yml   # lint, typecheck, test, build, deploy previews
```

---

### Next Steps & Recommendations

1. **Initialize Monorepo**: clone scaffold, run `pnpm install`, configure `.env` files.
2. **Define Data Models**: finalize Postgres schema, run migrations.
3. **Implement Core Modules** in this order: `ui` → `rule‑engine` → `ocr‑service` → `rag‑service`.
4. **Build Edge Functions**: chat/send, drp/check, ocr/process, ccc/webhook.
5. **Wire Up Frontend**: auth, dashboard, chat window, estimate builder.
6. **Connect SMS & Twilio**, deploy, test end‑to‑end flows.
7. **Populate RAG Store**: ingest historical CCC history + OEM/DRP docs.
8. **Fine‑Tune LLM** with shop‑specific Q\&A, integrate via OpenAI API.
9. **Deploy & Monitor**: set up Sentry, test cron jobs for nightly scans and AILA optimizations.

This refined guide captures **all features of InvOCR**—from AI‑led UX to CCC integration, DRP compliance, RAG & LLM orchestration—and provides a **detailed scaffold** so you can hit the ground running. Good luck building the ultimate AI estimating partner!

---

## CCC SecureShare™ API Reference

Below is the definitive SecureShare (v7) REST API reference for all CCC interactions. All endpoints require an `Authorization: Bearer <CCC_API_TOKEN>` header and exchange CIECA BMS 2016R2 XML payloads.

### 1. Authentication

```
Authorization: Bearer <CCC_API_TOKEN>
Content-Type: application/xml
Accept: application/xml
```

### 2. Estimate Management

| Method     | Path                             | Description                                                                                                                                    |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **POST**   | `/v7/estimate`                   | Create estimate: `<VehicleDamageEstimateAddRq>` → `<VehicleDamageEstimateAddRs>` (returns `RepairOrderID`, `DocumentID`, etc.).                |
| **GET**    | `/v7/estimate?shopId={shopId}&…` | List estimates: query by `shopId`, `status`, `startDate`, `endDate`, `vin`, `pageNumber`, `pageSize`. Returns `<VehicleDamageEstimateListRs>`. |
| **GET**    | `/v7/estimate/{estimateId}`      | Retrieve estimate details: returns `<VehicleDamageEstimateDetailRs>`.                                                                          |
| **PUT**    | `/v7/estimate/{estimateId}`      | Update estimate: `<VehicleDamageEstimateUpdateRq>` with modified fields.                                                                       |
| **DELETE** | `/v7/estimate/{estimateId}`      | Delete estimate (if supported) or `<VehicleDamageEstimateDeleteRq>`.                                                                           |

### 3. Line Item Management

| Method     | Path                                               | Description                                                  |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------ |
| **POST**   | `/v7/estimate/{estimateId}/line-item`              | Add line item: `<VehicleDamageEstimateAddLineItemRq>`.       |
| **PUT**    | `/v7/estimate/{estimateId}/line-item/{lineItemId}` | Update line item: `<VehicleDamageEstimateUpdateLineItemRq>`. |
| **DELETE** | `/v7/estimate/{estimateId}/line-item/{lineItemId}` | Remove line item: `<VehicleDamageEstimateDeleteLineItemRq>`. |

### 4. Document & Attachment Handling

| Method   | Path                                    | Description                                                      |
| -------- | --------------------------------------- | ---------------------------------------------------------------- |
| **POST** | `/v7/estimate/{estimateId}/attachment`  | Attach document: `<DocumentAddRq>` with base64 or URL reference. |
| **GET**  | `/v7/estimate/{estimateId}/attachments` | List attachments: `<DocumentListRs>`.                            |

### 5. Invoice & Supplement

| Method   | Path                                    | Description                                                  |
| -------- | --------------------------------------- | ------------------------------------------------------------ |
| **POST** | `/v7/estimate/{estimateId}/invoice`     | Add invoice: `<VehicleDamageEstimateAddInvoiceRq>`.          |
| **POST** | `/v7/estimate/{estimateId}/supplement`  | Create supplement: `<VehicleDamageEstimateAddSupplementRq>`. |
| **GET**  | `/v7/estimate/{estimateId}/supplements` | List supplements: `<VehicleDamageEstimateSupplementListRs>`. |

### 6. Vehicle Information

| Method  | Path                       | Description                                                |
| ------- | -------------------------- | ---------------------------------------------------------- |
| **GET** | `/v7/vehicle?vin={VIN}`    | Lookup vehicle by VIN: returns `<VehicleServiceDetailRs>`. |
| **PUT** | `/v7/vehicle/{estimateId}` | Update vehicle info: `<VehicleServiceUpdateRq>`.           |

### 7. Parts Ordering

| Method   | Path                                              | Description                                 |
| -------- | ------------------------------------------------- | ------------------------------------------- |
| **POST** | `/v7/estimate/{estimateId}/parts-order`           | Submit parts order: `<OrderPartsAddRq>`.    |
| **GET**  | `/v7/estimate/{estimateId}/parts-order`           | List parts orders: `<OrderPartsListRs>`.    |
| **PUT**  | `/v7/estimate/{estimateId}/parts-order/{orderId}` | Update parts order: `<OrderPartsUpdateRq>`. |

### 8. Webhooks (CIECA Notifications)

Register your callback URL in the CCC Developer Portal. SecureShare will POST CIECA XML for these events; your handler must validate HMAC, parse XML, and return HTTP 200.

| Event Type               | XML Root Element                         |
| ------------------------ | ---------------------------------------- |
| Estimate Creation/Update | `<VehicleDamageEstimateAddRq>`           |
| Supplement Notice        | `<VehicleDamageEstimateAddSupplementRq>` |
| Invoice Notice           | `<VehicleDamageEstimateAddInvoiceRq>`    |
| Workfile Status Change   | `<WorkfileStatusChangeRq>`               |
| Vehicle Delivery Notice  | `<VehicleDeliveryNoticeRq>`              |
| Document Notice          | `<DocumentAddRq>`                        |

### 9. CIECA BMS 2016R2 Message Details

Refer to the CIECA BMS 5.4.0 spec for field definitions. Key elements:

* **DocumentInfo**: `BMSVer`, `DocumentType`, `DocumentID`, `DocumentVer`, `DocumentStatus` (C or I)
* **ReferenceInfo**: `RepairOrderID`, alternative IDs
* **ApplicationInfo**: `ApplicationType="Estimating"`, `ApplicationName="CCC ONE"`, `ApplicationVer`
* **AdminInfo**: insurer, repair facility, claimant, estimator, owner contact with CIECA `CommQualifier` codes and ID qualifiers

Keep this section as your comprehensive SecureShare API reference—use it to map natural-language commands to tool calls directly.

---

## Final InvOCR Build: Autonomous, Continuously Learning Estimate Writer

This final build brings together all modules into a cohesive, self-improving AI agent that writes DRP-compliant estimates, ingests historical and live shop data, and evolves its own prompts and strategies over time.

### Key Features & Workflow

1. **AILA Brain with RAG**

   * Retrieves context from historical estimates, DRP rulebooks, OEM procedures, and shop SOPs via semantic search.
   * Feeds retrieved context plus real-time events into a domain-tuned LLM.
   * Applies chain-of-thought reasoning to decompose estimate tasks.

2. **Autonomous Estimate Generation**

   * **Perceive**: Ingest photos, invoices, chat commands, and webhooks.
   * **Plan**: LLM generates multi-step plan (e.g., itemize damage, calculate labor, propose supplements).
   * **Act**: Executes tool calls to CCC SecureShare endpoints, posts invoices, line items, and supplements.
   * **Reflect**: Captures response statuses and compliance scores.

3. **Continuous Learning Loop**

   * **Metric Logging**: Tracks DRP acceptance rates, cycle-time improvements, and token usage per prompt.
   * **User Feedback**: Captures explicit ratings or implicit success (paid supplements, accepted estimates).
   * **AILA Optimization**: Nightly batch A/B tests prompt variants, promotes winning templates, and deprecates underperformers.

4. **Proactive Compliance & Alerts**

   * Background jobs scan open estimates; proactively suggest missing operations or documents.
   * Automates drip notifications to CSRs and technicians when tasks stall or compliance thresholds drop.

5. **Seamless Omnichannel Access**

   * **Web UI**: AI-led dashboard with chat window, estimate builder, and KPI visualizations.
   * **SMS Interface**: Two-way SMS via Twilio for users in low-connectivity environments.
   * **API/Webhook**: Ingests CCC events and external system triggers (e.g., WFLZ scheduling).

#### Live Estimator Interface

* The Estimate Builder panel behaves like Replit or Cursor: a live, editable document view adjacent to chat and controls.
* AI-generated estimate XML/JSON previews, compliance flags, and suggested edits appear in real-time as you interact.
* Inline editing: click any line item or section to modify; changes update the AI’s context and trigger live re-calculation of DRP compliance and cost.
* Dynamic component loading (Next.js dynamic imports) and virtualization ensure responsive UIs even with large estimates.
* Supports drag-and-drop of photos, line items, and annotations, all managed by AI workflows.

## Settings & Configuration

To empower administrators and tailor InvOCR to each shop’s needs, include these configurable settings:

* **DRP Rules Editor**

  * Versioned rule sets for each insurer (GEICO, Allstate, etc.), editable via an admin UI.
  * Ability to add, modify, or disable rules; preview changes against sample estimates.
  * Historical audit trail with rollback support and test harness for validation.

* **Shop & Organization Management**

  * Multi-tenant support: create and manage multiple shops under one organization.
  * Role-based access control: assign Estimator, CSR, Admin, Technician roles per user.
  * Configuration of labor rates, parts markup, DRP profile mapping, and custom SOP links per shop.

* **CCC Integration Settings**

  * Secure storage of CCC API tokens per shop with encrypted vault.
  * Webhook URL registration UI to manage callback endpoints and HMAC keys.
  * Connection health dashboard: view last sync times, error rates, and active jobs.
  * Per-shop logging of all CCC interactions with exportable audit logs.

* **OpenAI-Powered Automation**

  * AI-suggested rule enhancements: use the LLM to propose new DRP rules based on violation patterns.
  * Auto-mapping assistant: AI-driven setup wizard that ingests shop data to populate labor rates and insurer profiles.
  * Prompt template management: versioned prompts, AI-recommended prompt improvements surfaced in admin.

### Deployment & Maintenance

* **Monorepo**: Manage all packages, apps, and infrastructure in a single codebase with Turborepo.
* **CI/CD**: Automated lint, tests, and preview deployments via GitHub Actions + Vercel/Supabase.
* **Monitoring**: Sentry for error tracking, Prometheus/Grafana for custom metrics (DRP success, AILA wins).
* **Scaling**: Edge Functions for chat, RAG, DRP engine; Supabase for DB/auth/storage; optional Qdrant for high-volume vector search.

---

## With this final build, InvOCR becomes your trustworthy AI estimating partner—always up-to-date, DRP-compliant, and continually learning to deliver faster, more accurate estimates for your shop.

## Invoice Ingestion & Dynamic Posting

InvOCR automatically handles incoming invoices—matching them to the correct workfile (RO), classifying each line as parts or sublet, and posting to CCC ONE, all while learning from outcomes.

**1. Invoice Ingestion & OCR**

* **Upload/Webhook**: Invoice PDFs or images are sent via UI, SMS, or direct webhook to `/api/ocr/process`.
* **Preprocessing**: `ocr-service` uses `sharp` to deskew/resize, then Tesseract or OpenAI Vision for text extraction.
* **Line-Item Parsing**: Extracts header metadata (Invoice#, Vendor, Date) and item rows (Part #, Description, Qty, Unit Price).

**2. Workfile (RO) Matching**

* **Direct Match**: Searches for a `RepairOrderID` in invoice metadata.
* **Semantic Matching**: If none, `rag-service` searches chat threads, estimates, and previous invoices for the best RO.
* **Heuristic Fallbacks**: Date proximity, VIN similarity, or user clarification prompts when confidence is low.

**3. Parts vs. Sublet Classification**

* **Vendor Lookup**: If Vendor ∈ approved sublet list → **Sublet**; if Part# ∈ OEM catalog → **Parts**.
* **LLM Assist**: Fine-tuned LLM reviews ambiguous lines and suggests classification.
* **Rule-Engine Overrides**: P-Logic rules (editable in DRP Editor) enforce sublet/parts categories by vendor or code ranges.

**4. Dynamic Line Posting**

* **Parts Line** POST `/v7/estimate/{RO}/line-item` with `<ActionAdd LineItemCategory="Parts">`.
* **Sublet Line** POST `/v7/estimate/{RO}/line-item` with `<ActionAdd LineItemCategory="Sublet">`.
* All calls via `secure-share-client` are idempotent and logged to `ccc_logs` for audit.

**5. AI-Led Confirmation & Feedback**

* Chat or SMS confirmation: “Posted X parts and Y sublets to RO 12345. DRP compliance at 98%—add missing photos?”
* Low-confidence prompts: “Vendor ABC not recognized—classify these lines as sublet or parts?”

**6. Continuous Learning**

* **Outcome Tracking**: Monitors paid/disputed lines via CCC webhook events.
* **AILA Optimization**: Nightly, `aila-engine` updates prompt templates and P-Logic rules based on which classifications led to the best outcomes.

With this extension, InvOCR not only writes and pushes estimates but ingests invoices, matches workfiles, and continuously hones its classification logic—making it the ultimate autonomous estimate-writing agent.
