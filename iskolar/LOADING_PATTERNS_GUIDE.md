# Loading Patterns - Quick Reference Guide

## 🎯 When to Use Each Pattern

### 1. Route-Level Loading (loading.tsx)
**Use for**: Initial page load while Next.js loads the page component

```tsx
// app/[route]/loading.tsx
import BrandedLoader from "@/app/components/ui/BrandedLoader";

export default function Loading() {
  return <BrandedLoader 
    title="Loading Dashboard" 
    subtitle="Fetching analytics..." 
  />;
}
```

✅ **Use when**: User navigates to a new route
✅ **Shows**: Before page component renders
✅ **Duration**: Very brief (Next.js streaming)

---

### 2. Page-Level Gating (usePageGate)
**Use for**: Coordinating multiple data fetches before showing content

```tsx
import { usePageGate } from "@/app/hooks/usePageGate";
import BrandedLoader from "@/app/components/ui/BrandedLoader";

export default function MyPage() {
  const gate = usePageGate({
    users: true,
    settings: true,
    stats: true
  });
  
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      gate.setTaskLoading('users', true);
      const data = await fetchUsers();
      setUsers(data);
      gate.setTaskLoading('users', false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      gate.setTaskLoading('settings', true);
      const data = await fetchSettings();
      setSettings(data);
      gate.setTaskLoading('settings', false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      gate.setTaskLoading('stats', true);
      const data = await fetchStats();
      setStats(data);
      gate.setTaskLoading('stats', false);
    })();
  }, []);

  // Show loader until ALL tasks complete
  if (!gate.allDone()) {
    return <BrandedLoader title="Loading Page" subtitle="Fetching data..." />;
  }

  return <div>{/* Render content */}</div>;
}
```

✅ **Use when**: Page needs multiple async operations before render
✅ **Prevents**: Nested/flash loading states
✅ **Shows**: Single full-page loader until all data ready

---

### 3. Parallel Fetching (Promise.all + usePageGate)
**Use for**: Multiple independent API calls that can run concurrently

```tsx
useEffect(() => {
  (async () => {
    // Run all fetches in parallel
    await Promise.all([
      (async () => {
        gate.setTaskLoading('users', true);
        await timeAsync('fetch-users', async () => {
          const data = await fetchUsers();
          setUsers(data);
        });
        gate.setTaskLoading('users', false);
      })(),
      
      (async () => {
        gate.setTaskLoading('settings', true);
        await timeAsync('fetch-settings', async () => {
          const data = await fetchSettings();
          setSettings(data);
        });
        gate.setTaskLoading('settings', false);
      })(),
      
      (async () => {
        gate.setTaskLoading('audit', true);
        await timeAsync('fetch-audit', async () => {
          const data = await fetchAudit();
          setAudit(data);
        });
        gate.setTaskLoading('audit', false);
      })()
    ]);
  })();
}, []);
```

✅ **Use when**: Multiple independent fetches (no dependencies)
✅ **Performance**: 60%+ faster than sequential
✅ **Best practice**: Always use for 3+ independent calls

---

### 4. One-Time Fetch Guard (useRef)
**Use for**: Preventing re-fetch when dependencies change but data already loaded

```tsx
const fetchedRef = useRef(false);

useEffect(() => {
  // Guard: Only fetch once
  if (fetchedRef.current || data.length === 0) return;
  
  fetchedRef.current = true;
  
  (async () => {
    const result = await fetchData();
    setData(result);
  })();
}, [data, otherDependencies]); // Dependencies may change, but fetch runs ONCE
```

✅ **Use when**: useEffect dependencies include arrays/objects
✅ **Prevents**: Refetch loops from reference changes
✅ **Critical**: Use when parent re-renders may trigger child fetch

---

### 5. Client-Side Pagination (useMemo)
**Use for**: Large datasets (50+ items) to reduce initial render cost

```tsx
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 20;

// Memoized pagination calculation
const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return allData.slice(start, start + pageSize);
}, [allData, currentPage]);

const totalPages = Math.ceil(allData.length / pageSize);

return (
  <div>
    {/* Render only paginatedData */}
    {paginatedData.map(item => <ItemCard key={item.id} {...item} />)}
    
    {/* Pagination controls */}
    <div className="flex gap-2">
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <span>Page {currentPage} of {totalPages}</span>
      
      <button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  </div>
);
```

