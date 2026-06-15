# Interview Prep — LinkedIn Growth OS (Beginner-Friendly)

Your interview covers **React fundamentals, TypeScript, and systems thinking (APIs, auth, storage)**. This guide teaches each topic using YOUR actual project so you can point to real code when answering.

---

## Table of Contents

1. [React Fundamentals](#1-react-fundamentals)
2. [TypeScript Essentials](#2-typescript-essentials)
3. [APIs — How Frontend Talks to Backend](#3-apis--how-frontend-talks-to-backend)
4. [Authentication — Who Are You?](#4-authentication--who-are-you)
5. [Storage — Where Does Data Live?](#5-storage--where-does-data-live)
6. [Systems Thinking — How It All Fits Together](#6-systems-thinking--how-it-all-fits-together)
7. [Interview Cheat Sheet](#7-interview-cheat-sheet)

---

## 1. React Fundamentals

### What is React?

React is a JavaScript library for building user interfaces. Instead of writing one giant HTML page, you break the UI into **small, reusable pieces called components**.

Think of it like LEGO blocks — each block (component) does one thing, and you snap them together to build the full page.

### How Your App Starts

Everything begins with **3 files** working together:

**Step 1**: The browser loads [index.html](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/index.html):
```html
<body>
  <div id="root"></div>                              <!-- empty box -->
  <script type="module" src="/src/main.tsx"></script> <!-- loads React -->
</body>
```
There's just an empty `<div>`. React will fill it.

**Step 2**: [main.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/main.tsx) mounts the app:
```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />         // ← This is your entire application
  </StrictMode>,
);
```
This says: "Find the `root` div and put the `<App />` component inside it."

**Step 3**: [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx) renders everything.

> [!TIP]
> **Interview tip**: If asked "How does a React app start?", say: "The browser loads an HTML file with an empty div. React's `createRoot` takes over that div and renders the root component, which renders all child components."

---

### What is JSX?

JSX lets you write HTML-like code inside JavaScript. It looks like HTML but it's actually JavaScript.

From your [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L123-L132):
```tsx
const Card = ({ children, className = "" }) => (
  <motion.div className={`glass-card rounded-2xl ${className}`}>
    {children}
  </motion.div>
);
```

This **looks** like HTML, but under the hood, React converts it to:
```js
React.createElement('div', { className: 'glass-card rounded-2xl' }, children)
```

**Key JSX rules:**
- Use `className` instead of `class` (because `class` is a reserved word in JS)
- Use `{}` to put JavaScript expressions inside JSX: `{children}`, `{2 + 2}`, `{user.name}`
- Every JSX element must be closed: `<img />`, `<input />`

---

### Components — The Building Blocks

A **component** is a JavaScript function that returns JSX (what the UI looks like).

Your project has many components. Here's the simplest one — [Badge](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L191-L205):

```tsx
const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    error:   "bg-red-50 text-red-700",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};
```

**What's happening:**
1. `Badge` is a function — that makes it a **functional component**
2. It receives `{ children, variant }` — these are **props** (data passed from parent)
3. `children` is a special prop — it's whatever you put *between* the tags: `<Badge>Hello</Badge>` → children = "Hello"
4. It returns JSX — what React should display

**Using it:**
```tsx
<Badge variant="success">Active</Badge>   // green badge saying "Active"
<Badge variant="error">Failed</Badge>     // red badge saying "Failed"
```

---

### Props — Passing Data to Components

**Props** = properties. They're how parent components send data to child components. Think of them like function arguments.

Your [Button](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L134-L189) component takes many props:

```tsx
const Button = ({ 
  children,          // the text inside the button
  onClick,           // what happens when clicked
  variant = 'primary',  // visual style (default: 'primary')
  disabled = false,  // is it clickable?
  loading = false,   // show spinner?
  icon: Icon         // optional icon component
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : (
        <>
          {Icon && <Icon />}
          {children}
        </>
      )}
    </button>
  );
};
```

**Usage:**
```tsx
<Button variant="primary" onClick={handleSave} loading={isSaving}>
  Save Post
</Button>
```

> [!NOTE]
> **Props are read-only.** A child component can never change the props it receives. If you need to change something, you use **state**.

---

### State — Data That Changes

**State** is data that a component owns and can change. When state changes, React **re-renders** the component (redraws the UI).

You use the `useState` hook:

```tsx
const [step, setStep] = useState('auth');
//      ↑       ↑                  ↑
//   current   function to      initial
//   value     change it         value
```

From your [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L674-L689):
```tsx
const [step, setStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'agent-run'>('auth');
const [workspace, setWorkspace] = useState<Workspace>(() => getSafeWorkspace());
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [currentUser, setCurrentUser] = useState<string | null>(null);
```

Each line creates:
1. A **value** you can read (like `loading`)
2. A **setter function** to update it (like `setLoading`)

**When you call `setLoading(true)`:**
1. React stores the new value
2. React re-renders the component
3. The UI updates to show the loading spinner

**Why not just use a regular variable?**
```tsx
let loading = false;       // ❌ React won't re-render when this changes
const [loading, setLoading] = useState(false);  // ✅ React re-renders on change
```

> [!IMPORTANT]
> **Interview question**: "What's the difference between state and props?"
> **Answer**: "Props are passed FROM a parent and are read-only. State is owned BY the component and can be changed with a setter function. When state changes, the component re-renders."

---

### Hooks — Special Functions for Components

Hooks are functions that start with `use`. They let you "hook into" React features like state and lifecycle events.

#### `useState` — already covered above

#### `useEffect` — Run Code When Something Changes

`useEffect` runs code **after** the component renders. It's used for:
- Fetching data
- Setting up timers
- Syncing with external systems

From your [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L817-L858) — this runs **once** when the app loads (checks if user is already logged in):

```tsx
useEffect(() => {
  (async () => {
    // Check if user has an existing session
    const session = await authService.getCurrentUser();

    if (session?.email) {
      setCurrentUser(session.email);
      
      // Try loading their workspace from the database
      const savedWorkspace = await authService.loadUserWorkspace();
      if (savedWorkspace) {
        setWorkspace(savedWorkspace);
        setStep('dashboard');     // skip login, go straight to dashboard
        return;
      }
      
      setStep('onboarding');      // logged in but no workspace yet
      return;
    }

    // No session → show login
    setStep('auth');
    setShowAuthModal(true);
  })();
}, []);     // ← empty array = run only once, when component first mounts
```

**The dependency array `[]`** controls WHEN the effect runs:

| Code | When it runs |
|------|-------------|
| `useEffect(() => { ... }, [])` | Once, after first render only |
| `useEffect(() => { ... }, [loading])` | Every time `loading` changes |
| `useEffect(() => { ... }, [a, b])` | Every time `a` OR `b` changes |
| `useEffect(() => { ... })` | After EVERY render (usually a mistake) |

Here's another example — from [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L860-L871) this saves the workspace whenever it changes:

```tsx
useEffect(() => {
  // Save workspace to localStorage
  localStorage.setItem('growth-os-workspace', JSON.stringify(workspace));
  
  // Also save to database if logged in
  if (currentUser) {
    authService.saveUserWorkspace(workspace);
  }
}, [workspace, currentUser]);  // ← runs whenever workspace or currentUser changes
```

#### `useCallback` — Optimize Function References

`useCallback` memorizes a function so it doesn't get recreated on every render. Important for performance when passing functions as props.

> [!TIP]
> **Interview tip**: "When would you use `useEffect`?" → "For side effects — things that happen OUTSIDE React, like fetching data from an API, saving to localStorage, or setting up a timer."

---

### Conditional Rendering — Showing/Hiding UI

React lets you show different UI based on conditions. Your app does this everywhere:

**Pattern 1: Ternary operator (if/else)**
```tsx
{loading ? (
  <Loader2 className="animate-spin" />    // show spinner
) : (
  <span>Write my post</span>              // show button text
)}
```

**Pattern 2: Logical AND (show if true)**
```tsx
{error && (
  <div className="bg-red-50 text-red-600">
    {error}
  </div>
)}
```
This means: "If `error` is not null, show the error div."

**Pattern 3: Multiple conditions** — from your [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L674-L676), the entire app switches between screens:
```tsx
const [step, setStep] = useState('auth');

// Later in JSX:
{step === 'auth'       && <AuthModal ... />}
{step === 'onboarding' && <OnboardingForm ... />}
{step === 'dashboard'  && <Dashboard ... />}
{step === 'agent-run'  && <AgentResults ... />}
```

---

### Event Handling

React handles user interactions (clicks, typing, form submissions) with event handlers:

```tsx
// Click handler
<button onClick={() => setStep('dashboard')}>Go to Dashboard</button>

// Input handler
<input 
  value={email}
  onChange={(e) => setEmail(e.target.value)}  // e.target.value = what user typed
/>

// Form submit handler
<form onSubmit={(e) => {
  e.preventDefault();     // stop page from refreshing
  handleLogin();
}}>
```

From your [AuthModal](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L483-L507):
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();          // don't reload the page
  setAuthLoading(true);        // show spinner

  const result = await authService.login(email, password);
  
  if (result.ok) {
    onAuthSuccess(result.email!);   // tell parent "login worked"
  } else {
    setAuthError(result.error);     // show error message
  }
  
  setAuthLoading(false);       // hide spinner
};
```

---

### Lifting State Up

When two components need to share the same data, you **lift the state up** to their closest common parent.

In your app, all state lives in the `App` component. Child components receive data via props and communicate changes via callback functions:

```
App (owns ALL state)
├── AuthModal      → receives onAuthSuccess callback
├── OnboardingForm → receives workspace + setWorkspace
├── Dashboard
│   ├── QuickDraft → receives onGenerate callback
│   └── WeekPlan   → receives runAgent callback
└── AgentResults   → receives agentResult data
```

The `App` component is the "single source of truth." Children don't own data — they just display it and call callbacks to request changes.

---

## 2. TypeScript Essentials

### What is TypeScript?

TypeScript = JavaScript + types. Types tell you **what kind of data** a variable holds.

**Why?**
- Catches bugs before you run the code
- Your editor gives you autocomplete
- Other developers know what your functions expect

### Basic Types

```typescript
let name: string = "Ruchi";           // text
let age: number = 25;                 // number
let isActive: boolean = true;         // true/false
let items: string[] = ["a", "b"];     // array of strings
let value: string | null = null;      // string OR null (union type)
```

### Interfaces — Describing Object Shapes

An interface says "this object must have these fields":

From your [types.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/types.ts#L17-L26):
```typescript
export interface AgentResponse<T = any> {
  ok: boolean;                    // did it succeed?
  agent: AgentId;                 // which agent ran
  version: string;                // API version
  data: T;                        // the actual result (flexible type)
  warnings: { code: string; message: string }[];   // array of warnings
  error?: { code: string; message: string };        // optional error
}
```

**Key things to notice:**
- `?` means **optional** — `error?` means the field might not exist
- `T` is a **generic** — it's a placeholder for any type (explained below)
- `{ code: string; message: string }[]` means "array of objects, each having code and message"

### Union Types — "This OR That"

A union type says a value can be one of several options:

From your [types.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/types.ts#L6-L15):
```typescript
export type AgentId = 
  | 'onboarding' 
  | 'weekly_strategy' 
  | 'post_drafter' 
  | 'post_refiner' 
  | 'publish_pack' 
  | 'engagement_queue' 
  | 'lead_creator' 
  | 'dm_assistant' 
  | 'reporting';
```

This means `AgentId` can ONLY be one of these 9 strings. If you try `const id: AgentId = "hello"`, TypeScript will show an error.

In your app state:
```typescript
const [step, setStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'agent-run'>('auth');
```
`step` can ONLY be one of these 4 values. TypeScript won't let you set it to anything else.

### Generics — "Fill in the Blank" Types

Generics are like **type parameters**. Think of them as a blank you fill in later.

```typescript
// Definition: T is a placeholder
interface AgentResponse<T> {
  data: T;                  // T could be anything
}

// Usage: Fill in T
const response: AgentResponse<string> = { data: "hello" };        // data is string
const response: AgentResponse<number> = { data: 42 };             // data is number
const response: AgentResponse<{ name: string }> = { data: { name: "Ruchi" } };  // data is object
```

Your [GroqService](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/services/groqService.ts#L18) uses this:
```typescript
async runAgent<T>(agentId: AgentId, payload: any): Promise<AgentResponse<T>> {
  // ...
}

// When calling it, you specify what T is:
const response = await groqService.runAgent<any>('onboarding', payload);
```

> [!IMPORTANT]
> **Interview question**: "What's the difference between `type` and `interface`?"
> **Answer**: Both describe object shapes. `interface` can be extended with `extends` and merged. `type` can do unions (`A | B`) and intersections (`A & B`). For objects, either works. For unions, use `type`.

### `type` vs `interface` — Quick Reference

| Feature | `type` | `interface` |
|---------|--------|-------------|
| Object shape | ✅ `type User = { name: string }` | ✅ `interface User { name: string }` |
| Union | ✅ `type Status = 'active' \| 'inactive'` | ❌ Not possible |
| Extending | ✅ `type Admin = User & { role: string }` | ✅ `interface Admin extends User { role: string }` |
| Merging | ❌ | ✅ Two `interface User` declarations merge |

---

## 3. APIs — How Frontend Talks to Backend

### What is an API?

An API (Application Programming Interface) is a **contract** between two systems. In web apps, it usually means: "The frontend sends an HTTP request, and the backend sends back data."

Think of it like ordering food:
- **You** (frontend) → place an order (HTTP request)
- **Kitchen** (backend) → cooks the food and sends it back (HTTP response)
- **Menu** (API contract) → tells you what you can order and what you'll get

### HTTP Methods

| Method | Meaning | Your project uses? |
|--------|---------|-------------------|
| `GET` | "Give me data" | ✅ Health check: `GET /api/v1/health` |
| `POST` | "Here's data, do something with it" | ✅ All agent calls: `POST /api/v1/agents/run` |
| `PUT` | "Replace this data" | ❌ Not used |
| `DELETE` | "Delete this data" | ❌ Not used |

### How Your Frontend Calls the API

From [groqService.ts (client)](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/services/groqService.ts#L18-L41):

```typescript
async runAgent<T>(agentId: AgentId, payload: any): Promise<AgentResponse<T>> {
  // 1. Get the user's auth token
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  // 2. Make the HTTP request
  const response = await fetch('/api/v1/agents/run', {
    method: 'POST',                             // we're SENDING data
    headers: {
      'Content-Type': 'application/json',        // "the body is JSON"
      ...(token ? { Authorization: `Bearer ${token}` } : {}),  // attach auth
    },
    body: JSON.stringify({ agentId, payload }),   // convert JS object to JSON string
  });

  // 3. Parse the response
  return await response.json();                   // convert JSON string back to JS object
}
```

**Breaking it down:**
1. `fetch(url, options)` — browser's built-in function to make HTTP requests
2. `JSON.stringify()` — converts a JS object `{agentId: "post_drafter"}` into a string `'{"agentId":"post_drafter"}'`
3. `response.json()` — converts the response string back into a JS object

### What the Backend Does With It

From [server/index.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/server/index.ts#L29-L93):

```
Request arrives at /api/v1/agents/run
  │
  ├── 1. Rate limit check    → "Have they made too many requests?" → 429 if yes
  ├── 2. Auth check           → "Is their JWT token valid?"        → 401 if no
  ├── 3. Validate agentId     → "Is this a real agent name?"       → 400 if no
  ├── 4. Validate payload     → "Is the body a valid object?"      → 400 if no
  ├── 5. Sanitize payload     → Strip dangerous characters
  ├── 6. Look up agent prompt → Find the right AI instructions
  ├── 7. Call Groq LLM        → Send to AI, get response
  └── 8. Return response      → Send JSON back to frontend
```

### HTTP Status Codes — What They Mean

| Code | Meaning | Your project uses it for |
|------|---------|------------------------|
| `200` | ✅ Success | Agent ran successfully |
| `400` | ❌ Bad request (your fault) | Invalid agent ID or payload |
| `401` | 🔒 Unauthorized | Missing or invalid auth token |
| `405` | ❌ Method not allowed | Used GET instead of POST |
| `429` | ⏱️ Too many requests | Rate limit exceeded |
| `500` | 💥 Server error (our fault) | Something crashed on the server |

### REST API Design

Your API follows **REST** conventions:
- URLs represent **resources**: `/api/v1/agents/run`
- **v1** in the URL is **API versioning** — if you change the API later, you make `/api/v2/` instead of breaking existing clients
- Uses standard HTTP methods (POST for actions)
- Returns JSON responses

> [!TIP]
> **Interview question**: "What is a REST API?"
> **Answer**: "REST is a style of designing APIs around resources. Each resource has a URL, and you use HTTP methods (GET, POST, PUT, DELETE) to interact with them. Responses are typically JSON. APIs are versioned (like /v1/) so you can evolve without breaking existing clients."

---

## 4. Authentication — Who Are You?

### The Problem Auth Solves

Without auth, anyone could:
- Read other people's data
- Use your AI API (costing you money)
- Pretend to be someone else

### How Your Auth Works (Step by Step)

**Step 1: User signs up or logs in**

From [authService.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/services/authService.ts#L53-L70):
```typescript
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  // Supabase checks the password and returns a JWT token
}
```

**Step 2: Supabase returns a JWT token**

A **JWT** (JSON Web Token) is like a digital ID card:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiIxMjM0Iiwi...
```

It contains:
- Who you are (user ID, email)
- When it expires
- A cryptographic signature (proves it hasn't been tampered with)

**Step 3: Frontend sends JWT with every API call**

```typescript
headers: {
  Authorization: `Bearer eyJhbGciOiJIUzI1NiIs...`  // "here's my ID card"
}
```

**Step 4: Backend verifies the JWT**

From [supabaseAuth.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/server/supabaseAuth.ts#L8-L17):
```typescript
export const getUserFromBearer = async (authHeader) => {
  // Extract token from "Bearer <token>"
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  
  // Ask Supabase: "Is this token real and valid?"
  const { data, error } = await supabase.auth.getUser(token);
  
  return data.user ?? null;  // returns user if valid, null if not
};
```

### The Full Flow (Visual)

```
User                    Frontend              Backend            Supabase
  │                        │                     │                  │
  │─── email + password ──→│                     │                  │
  │                        │──── signIn() ──────→│                  │
  │                        │                     │                  │
  │                        │←── JWT token ───────│                  │
  │                        │    (stored in memory)                  │
  │                        │                     │                  │
  │─── "Write my post" ──→│                     │                  │
  │                        │── POST /agents/run ─→│                  │
  │                        │   + Bearer JWT       │                  │
  │                        │                     │── verify JWT ──→│
  │                        │                     │←── user valid ──│
  │                        │                     │                  │
  │                        │                     │── call Groq AI   │
  │                        │                     │                  │
  │                        │←── agent response ──│                  │
  │←── show post draft ───│                     │                  │
```

> [!IMPORTANT]
> **Interview question**: "What is a JWT and why use it?"
> **Answer**: "A JWT is a signed token containing user identity information. The server creates it during login and the client sends it with every request. The server can verify it without hitting the database each time (the signature proves it's genuine). It's stateless — the server doesn't need to store sessions."

---

## 5. Storage — Where Does Data Live?

Your app stores data in **3 places**, each for a different purpose:

### 5.1 localStorage (Browser)

**What**: Key-value storage built into every browser. Data persists even after closing the tab.

**Where your app uses it** — [App.tsx](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/App.tsx#L860-L871):
```typescript
// SAVE
localStorage.setItem('growth-os-workspace', JSON.stringify(workspace));

// LOAD
const saved = localStorage.getItem('growth-os-workspace');
const workspace = JSON.parse(saved);
```

**Pros**: Instant, no network needed, survives page refresh
**Cons**: Only on this browser/device. User can clear it. ~5MB limit.

### 5.2 Supabase PostgreSQL (Database)

**What**: A real database in the cloud. Data persists forever, accessible from any device.

**Where your app uses it** — [authService.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/src/services/authService.ts#L88-L123):
```typescript
// LOAD workspace from database
const { data } = await supabase
  .from('workspaces')          // table name
  .select('workspace')         // column to get
  .eq('user_id', session.userId)  // WHERE user_id = <me>
  .maybeSingle();              // expect 0 or 1 row

// SAVE workspace to database
await supabase
  .from('workspaces')
  .upsert({                    // insert or update
    user_id: session.userId,
    workspace: workspaceData,
  }, { onConflict: 'user_id' }); // if user exists, update their row
```

**The schema** — [schema.sql](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/supabase/schema.sql):
```sql
CREATE TABLE workspaces (
  user_id    UUID PRIMARY KEY,     -- one row per user
  workspace  JSONB NOT NULL,       -- ALL their data in one JSON blob
  updated_at TIMESTAMPTZ           -- when it was last updated
);
```

**Why JSONB?**
- `JSONB` stores a JSON object in a single column
- Flexible — you can add new fields without changing the database schema
- Trade-off: you can't run SQL queries like "find all users whose voice_card tone is 'contrarian'"

### 5.3 Environment Variables (Secrets)

**What**: Configuration values set outside the code. Used for API keys and secrets.

From [.env.example](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/.env.example):
```
GROQ_API_KEY=your_groq_api_key_here     # secret - server only
SUPABASE_URL=your_supabase_url          # not secret - public
VITE_SUPABASE_URL=your_supabase_url     # same URL, but for the frontend
```

**The `VITE_` prefix rule:**

| Variable | Available where | Why |
|----------|---------------|-----|
| `GROQ_API_KEY` | Server only | Secret! Must never reach the browser |
| `VITE_SUPABASE_URL` | Browser + Server | The `VITE_` prefix tells Vite to include it in the frontend build |

> [!IMPORTANT]
> **Interview question**: "How do you handle API keys securely?"
> **Answer**: "API keys that control billing (like Groq) are stored as environment variables on the server only, never exposed to the browser. The frontend calls our own backend, which adds the key server-side. Vite only exposes env vars prefixed with VITE_ to the browser, so non-prefixed keys are automatically protected."

### How the 3 Storage Layers Work Together

```
User logs in
  │
  ├── 1. Check Supabase DB for their workspace     (most reliable)
  │      Found? → Use it, go to dashboard
  │
  ├── 2. Check localStorage for a workspace         (fallback)
  │      Found? → Use it, migrate to Supabase
  │
  └── 3. Nothing found → Start onboarding

User makes changes
  │
  ├── Save to localStorage (instant, offline-safe)
  └── Save to Supabase DB  (durable, cross-device)
```

---

## 6. Systems Thinking — How It All Fits Together

### Client-Server Model

```
┌──────────────┐         HTTP          ┌──────────────┐
│              │  ───── request ─────→ │              │
│   Frontend   │                       │   Backend    │
│  (browser)   │  ←──── response ──── │  (server)    │
│              │                       │              │
└──────────────┘                       └──────────────┘
   React app                           Express/Vercel
   Runs in YOUR                        Runs on a 
   browser                             server somewhere
```

**Why separate them?**
1. **Security**: Server hides API keys from users
2. **Control**: Server can rate-limit, validate, sanitize
3. **Scalability**: Server can handle many users; each user's browser handles their own UI

### Middleware — The Pipeline

Middleware are functions that run **before** your main handler. They form a pipeline:

```
Request → [Rate Limiter] → [Auth Check] → [Sanitizer] → [Handler] → Response
              ↓                  ↓              ↓
            429               401            cleaned data
```

From [server/index.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/server/index.ts#L29):
```typescript
app.post('/api/v1/agents/run', 
  aiRateLimiter,          // middleware 1: rate limit
  async (req, res) => {   // main handler
    // auth check (inline)
    // sanitize (inline)
    // call AI
    // return response
  }
);
```

### Rate Limiting — Preventing Abuse

From [rateLimit.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/server/rateLimit.ts):

```typescript
// In-memory store: IP address → { count, resetAt }
const store = new Map();

// For each request:
// 1. Get the user's IP
// 2. Check: have they made 30+ requests in the last 60 seconds?
//    YES → return 429 "Too Many Requests"
//    NO  → increment counter, let request through
```

**Why?** Each AI call costs money. Without rate limiting, someone could send 10,000 requests and run up your Groq bill.

### Input Sanitization — Preventing Attacks

From [security.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/server/security.ts):

**Problem**: Users can send malicious data in their requests.

**Solution**: Clean EVERYTHING before processing:

| Attack | What it is | How your app prevents it |
|--------|-----------|-------------------------|
| Prototype pollution | Injecting `__proto__` to modify JavaScript's base objects | Block keys: `__proto__`, `prototype`, `constructor` |
| Payload bomb | Sending deeply nested JSON to crash the server | Max depth: 8 levels |
| Giant strings | Sending a 50MB string to overwhelm memory | Max string: 8,000 characters |
| Control chars | Invisible characters that break parsers | Strip all control characters |

### Proxy — Making Dev Easy

From [vite.config.ts](file:///c:/Users/RUCHI%20BHILARE/Downloads/linkedin-growth-os/vite.config.ts#L22-L28):
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8787',  // forward to Express
  },
}
```

**The problem**: Your React app runs on `localhost:3000`. Your API runs on `localhost:8787`. Browsers block requests between different ports (CORS).

**The solution**: Vite acts as a middleman. When the browser calls `/api/v1/agents/run` (port 3000), Vite secretly forwards it to port 8787. The browser thinks it's talking to the same server.

### Deployment — Dev vs Production

| | Development | Production |
|---|---|---|
| **Frontend** | Vite dev server (port 3000) with hot reload | Static files on Vercel CDN |
| **Backend** | Express server (port 8787) | Vercel Serverless Function |
| **How they connect** | Vite proxy forwards `/api` to Express | Same URL — Vercel routes `/api` to the function |
| **Start command** | `npm run dev` | Automatic (Vercel deploys on git push) |

---

## 7. Interview Cheat Sheet

### React Questions

| Question | Answer (use your project as example) |
|----------|--------------------------------------|
| "What is a component?" | "A function that returns JSX. In my project, `Button`, `Card`, `Badge` are reusable components. `App` is the root component that renders everything." |
| "Explain useState" | "It creates a piece of state that the component owns. When you call the setter (like `setLoading(true)`), React re-renders the component. In my project, I use it for tracking the current screen (`step`), loading state, error messages, and the entire workspace data." |
| "Explain useEffect" | "It runs side effects after rendering. I use it to check auth status on mount (empty dependency array), and to save workspace to localStorage and Supabase whenever it changes (workspace in dependency array)." |
| "What is lifting state up?" | "When two child components need the same data, you move the state to their common parent and pass it down as props. In my project, all state lives in the `App` component and flows down to `AuthModal`, `Dashboard`, `QuickDraft`, etc." |
| "Props vs State?" | "Props are passed from parent to child, read-only. State is owned by the component, changeable via setter. Props flow DOWN, events flow UP (via callbacks)." |
| "How do you handle forms?" | "Controlled components — the input's value is driven by React state. `onChange` updates the state, React re-renders the input with the new value. I use this for the login form, onboarding intake, and post editor." |

### TypeScript Questions

| Question | Answer |
|----------|--------|
| "Why TypeScript?" | "It catches bugs at compile time, gives autocomplete, and documents what data looks like. In my project, `AgentId` is a union type of 9 strings — TypeScript won't let me pass an invalid agent name." |
| "What's a generic?" | "A type parameter, like a blank you fill in. My `AgentResponse<T>` interface has a `data: T` field — T can be anything depending on which agent runs. It's like a function argument but for types." |
| "Interface vs Type?" | "Interfaces are for object shapes and can be extended. Types can do unions like `'auth' \| 'dashboard'`. In my project, I use `interface` for `AgentResponse` and `Workspace`, and `type` for `AgentId` (union of strings)." |

### API & Systems Questions

| Question | Answer |
|----------|--------|
| "How does your frontend talk to the backend?" | "The frontend uses `fetch()` to make POST requests to `/api/v1/agents/run`. It sends the agent ID and payload as JSON, with a JWT token in the Authorization header. The backend validates, sanitizes, calls the AI, and returns structured JSON." |
| "How do you handle authentication?" | "Supabase handles auth. User logs in with email/password, gets a JWT token. The token is sent with every API request. The backend verifies it by calling `supabase.auth.getUser(token)`. No passwords stored in my code." |
| "How do you secure API keys?" | "The Groq API key is only in server-side environment variables, never in the browser. The frontend calls our backend, and the backend adds the key. Vite only exposes `VITE_`-prefixed env vars to the browser." |
| "What is rate limiting?" | "It prevents abuse by limiting how many requests an IP can make per time window. My app allows 30 requests per 60 seconds. After that, the server returns 429 with a Retry-After header." |
| "How do you store data?" | "Three layers: localStorage for instant reads, Supabase PostgreSQL for persistence across devices, and environment variables for secrets. The workspace is stored as JSONB in a single row per user." |
| "What is Row Level Security?" | "Supabase's way of ensuring users can only access their own data. Even though the database key is public, RLS policies check `auth.uid() = user_id` on every query, so user A can't read user B's workspace." |
| "What is middleware?" | "Functions that process a request before it reaches the main handler. In my app, the rate limiter is middleware — it checks the request count before the auth check or AI call happens. It's like a security checkpoint before entering a building." |
| "How does your app work in production?" | "The React frontend is a static build served from Vercel's CDN. The API is a Vercel Serverless Function that starts on-demand when a request comes in. Supabase and Groq are external cloud services." |

### If They Ask "Walk Me Through a Feature"

**Pick the post generation flow:**

> "When a user types a topic and clicks 'Write my post':
> 1. React builds a payload object with the topic, selected voice, and their profile data from the workspace state
> 2. The `groqService` sends a POST request to `/api/v1/agents/run` with `{agentId: 'post_drafter', payload}`
> 3. The JWT token from their Supabase session is attached in the Authorization header
> 4. The Express backend rate-limits, verifies the JWT, sanitizes the input, and looks up the `post_drafter` prompt
> 5. It combines the shared system prompt with the agent-specific prompt and sends it to Groq's Llama 3.3 70B model
> 6. The AI returns structured JSON with the post body, hook, hashtags, and performance prediction
> 7. The backend sends this back to the frontend
> 8. React updates the workspace state, saves to localStorage and Supabase, and shows the generated post
> 9. The user can edit, regenerate (which switches to the `post_refiner` agent), or copy to LinkedIn"

---

## Quick Glossary

| Term | Plain English |
|------|--------------|
| **SPA** | Single Page App — one HTML page, React handles all navigation |
| **JSX** | HTML-like syntax inside JavaScript |
| **Component** | A function that returns UI |
| **Props** | Data passed from parent to child component |
| **State** | Data owned by a component that causes re-renders when changed |
| **Hook** | Special function (like useState, useEffect) that adds features to components |
| **JWT** | Signed token proving who you are |
| **REST** | API design style using URLs + HTTP methods |
| **Middleware** | Function that processes requests before the main handler |
| **CORS** | Browser security rule blocking cross-origin requests |
| **Proxy** | Middleman that forwards requests to another server |
| **JSONB** | PostgreSQL column type for storing JSON objects |
| **RLS** | Row Level Security — database rules that restrict access per user |
| **Serverless** | Code that runs on-demand (no always-on server) |
| **CDN** | Content Delivery Network — serves static files from edge servers close to users |
| **Environment Variables** | Configuration values set outside the code |
| **Rate Limiting** | Restricting how many requests a user can make per time period |
| **Sanitization** | Cleaning input data to prevent attacks |

Good luck with your interview! 🚀
