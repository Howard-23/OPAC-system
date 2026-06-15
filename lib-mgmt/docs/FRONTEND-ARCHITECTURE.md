# Frontend Architecture - Library Management System

## Technology Stack

### Core Framework
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Desktop Framework:** Tauri v2
- **State Management:** React Context + Hooks
- **Routing:** React Router v6

### UI Components
- **Component Library:** Custom components (no external UI library)
- **Styling:** CSS Modules + Tailwind CSS (optional)
- **Icons:** Lucide React or Heroicons
- **Forms:** React Hook Form + Zod validation

### Data Fetching
- **Backend Communication:** Native Tauri invoke commands (no HTTP/Axios)
- **State Management:** React Context + Hooks for local state
- **Real-time:** WebSocket (optional, for future features)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Dialog/
│   ├── Table/
│   ├── Form/
│   └── Layout/
├── pages/                # Page components
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── catalog/
│   │   ├── CatalogList.tsx
│   │   ├── CatalogForm.tsx
│   │   └── HoldingsForm.tsx
│   ├── circulation/
│   │   ├── CheckOut.tsx
│   │   ├── CheckIn.tsx
│   │   └── Renew.tsx
│   ├── reports/
│   │   └── ReportsPage.tsx
│   ├── settings/
│   │   ├── Users.tsx
│   │   ├── Groups.tsx
│   │   └── Locations.tsx
│   └── dashboard/
│       └── Dashboard.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useCatalog.ts
│   ├── useCirculation.ts
│   ├── useDialog.ts
│   └── useToast.ts
├── types/                # TypeScript types
│   ├── index.ts
│   ├── catalog.types.ts
│   ├── circulation.types.ts
│   └── user.types.ts
├── utils/                # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
├── styles/               # Global styles
│   ├── globals.css
│   ├── variables.css
│   └── components.css
└── App.tsx               # Root component
```

## Component Architecture

### Atomic Design Principles

```
Atoms (Basic UI elements)
├── Button
├── Input
├── Label
├── Icon
└── Badge

Molecules (Combinations of atoms)
├── FormField
├── SearchBar
├── Pagination
└── StatusBadge

Organisms (Complex UI sections)
├── DataTable
├── FilterPanel
├── ActionToolbar
└── NavigationTopbar

Templates (Page layouts)
├── AuthLayout
├── DashboardLayout
└── FormLayout

Pages (Complete views)
├── LoginPage
├── CatalogPage
└── CirculationPage
```

## Tauri Native Communication

### Frontend to Backend Commands

The frontend communicates with the Rust backend using Tauri's native `invoke()` command. No HTTP client (Axios) is needed.

### Basic Command Invocation

```typescript
import { invoke } from '@tauri-apps/api/core'

// Simple command invocation
const result = await invoke('command_name', { param1: 'value1', param2: 'value2' })
console.log(result)
```

### Catalog Commands

```typescript
// Get all catalog entries
const catalog = await invoke('get_all_catalog')

// Get specific catalog entry
const entry = await invoke('get_catalog_entry', { controlno: 'ABC123' })

// Create new catalog entry
const created = await invoke('create_catalog_entry', {
  title: 'Test Book',
  author_code: 1,
  call_number: 'QA123',
  edition: '2nd Edition',
  pagination: '250 pages',
  publisher: 'Test Publisher',
  pub_place: 'Test City',
  copyright: '2024',
  isbn: '978-0-123456-78-9',
  subject1_code: 1,
  material: 'Book'
})

// Update catalog entry
const updated = await invoke('update_catalog_entry', {
  controlno: 'ABC123',
  title: 'Updated Title'
})

// Delete catalog entry
await invoke('delete_catalog_entry', { controlno: 'ABC123' })

// Search catalog
const results = await invoke('search_catalog', { query: 'test' })
```

### Circulation Commands

```typescript
// Check out item
const checkedOut = await invoke('checkout_item', {
  accession: 'ACC001',
  idno: 'USER001',
  due_date: '2024-12-31'
})