✅ **Use when**: Dataset has 50+ items
✅ **Performance**: 80%+ faster initial render
✅ **Page size**: 20-50 items recommended

---

### 6. Performance Monitoring (timeAsync)
**Use for**: Development-time performance tracking

```tsx
import { timeAsync } from "@/lib/utils/performance";

useEffect(() => {
  (async () => {
    await timeAsync('fetch-school-years', async () => {
      const response = await fetch('/api/school-years');
      const data = await response.json();
      setSchoolYears(data);
    });
  })();
}, []);

// Console output (dev mode only):
// [PERF] fetch-school-years: 234ms
```

✅ **Use when**: You want to measure operation duration
✅ **Environment**: Dev mode only (zero production overhead)
✅ **Best practice**: Wrap all major fetch operations

---

## 🚫 Anti-Patterns to Avoid

### ❌ Don't: Use separate loading states for each fetch
```tsx
// BAD: Multiple loading states
const [loadingUsers, setLoadingUsers] = useState(true);
const [loadingSettings, setLoadingSettings] = useState(true);
const [loadingStats, setLoadingStats] = useState(true);

if (loadingUsers) return <Loader />;
if (loadingSettings) return <Loader />; // User sees multiple loaders!
if (loadingStats) return <Loader />;
```

✅ **Do**: Use `usePageGate` for coordinated loading
```tsx
// GOOD: Single coordinated loading state
const gate = usePageGate({
  users: true,
  settings: true,
  stats: true
});

if (!gate.allDone()) return <BrandedLoader />; // Single loader
```

---

### ❌ Don't: Sequential fetches for independent data
```tsx
// BAD: Sequential (slow)
const users = await fetchUsers();      // Wait 300ms
const settings = await fetchSettings(); // Wait 250ms
const stats = await fetchStats();       // Wait 200ms
// Total: 750ms
```

✅ **Do**: Parallel fetches with Promise.all
```tsx
// GOOD: Parallel (fast)
await Promise.all([
  fetchUsers(),    // |
  fetchSettings(), // | All run together
  fetchStats()     // |
]);
// Total: 300ms (longest fetch)
```

---

### ❌ Don't: useEffect without fetch guard for array dependencies
```tsx
// BAD: Re-fetches every time schoolYears reference changes
useEffect(() => {
  fetchStats(schoolYears);
}, [schoolYears]); // Array reference changes on every parent render!
```

✅ **Do**: Use useRef guard
```tsx
// GOOD: Fetches only once
const fetchedRef = useRef(false);
useEffect(() => {
  if (fetchedRef.current || schoolYears.length === 0) return;
  fetchedRef.current = true;
  fetchStats(schoolYears);
}, [schoolYears]);
```

---

### ❌ Don't: Render large datasets without pagination
```tsx
// BAD: Renders 500 items immediately
{allAdmins.map(admin => <AdminRow {...admin} />)}
// Initial render: 500ms+
```

✅ **Do**: Use pagination
```tsx
// GOOD: Renders 20 items
const paginatedAdmins = useMemo(() => {
  const start = (currentPage - 1) * 20;
  return allAdmins.slice(start, start + 20);
}, [allAdmins, currentPage]);

{paginatedAdmins.map(admin => <AdminRow {...admin} />)}
// Initial render: 100ms
```

---

### ❌ Don't: Create custom loading screens
```tsx
// BAD: Inconsistent, verbose
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin ...">
        {/* 40 lines of custom JSX */}
      </div>
    </div>
  );
}
```

✅ **Do**: Use BrandedLoader
```tsx
// GOOD: Consistent, concise
import BrandedLoader from "@/app/components/ui/BrandedLoader";

export default function Loading() {
  return <BrandedLoader title="Loading" subtitle="Please wait..." />;
}
```

---

## 📋 Pattern Decision Tree

```
Need to show loading state?
│
├─ Route-level (before page component loads)?
│  └─ Use: loading.tsx with BrandedLoader
│
├─ Page has multiple async operations?
│  ├─ Operations are independent?
│  │  └─ Use: usePageGate + Promise.all + timeAsync
│  │
│  └─ Operations are sequential (depend on each other)?
│     └─ Use: usePageGate with chained awaits
│
├─ Component needs data from parent?
│  ├─ Parent data is array/object?
│  │  └─ Use: useRef guard to prevent refetch loop
│  │
│  └─ Parent data is primitive?
│     └─ Use: Standard useEffect
│
├─ Rendering large dataset (50+ items)?
│  └─ Use: useMemo pagination
│
└─ Need to measure performance?
   └─ Use: timeAsync wrapper
```

