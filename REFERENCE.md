# Omda Coffee — Operations Platform Reference

A plain-English guide to how this app works, how to run it, and how to make common changes.

---

## Table of Contents

1. [What this app does](#what-this-app-does)
2. [How to run it](#how-to-run-it)
3. [How the tech works (simple version)](#how-the-tech-works-simple-version)
4. [File map — what every file does](#file-map)
5. [The 10-step workflow explained](#the-10-step-workflow-explained)
6. [How to make common changes](#how-to-make-common-changes)
7. [Setting up integrations](#setting-up-integrations)
8. [Database — viewing and editing data](#database)
9. [Deploying to the internet](#deploying-to-the-internet)

---

## What this app does

This is a web app that your operations manager opens in a browser. It manages a coffee catering job from the moment a sale is agreed all the way to the client leaving a review.

Every job goes through **10 steps in order**. The app locks future steps and only unlocks the next one when the current step is marked complete. This means your team always knows exactly where a job stands and what to do next.

```
Sale Agreed → Contract → Concierge Brief → Event Brief →
Warehouse Checklist → Driver Checklist → Event Live →
Event Done → Invoice → Review Request
```

---

## How to run it

```bash
# 1. Go to the project folder
cd /home/user/Omda

# 2. Start the app
npm run dev

# 3. Open in your browser
# http://localhost:3000
```

To stop it: press `Ctrl + C` in the terminal.

**First-time setup only** (already done, but if you ever reset):
```bash
npm install          # installs all the packages
npm run db:push      # creates the database file
npm run dev          # start the app
```

---

## How the tech works (simple version)

Think of the app as three layers:

```
┌─────────────────────────────────────────┐
│  Browser (what your ops manager sees)   │  ← React / Next.js pages
│  Pages, buttons, forms                  │
├─────────────────────────────────────────┤
│  Server (the brain)                     │  ← Next.js API routes
│  Handles logic, sends messages,         │
│  talks to Xero, saves data              │
├─────────────────────────────────────────┤
│  Database (the memory)                  │  ← SQLite via Prisma
│  Stores clients, events, checklists,    │
│  documents, messages                    │
└─────────────────────────────────────────┘
```

**Key technologies used:**

| Technology | What it does | Why we used it |
|---|---|---|
| **Next.js** | The web framework — runs both the frontend and backend | Industry standard, handles everything in one place |
| **React** | Builds the UI (buttons, forms, panels) | Used by most modern web apps |
| **TypeScript** | Like JavaScript but with type safety — catches bugs early | Prevents common mistakes |
| **Tailwind CSS** | Makes the app look good using utility classes | Fast to write, easy to customise |
| **Prisma** | Talks to the database — reads and writes data | Lets you write readable code instead of raw SQL |
| **SQLite** | The database — a single file on disk (`dev.db`) | Zero setup, works anywhere |
| **Twilio** | Sends WhatsApp and SMS messages | The standard for programmatic messaging |
| **Xero API** | Creates invoices in your Xero account | Direct integration, no copy-pasting |
| **docxtemplater** | Fills in Word document templates with event data | Works with your existing Word docs |

---

## File map

```
Omda/
├── .env                    ← Your secret keys (Twilio, Xero). Never share this.
├── .env.example            ← Template showing what keys are needed (safe to share)
├── package.json            ← Lists all the packages the app uses
├── prisma/
│   └── schema.prisma       ← Database structure — defines all the tables
└── src/
    ├── app/                ← Pages and API routes (Next.js App Router)
    │   ├── page.tsx                    ← Dashboard (home page)
    │   ├── layout.tsx                  ← The outer shell — sidebar + toast notifications
    │   ├── globals.css                 ← Global styles and custom CSS classes
    │   ├── clients/
    │   │   └── page.tsx               ← Client list page
    │   ├── events/
    │   │   ├── new/page.tsx           ← "Create new event" form
    │   │   └── [id]/page.tsx          ← Individual event detail + workflow stepper
    │   ├── settings/
    │   │   └── page.tsx               ← Settings page (Xero connect, template guide)
    │   └── api/                        ← Backend endpoints (the server-side logic)
    │       ├── events/
    │       │   ├── route.ts           ← GET all events / POST create event
    │       │   └── [id]/
    │       │       ├── route.ts       ← GET / PATCH / DELETE a specific event
    │       │       └── steps/[stepId]/complete/route.ts  ← Mark a step complete
    │       ├── checklists/[id]/route.ts  ← Save checklist items
    │       ├── clients/route.ts          ← List / create clients
    │       ├── documents/
    │       │   ├── route.ts              ← Upload a document
    │       │   ├── generate/route.ts     ← Generate doc from Word template
    │       │   └── [id]/download/route.ts ← Download a document
    │       ├── messages/route.ts         ← Send WhatsApp / SMS via Twilio
    │       └── xero/
    │           ├── auth/route.ts         ← Start Xero OAuth login
    │           ├── callback/route.ts     ← Xero redirects here after login
    │           └── invoice/route.ts      ← Create invoice in Xero
    ├── components/          ← Reusable UI pieces
    │   ├── Sidebar.tsx                 ← Left navigation bar
    │   ├── WorkflowStepper.tsx         ← The horizontal step bar at top of event page
    │   ├── EventCard.tsx               ← The card shown on the dashboard per event
    │   ├── ChecklistEditor.tsx         ← Add/remove/tick checklist items + send button
    │   └── steps/                      ← One panel per workflow step
    │       ├── SaleAgreedPanel.tsx     ← Step 1: client + event details form
    │       ├── DocumentPanel.tsx       ← Steps 2, 3, 4: upload/generate/send docs
    │       ├── ChecklistStepPanel.tsx  ← Steps 5, 6: warehouse and driver checklists
    │       ├── SimpleConfirmPanel.tsx  ← Steps 7, 8: one-click confirm panels
    │       ├── InvoicePanel.tsx        ← Step 9: line items + Xero integration
    │       └── ReviewPanel.tsx        ← Step 10: review request via WhatsApp/SMS
    └── lib/                 ← Shared logic and helpers
        ├── prisma.ts        ← Creates the database connection (used everywhere)
        ├── workflow.ts      ← Defines all 10 steps: names, descriptions, icons
        ├── twilio.ts        ← sendWhatsApp(), sendSMS(), message formatters
        ├── xero.ts          ← getXeroClient(), createXeroInvoice()
        ├── docx.ts          ← renderDocxTemplate(), buildTemplateData()
        └── utils.ts         ← Helpers: formatDate(), initials(), daysUntil()
```

---

## The 10-step workflow explained

The workflow is defined in **`src/lib/workflow.ts`**. This is the single source of truth for all step names, descriptions, and behaviour.

Here's what happens technically when a step is completed:

1. The ops manager clicks "Complete" on a step
2. The browser sends a `POST` request to `/api/events/[id]/steps/[stepNumber]/complete`
3. The server (`src/app/api/events/[id]/steps/[stepId]/complete/route.ts`):
   - Marks the current step as `COMPLETE` in the database
   - Marks the next step as `ACTIVE` (unlocking it)
   - Updates the event's `currentStep` number
4. The browser reloads the event and automatically scrolls to the newly unlocked step

**Step statuses:**
- `LOCKED` — greyed out, cannot be accessed
- `ACTIVE` — current step, fully interactive
- `COMPLETE` — done, shown with a green tick

---

## How to make common changes

### Change a step's name or description

Open `src/lib/workflow.ts` and find the step by its number. Edit `title`, `shortTitle`, or `description`.

```typescript
// Example: changing Step 1
{
  number: 1,
  type: "SALE_AGREED",
  title: "Sale Agreed",           // ← shown as the heading in the panel
  shortTitle: "Sale",             // ← shown in the stepper bar at the top
  description: "Client has agreed to proceed...",  // ← shown as subtitle
  completionLabel: "Confirm Sale Agreed",  // ← text on the green button
},
```

---

### Add a new field to the event (e.g. "Budget")

**Step 1 — Add it to the database:**

Open `prisma/schema.prisma`, find the `Event` model, and add a line:
```prisma
model Event {
  ...
  budget    Float?    // ← add this
  ...
}
```

Then run in terminal:
```bash
npm run db:push
```

**Step 2 — Show it in the form:**

Open `src/components/steps/SaleAgreedPanel.tsx`. Copy an existing input field and add your new one:
```tsx
<div>
  <label className="label">Budget (£)</label>
  <input
    type="number"
    value={form.budget}
    onChange={(e) => handleChange("budget", e.target.value)}
    className="input"
    placeholder="5000"
  />
</div>
```

**Step 3 — Save it to the API:**

Open `src/app/api/events/[id]/route.ts` (the PATCH handler) and add `budget` to the data object.

---

### Add a new item to the default warehouse checklist

The checklists are completely dynamic — your ops manager adds items per event. There's no hardcoded default list. If you want a starting template, open `src/components/ChecklistEditor.tsx` and add default items to the `useState` initialiser:

```typescript
// Change this:
const [items, setItems] = useState<ChecklistItem[]>(checklist?.items ?? []);

// To this (pre-populate with defaults when no existing checklist):
const [items, setItems] = useState<ChecklistItem[]>(
  checklist?.items.length
    ? checklist.items
    : [
        { id: crypto.randomUUID(), text: "Espresso machine", quantity: "1", checked: false, sortOrder: 0 },
        { id: crypto.randomUUID(), text: "Grinder", quantity: "2", checked: false, sortOrder: 1 },
        { id: crypto.randomUUID(), text: "Coffee beans", quantity: "5kg", checked: false, sortOrder: 2 },
      ]
);
```

---

### Change the WhatsApp message format

Open `src/lib/twilio.ts`. Find `formatChecklistMessage()` or `formatReviewMessage()` and edit the template string:

```typescript
export function formatReviewMessage(clientName: string, reviewLink?: string): string {
  return `Hi ${clientName}! 🌟\n\nThank you for having us...\n\n${reviewLink}`;
  //          ↑ edit this text freely
}
```

---

### Add a new page (e.g. an analytics page)

Create a new folder and file: `src/app/analytics/page.tsx`

```tsx
export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-espresso-900">Analytics</h1>
      {/* your content */}
    </div>
  );
}
```

Then add it to the sidebar in `src/components/Sidebar.tsx`:
```typescript
const navItems = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/events/new", label: "New Event", icon: "＋" },
  { href: "/clients", label: "Clients", icon: "👤" },
  { href: "/analytics", label: "Analytics", icon: "📊" },  // ← add this
  { href: "/settings", label: "Settings", icon: "⚙" },
];
```

---

### Change the colour scheme

Open `tailwind.config.ts`. The `espresso` colour palette is defined there — change the hex values:

```typescript
espresso: {
  50:  "#FDF8F3",   // background (lightest)
  100: "#F5E9D8",
  200: "#E8CDB0",
  ...
  800: "#3B1F0A",   // primary dark (buttons, sidebar)
  900: "#1F0F03",   // text (darkest)
},
```

---

## Setting up integrations

### Twilio (WhatsApp & SMS)

1. Sign up at [console.twilio.com](https://console.twilio.com)
2. Get your Account SID and Auth Token from the dashboard
3. For WhatsApp: join the Twilio Sandbox (for testing) or apply for a WhatsApp Business number
4. Open `.env` and fill in:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+14155238886
```

5. Restart the app (`Ctrl+C` then `npm run dev`)

---

### Xero (Invoices)

1. Go to [developer.xero.com](https://developer.xero.com) → My Apps → New App
2. Set the redirect URI to: `http://localhost:3000/api/xero/callback`
3. Copy the Client ID and Client Secret
4. Open `.env` and fill in:

```
XERO_CLIENT_ID=your_client_id
XERO_CLIENT_SECRET=your_client_secret
```

5. Restart the app, go to **Settings**, click **Connect Xero**
6. Log in with your Xero credentials — you'll be redirected back and it will say "Connected"

---

### Word document templates

Your templates are `.docx` files with `{{placeholder}}` tags. When the app generates a document, it replaces the placeholders with real event data.

**How to create a template:**
1. Open Word, write your contract/brief as normal
2. Wherever you want dynamic content, type `{{placeholder_name}}`
3. Save as `.docx`
4. Upload it inside the relevant step (e.g. Step 2 → "Upload Template")

**All available placeholders:**

| Placeholder | Replaced with |
|---|---|
| `{{client_name}}` | Client's full name |
| `{{client_company}}` | Client's company name |
| `{{client_email}}` | Client's email address |
| `{{client_phone}}` | Client's phone number |
| `{{client_address}}` | Client's address |
| `{{event_title}}` | Event title |
| `{{event_date}}` | Event date (e.g. "Saturday, 15 June 2024") |
| `{{event_venue}}` | Venue name and address |
| `{{guest_count}}` | Number of guests |
| `{{service_type}}` | e.g. "Espresso bar + cold brew station" |
| `{{package_info}}` | Package name |
| `{{notes}}` | Any notes entered |
| `{{today_date}}` | Today's date (when doc is generated) |

---

## Database

The database is a single file at `prisma/dev.db`. It stores everything: clients, events, steps, checklists, documents, messages.

**To view and edit data visually:**
```bash
npm run db:studio
```
This opens a browser UI at `http://localhost:5555` where you can browse and edit all records.

**To reset the database (WARNING: deletes all data):**
```bash
rm prisma/dev.db
npm run db:push
```

**Database tables:**

| Table | What it stores |
|---|---|
| `Client` | Client name, email, phone, company, address |
| `Event` | Event details: title, date, venue, guests, service type |
| `EventStep` | The 10 steps per event and their status (LOCKED/ACTIVE/COMPLETE) |
| `Checklist` | A warehouse or driver checklist linked to an event |
| `ChecklistItem` | Individual items in a checklist |
| `Document` | Uploaded or generated files linked to an event |
| `Message` | Log of every WhatsApp/SMS sent |
| `Setting` | App settings (e.g. Xero OAuth tokens) |

---

## Deploying to the internet

To make the app accessible to your team (not just your laptop), you'll need to host it. The easiest options:

### Option A — Railway (recommended, simple)
1. Push your code to a private GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add your environment variables (from `.env`) in the Railway dashboard
4. Railway gives you a URL like `https://omda-ops.railway.app`

### Option B — Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. **Note:** Vercel doesn't support SQLite in production — you'd need to switch to a PostgreSQL database (change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`)

### Option C — Your own server (VPS)
Run on any Linux server:
```bash
npm run build
npm run start
```

---

## Quick command reference

```bash
npm run dev          # Start app in development mode (with hot reload)
npm run build        # Build for production
npm run start        # Start in production mode
npm run db:push      # Apply schema changes to the database
npm run db:studio    # Open visual database browser
```