// Check in item
const checkedIn = await invoke('checkin_item', {
  accession: 'ACC001',
  fine_amount: 5
})

// Renew item
const renewed = await invoke('renew_item', {
  accession: 'ACC001',
  new_due_date: '2025-01-15'
})

// Get user circulation history
const history = await invoke('get_user_circulation', { idno: 'USER001' })

// Get overdue items
const overdue = await invoke('get_overdue_items')
```

### User Commands

```typescript
// Get all users
const users = await invoke('get_all_users')

// Get specific user
const user = await invoke('get_user', { idno: 'USER001' })

// Create user
const created = await invoke('create_user', {
  name: 'John Doe',
  idno: 'USER001',
  group_name: 'Student',
  dept: 'Computer Science',
  phone: '123-456-7890',
  email: 'john@example.com'
})

// Update user
const updated = await invoke('update_user', {
  idno: 'USER001',
  unpaid_fine: 10
})

// Delete user
await invoke('delete_user', { idno: 'USER001' })
```

### Settings/Authority Commands

```typescript
// Get all authors
const authors = await invoke('get_all_authors')

// Create author
const author = await invoke('create_author', {
  author: 'Jane Doe'
})

// Get all subjects
const subjects = await invoke('get_all_subjects')

// Create subject
const subject = await invoke('create_subject', {
  subject: 'Computer Science'
})

// Get all locations
const locations = await invoke('get_all_locations')

// Get all materials
const materials = await invoke('get_all_materials')

// Get all user groups
const groups = await invoke('get_all_groups')

// Create user group
const group = await invoke('create_group', {
  groupname: 'Faculty',
  grp_fine: 10,
  grp_duration: 30,
  grp_limit: 10
})
```

### Report Commands

```typescript
// Generate catalog report
const report = await invoke('generate_catalog_report')

// Generate circulation report
const circReport = await invoke('generate_circulation_report', {
  start_date: '2024-01-01',
  end_date: '2024-12-31'
})

// Generate user report
const userReport = await invoke('generate_user_report')

// Generate fine report
const fineReport = await invoke('generate_fine_report')

// Export report
const exported = await invoke('export_report', {
  report_type: 'catalog',
  format: 'csv'
})
```

### Authentication Commands

```typescript
// Login
const { token, user } = await invoke('login', {
  username: 'admin',
  password: 'password123'
})

// Logout
await invoke('logout')

// Get current user
const currentUser = await invoke('get_current_user')

// Check authentication status
const isAuthenticated = await invoke('is_authenticated')
```

### Error Handling

```typescript
try {
  const result = await invoke('get_catalog_entry', { controlno: 'ABC123' })
  console.log(result)
} catch (error) {
  console.error('Command failed:', error)
  // Handle error - show toast notification
}
```

## Tauri Command Definition (Rust Backend)

### Command Registration

```rust
// src-tauri/src/commands/mod.rs
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GetCatalogEntry {
    pub controlno: String,
}

#[tauri::command]
pub fn get_catalog_entry(
    state: State,
    payload: GetCatalogEntry,
) -> Result<String, String> {
    // Business logic here
    let entry = state.catalog_service.get_entry(&payload.controlno)?;
    Ok(serde_json::to_string(&entry)?)
}

