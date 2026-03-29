---
name: frontend
phase: 4
always_active: false
absorbs: frontend-developer, react-best-practices
description: "Frontend implementation — React 19+, Next.js 15+, performance optimization, hooks, server components, state management"
keywords: [frontend, React, Next.js, componente, hook, server component, client component, Suspense, Actions, performance, memoization, state]
---

# Frontend

> Phase 4 — Modern React 19+ and Next.js 15+ implementation patterns, performance optimization, and best practices.

## 1. React 19+ Core Features

### The `use` Hook

React 19 introduces `use` as a first-class way to read resources (promises, context) during render. This replaces the `useEffect + useState` pattern for data fetching and enables conditional context reading.

```tsx
// Reading a promise during render
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// Reading context conditionally (impossible with useContext)
function ThemeButton({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext);
    return <button className={theme.buttonClass}>Themed</button>;
  }
  return <button>Default</button>;
}
```

### Actions and Form Handling

Actions replace manual `onSubmit` handlers with integrated pending states and error handling. Server Actions are marked with `"use server"` and handle form submissions securely.

```tsx
// Server Action (defined in a server module or file)
"use server";
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.posts.create({ title });
  revalidatePath("/posts");
}

// Client component consuming the action
function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

### Optimistic Updates with `useOptimistic`

Optimistic updates provide instant feedback to the user while the server processes the request. Update the UI first, then reconcile with the server response.

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(formData: FormData) {
    const title = formData.get("title") as string;
    addOptimisticTodo({ id: crypto.randomUUID(), title, pending: true });
    await createTodo(title); // server action
  }

  return (
    <form action={addTodo}>
      <input name="title" />
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.6 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

## 2. Server Components vs Client Components

### Decision Tree

Use this decision tree when choosing component boundaries:

1. Does the component need browser APIs (`window`, `localStorage`, event listeners)? → **Client Component**
2. Does it need React state or lifecycle effects (`useState`, `useEffect`)? → **Client Component**
3. Does it use interactivity (`onClick`, `onChange`, `onSubmit` handlers)? → **Client Component**
4. Does it only display data fetched from a database or API? → **Server Component**
5. Does it access backend resources directly (database, filesystem)? → **Server Component**
6. Does it keep sensitive data server-side (API keys, tokens)? → **Server Component**

**Default to Server Components.** Only add `"use client"` when you need interactivity.

### Server Components (Default)

Server components run only on the server and send rendered HTML to the client. They:
- Directly access databases and private APIs
- Keep sensitive data server-side
- Return static or pre-rendered content
- Reduce client bundle size

```tsx
// app/posts/page.tsx -- Server Component (no "use client")
// Direct database/API access without useEffect or client-side fetching
async function PostsPage() {
  const posts = await db.posts.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Client Components

Client components run in the browser and enable interactivity. Mark them with `"use client"` at the top of the file.

```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Push `"use client"` to leaf components** to keep the server component tree as large as possible.

## 3. Data Fetching & Caching Strategies

### Caching and Revalidation

Next.js provides multiple strategies for data freshness:

- `fetch(url, { cache: "force-cache" })` — Cache indefinitely (static generation)
- `fetch(url, { next: { revalidate: 3600 } })` — Revalidate every hour (ISR)
- `fetch(url, { cache: "no-store" })` — Always fresh (dynamic rendering)
- `revalidatePath("/posts")` — On-demand revalidation from server actions
- `revalidateTag("posts")` — Tag-based revalidation

### Metadata API

Manage page titles, descriptions, and OpenGraph data for SEO and social sharing.

```tsx
// Static metadata
export const metadata: Metadata = {
  title: "My App",
  description: "App description for SEO",
  openGraph: { title: "My App", description: "Shared on social media" },
};

// Dynamic metadata based on params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  };
}
```

## 4. Performance Optimization

### Memoization: When NOT to Use

Memoization (`memo`, `useMemo`, `useCallback`) has a cost. It consumes memory, adds code complexity, and can mask real performance issues.

**Do NOT memoize when:**
1. The component is cheap to render (simple JSX, no expensive computation)
2. Props change on every render anyway (new object/array literals passed as props)
3. The value is a primitive (strings, numbers, booleans are compared by value)
4. You are prematurely optimizing (profile first with React DevTools Profiler)

**DO memoize when:**
1. Expensive computations (`useMemo` for filtering/sorting large lists, complex calculations)
2. Stable callback references (`useCallback` when passing callbacks to memoized children)
3. Large subtrees (`memo` for expensive-to-render component trees with stable props)
4. Context consumers (memoize to prevent cascading re-renders)

```tsx
// BAD: memoizing a trivial component
const Label = memo(({ text }: { text: string }) => <span>{text}</span>);

// GOOD: memoizing an expensive list
const ExpensiveList = memo(({ items }: { items: Item[] }) => (
  <ul>{items.map((item) => <ComplexRow key={item.id} item={item} />)}</ul>
));

// GOOD: useMemo for expensive filtering
const filtered = useMemo(
  () => items.filter((item) => matchesSearch(item, query)),
  [items, query]
);
```

### React Compiler (React 19)

React 19 includes an experimental compiler that automatically optimizes your code at build time.

**What it does:**
- Analyzes code and inserts memoization where beneficial
- Removes most manual `useMemo`, `useCallback`, and `memo` calls
- Respects the Rules of React (pure components, no side effects during render)

**Setup (Next.js 15):**

```js
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

**Important:** The compiler cannot optimize code that violates React rules. Ensure components are pure and side-effect-free during render.

### Bundle Analysis

Identify and optimize large dependencies and unnecessary imports.

**Setup:**