---

## 🎨 BrandedLoader Customization

```tsx
// Default
<BrandedLoader />

// With title
<BrandedLoader title="Loading Dashboard" />

// With title and subtitle
<BrandedLoader 
  title="Loading Settings" 
  subtitle="Fetching configuration and audit logs..." 
/>

// Context-specific examples:
<BrandedLoader title="Loading Profile" subtitle="Retrieving scholarship information..." />
<BrandedLoader title="Loading Applications" subtitle="Fetching semester data..." />
<BrandedLoader title="Loading Admin Portal" subtitle="Verifying permissions..." />
```

---

## 🔧 Common Scenarios

### Scenario 1: New Admin Page with Multiple Fetches
```tsx
import { usePageGate } from "@/app/hooks/usePageGate";
import { timeAsync } from "@/lib/utils/performance";
import BrandedLoader from "@/app/components/ui/BrandedLoader";

export default function MyAdminPage() {
  const gate = usePageGate({ data1: true, data2: true });
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);

  useEffect(() => {
    (async () => {
      await Promise.all([
        (async () => {
          gate.setTaskLoading('data1', true);
          await timeAsync('fetch-data1', async () => {
            const res = await fetch('/api/data1');
            const json = await res.json();
            setData1(json);
          });
          gate.setTaskLoading('data1', false);
        })(),
        
        (async () => {
          gate.setTaskLoading('data2', true);
          await timeAsync('fetch-data2', async () => {
            const res = await fetch('/api/data2');
            const json = await res.json();
            setData2(json);
          });
          gate.setTaskLoading('data2', false);
        })()
      ]);
    })();
  }, []);

  if (!gate.allDone()) {
    return <BrandedLoader title="Loading Page" subtitle="Fetching data..." />;
  }

  return <div>{/* Render content */}</div>;
}
```

**Also create**: `app/[route]/loading.tsx`:
```tsx
import BrandedLoader from "@/app/components/ui/BrandedLoader";
export default function Loading() {
  return <BrandedLoader title="Loading" />;
}
```

---

### Scenario 2: Component Receiving Array Prop from Parent
```tsx
export default function MyComponent({ items }: { items: Item[] }) {
  const fetchedRef = useRef(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Guard against refetch when parent re-renders
    if (fetchedRef.current || items.length === 0) return;
    fetchedRef.current = true;

    (async () => {
      const result = await fetchStats(items);
      setStats(result);
    })();
  }, [items]);

  if (!stats) return <div>Loading stats...</div>;
  return <div>{/* Render stats */}</div>;
}
```

---

### Scenario 3: Large Table with Pagination
```tsx
export default function LargeTable({ data }: { data: Item[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div>
      <table>
        {paginatedData.map(item => <TableRow key={item.id} {...item} />)}
      </table>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, data.length)} of {data.length} items
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Performance Targets

| Page Route | Target Load Time | Optimization Used |
|------------|------------------|-------------------|
| `/admin/dashboard` | ≤2s | usePageGate + parallel fetch |
| `/admin/applications` | ≤2s | usePageGate + refetch guard |
| `/admin/settings` | ≤1.5s | Promise.all (3 concurrent) |
| `/admin/admin-management` | ≤500ms | Pagination (20/page) |
| `/admin/users` | ≤2s | Recommended: Add pagination |
| `/scholar/profile` | ≤2s | usePageGate recommended |

---

## 🎯 Quick Wins Checklist

When optimizing a new page:

- [ ] Create `loading.tsx` with `BrandedLoader`
- [ ] Use `usePageGate` if page has 2+ fetches
- [ ] Use `Promise.all` for independent fetches
- [ ] Add `useRef` guard for array/object dependencies
- [ ] Wrap fetches in `timeAsync` for monitoring
- [ ] Add pagination if rendering 50+ items
- [ ] Remove any inline skeleton loaders
- [ ] Test with "Fast 3G" throttling

---

*This guide reflects patterns established in the IskoLAR loading optimization project (January 2025)*