#[tauri::command]
pub fn create_catalog_entry(
    state: State,
    payload: CreateCatalogEntry,
) -> Result<String, String> {
    let entry = state.catalog_service.create(&payload)?;
    Ok(serde_json::to_string(&entry)?)
}
```

### Command Registration

```rust
// src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .manage(tauri::generate_context![])
        .invoke_handler(tauri::generate_handler![
            get_catalog_entry,
            create_catalog_entry,
            update_catalog_entry,
            delete_catalog_entry,
            get_all_catalog,
            search_catalog,
            // ... other commands
        ])
        .run(tauri::generate_context![])
        .expect("error while running tauri application")
}
```

## State Management with Tauri Commands

### Custom Hook for Tauri Commands

```typescript
// hooks/useCatalog.ts
import { invoke } from '@tauri-apps/api/core'

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalog = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await invoke('get_all_catalog')
      setCatalog(result)
    } catch (err) {
      setError('Failed to fetch catalog')
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async (data: CreateCatalogDto) => {
    try {
      const result = await invoke('create_catalog_entry', data)
      setCatalog(prev => [...prev, result])
      return result
    } catch (err) {
      setError('Failed to create entry')
      throw err
    }
  }

  const updateEntry = async (id: string, data: UpdateCatalogDto) => {
    try {
      const result = await invoke('update_catalog_entry', { controlno: id, ...data })
      setCatalog(prev => prev.map(item => 
        item.controlno === id ? result : item
      ))
      return result
    } catch (err) {
      setError('Failed to update entry')
      throw err
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await invoke('delete_catalog_entry', { controlno: id })
      setCatalog(prev => prev.filter(item => item.controlno !== id))
    } catch (err) {
      setError('Failed to delete entry')
      throw err
    }
  }

  return { catalog, loading, error, createEntry, updateEntry, deleteEntry, fetchCatalog }
}
```

### React Query Alternative (Optional)

If you prefer not to use React Query, you can use a simpler state management approach:

```typescript
// hooks/useCatalogState.ts
import { invoke } from '@tauri-apps/api/core'

export function useCatalogState() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalog = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await invoke('get_all_catalog')
      setCatalog(result)
    } catch (err) {
      setError('Failed to fetch catalog')
    } finally {
      setLoading(false)
    }
  }

  return { catalog, loading, error, fetchCatalog }
}
```

## Type Definitions

### API Response Types

```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface CatalogEntry {
  controlno: string
  title: string
  callno?: string
  author_code: number
  edition?: string
  pagination?: string
  publisher?: string
  pubplace?: string
  copyright?: string
  isbn?: string
  subject1_code?: number
  subject2_code?: number
  subject3_code?: number
  series_title?: string
  a_entry_title?: string
  ae_author1_code?: number
  ae_author2_code?: number
  ae_author3_code?: number
  material?: string
  x_notes?: string
}

export interface CreateCatalogEntry {
  title: string
  author_code: number
  call_number?: string
  edition?: string
  pagination?: string
  publisher?: string
  pub_place?: string
  copyright?: string
  isbn?: string
  subject1_code?: number
  subject2_code?: number
  subject3_code?: number
  series_title?: string
  a_entry_title?: string
  ae_author1_code?: number
  ae_author2_code?: number
  ae_author3_code?: number
  material?: string
  x_notes?: string
}

export interface UpdateCatalogEntry {
  title?: string
  author_code?: number
  call_number?: string
  edition?: string
  pagination?: string
  publisher?: string
  pub_place?: string
  copyright?: string
  isbn?: string
  subject1_code?: number
  subject2_code?: number
  subject3_code?: number
  series_title?: string
  a_entry_title?: string
  ae_author1_code?: number
  ae_author2_code?: number
  ae_author3_code?: number
  material?: string
  x_notes?: string
}

export interface User {
  name: string
  idno: string
  group_name: string
  expiry?: string
  dept?: string
  phone?: string
  email?: string
  unpaid_fine: number
}

export interface CreateUser {
  name: string
  idno: string
  group_name: string
  dept?: string
  phone?: string
  email?: string
}

export interface UpdateUser {
  name?: string
  dept?: string
  phone?: string
  email?: string
  unpaid_fine?: number
}

export interface Circulation {
  accession: string
  dte_borrow: string
  dte_due: string
  dte_return?: string
  fine_code?: number
  idno: string
}

export interface CheckoutItem {
  accession: string
  idno: string
  due_date?: string
}

export interface CheckinItem {
  accession: string
  fine_amount?: number
}

export interface RenewItem {
  accession: string
  new_due_date: string
}