```bash
npm install @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

**What to look for:**
1. Large dependencies — replace heavy libraries with lighter alternatives (e.g., `date-fns` instead of `moment`, `clsx` instead of `classnames`)
2. Duplicate packages — multiple versions of the same library in the bundle
3. Unnecessary imports — importing entire libraries when only one function is needed
4. Client-side code that should be server-only — database clients, API keys

### Code Splitting and Lazy Loading

**Dynamic Imports:**

```tsx
import dynamic from "next/dynamic";

// Lazy load heavy components
const MarkdownEditor = dynamic(() => import("@/components/markdown-editor"), {
  loading: () => <EditorSkeleton />,
  ssr: false, // disable SSR for client-only components
});

// Lazy load below-the-fold content
const Comments = dynamic(() => import("@/components/comments"));
```

**Route-Level Code Splitting:**

Next.js App Router automatically code-splits by route. Each `page.tsx` is a separate chunk. To optimize further:
- Move heavy client components into separate files and use `dynamic()`
- Use `React.lazy` for client-side-only component trees
- Keep `"use client"` boundaries as low in the tree as possible

**Lazy Loading Strategies:**

```tsx
// Intersection Observer pattern for below-fold content
function LazySection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { rootMargin: "200px" } // load 200px before viewport
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <Skeleton />}</div>;
}
```

### Image Optimization with next/image

Always use `next/image` for automatic optimization, responsive sizing, and lazy loading.

```tsx
import Image from "next/image";

// Above-the-fold hero image
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority              // preload above-the-fold images
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover rounded-lg"
/>

// User avatars and dynamic images
<Image
  src={user.avatarUrl}
  alt={user.name}
  width={48}
  height={48}
  className="rounded-full"
/>
```

**Rules:**
- Always set `priority` on above-the-fold and LCP (Largest Contentful Paint) images
- Always provide `sizes` for responsive images to avoid loading oversized images
- Use `placeholder="blur"` with `blurDataURL` for perceived performance
- Configure `remotePatterns` in `next.config.js` for external image domains

## 5. State Management Patterns

### When to Use What

| Pattern | Use Case |
|---------|----------|
| `useState` | Local UI state (open/closed, input values, toggle states) |
| `useReducer` | Complex local state with multiple sub-values or complex transitions |
| React Context | Theme, locale, auth — rarely changing, few consumers |
| Zustand | Global client state, frequent updates, multiple consumers |
| Server state (RSC) | Data from database/API, rendered on server |
| URL state (`searchParams`) | Filters, pagination, shareable state |

### Context vs Zustand

**Use Context when:**
- State changes rarely (theme toggle, user session)
- Only a few components consume it
- You want zero external dependencies

**Use Zustand when:**
- State changes frequently (typing, drag-and-drop, real-time data)
- Many components consume the same state (avoids Context re-render cascade)
- You need derived state (selectors) without extra memoization
- You need state persistence (localStorage, sessionStorage)

**Zustand pattern:**

```tsx
import { create } from "zustand";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

// Use selectors to prevent unnecessary re-renders
const itemCount = useCartStore((state) => state.items.length);
```

## 6. Render Optimization Checklist

1. **Move state down** — Keep state in the lowest component that needs it
2. **Lift content up** — Pass children as props to avoid re-rendering static content
3. **Split components** — Separate frequently-changing state from expensive render trees
4. **Use selectors** — With Zustand, select only the data each component needs
5. **Avoid inline objects/arrays as props** — Create them outside render or memoize them
6. **Key lists properly** — Use stable, unique IDs; never array indices for dynamic lists
7. **Debounce expensive updates** — For search inputs, resize handlers, scroll listeners
8. **Profile before optimizing** — Use React DevTools Profiler to identify actual bottlenecks

## 7. Error Boundaries & Loading States

### File Structure

```
app/
  layout.tsx          -- Root layout (wraps everything)
  error.tsx           -- Root error boundary
  loading.tsx         -- Root loading state (shows during Suspense)
  posts/
    page.tsx          -- Posts list page
    error.tsx         -- Posts-specific error boundary
    loading.tsx       -- Posts-specific loading skeleton
    [slug]/
      page.tsx        -- Individual post
      not-found.tsx   -- Custom 404 for missing posts
```

### Error Boundary Pattern

Error boundaries must be client components. They catch errors from their children and display a fallback UI.

```tsx
// app/posts/error.tsx
"use client";

export default function PostsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-900 font-bold">Something went wrong</h2>
      <p className="text-red-700 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
```

### Loading State Pattern

Loading states provide skeleton screens and placeholders during data fetching with Suspense.

```tsx
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
```

## 8. Advanced Patterns

### Parallel Routes

Parallel routes allow rendering multiple pages simultaneously in the same layout. Useful for dashboards with independent sections (analytics panel, feed, main content).

```
app/
  @analytics/
    page.tsx          -- Analytics panel
  @feed/
    page.tsx          -- Feed panel
  layout.tsx          -- Receives both as props
  page.tsx            -- Main content
```

```tsx
// app/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  feed,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  feed: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <main className="col-span-2">{children}</main>
      <aside>
        {analytics}
        {feed}
      </aside>
    </div>
  );
}
```

### Streaming with Suspense

Use `<Suspense>` boundaries to progressively render content. Combine with `loading.tsx` or explicit fallback components.

```tsx
import { Suspense } from "react";

export default function PostsPage() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />
      </Suspense>
    </div>
  );
}
```

## 9. Key Conventions

- **File conventions:** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.tsx`
- **Colocation:** Keep components, utils, and tests near their route segments
- **Server-first:** Start with Server Components, push `"use client"` to leaf components only
- **Type safety:** Use `generateStaticParams` return type for dynamic routes
- **Streaming:** Use `<Suspense>` boundaries to progressively render content
- **Actions for mutations:** Prefer Server Actions over API routes for form submissions and mutations