export interface Report {
  report_type: string
  format?: string
  data?: any
  generated_at?: string
}
```

## Component Examples

### Catalog List Component

```typescript
// pages/catalog/CatalogList.tsx
import { invoke } from '@tauri-apps/api/core'
import { useCatalogState } from '../../hooks/useCatalogState'

export function CatalogList() {
  const { catalog, loading, error, fetchCatalog, deleteEntry } = useCatalogState()

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
  }

  return (
    <div className="catalog-list">
      <h1>Catalog</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <Table data={catalog} onDelete={handleDelete} />
    </div>
  )
}
```

### Catalog Form Component

```typescript
// pages/catalog/CatalogForm.tsx
import { invoke } from '@tauri-apps/api/core'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = zod.object({
  title: z.string().min(1),
  author_code: z.number().int().positive(),
  call_number: z.string().max(50).optional(),
  edition: z.string().max(50).optional(),
  pagination: z.string().max(50).optional(),
  publisher: z.string().max(100).optional(),
  pub_place: z.string().max(100).optional(),
  copyright: z.string().max(10).optional(),
  isbn: z.string().isbn().optional(),
  subject1_code: z.number().int().optional(),
  subject2_code: z.number().int().optional(),
  subject3_code: z.number().int().optional(),
  series_title: z.string().max(255).optional(),
  material: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof schema>

export function CatalogForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      author_code: 0,
      call_number: '',
      edition: '',
      pagination: '',
      publisher: '',
      pub_place: '',
      copyright: '',
      isbn: '',
      subject1_code: 0,
      subject2_code: 0,
      subject3_code: 0,
      series_title: '',
      material: '',
      notes: ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await invoke('create_catalog_entry', data)
      toast.success('Catalog entry created successfully')
      navigate('/catalog')
    } catch (error) {
      toast.error('Failed to create catalog entry')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

## Performance Considerations

### Native Tauri Communication Benefits

1. **No HTTP overhead:** Direct function calls, no HTTP headers
2. **Type safety:** Rust types enforce data integrity
3. **Faster startup:** No HTTP server needed for local development
4. **Smaller bundle:** No HTTP client libraries needed
5. **Better error handling:** Rust provides detailed error information

### Code Splitting

```typescript
// Lazy loading routes
const CatalogForm = lazy(() => import('./pages/catalog/CatalogForm'))
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
```

### Memoization

```typescript
// Expensive component memoization
const DataTable = memo(({ data, columns }: DataTableProps) => {
  // Component logic
})
```

### Virtual Scrolling

```typescript
// For large data sets
import { useVirtualizer } from '@tanstack/react-virtual'

const VirtualList = ({ items }: { items: any[] }) => {
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  })
  // ...
}
```

## Testing Strategy

### Unit Testing

```typescript
// Testing Tauri commands
import { invoke } from '@tauri-apps/api/core'

describe('Catalog commands', () => {
  it('should get all catalog entries', async () => {
    const result = await invoke('get_all_catalog')
    expect(Array.isArray(result)).toBe(true)
  })

  it('should create a new catalog entry', async () => {
    const result = await invoke('create_catalog_entry', {
      title: 'Test Book',
      author_code: 1
    })
    expect(result).toHaveProperty('controlno')
  })
})
```

### Integration Testing

```typescript
// Testing complete flows
describe('Catalog flow', () => {
  it('should create and display new entry', async () => {
    // Create entry
    const created = await invoke('create_catalog_entry', data)
    
    // Verify it appears in list
    const all = await invoke('get_all_catalog')
    expect(all).toContainEqual(created)
  })
})
```

## Accessibility

### WCAG 2.1 Compliance

- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels

### Implementation

```typescript
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>

<input
  aria-label="Search catalog"
  placeholder="Search..."
  {...register('search')}
/>
```

## Build Configuration

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
})
```

## Deployment

### Development

```bash
npm run tauri dev
```

### Production Build

```bash
npm run tauri build
```

### Output

- Windows: `.exe` installer
- macOS: `.dmg` or `.app`
- Linux: `.AppImage` or `.deb`
