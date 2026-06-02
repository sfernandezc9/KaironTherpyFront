# KaironTherapy Frontend — Architecture Reference

> Quick-start context for Claude sessions. Read this before touching any code.

---

## Stack

| Layer | Tool |
|---|---|
| Build | Vite 8 + TypeScript (strict) |
| UI | React 19 + TailwindCSS v3 (no component library) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 (`useQuery` / `useMutation`) |
| HTTP | Axios (singleton `src/api/client.ts`) |
| Auth | JWT in `localStorage`, injected as `Authorization: Bearer <token>` header |

---

## Directory structure

```
src/
├── api/              # One file per entity — typed async functions only
│   ├── client.ts     # Axios instance (base URL, interceptors)
│   ├── auth.ts       # login(), getMe()
│   ├── empresas.ts
│   ├── sucursales.ts
│   ├── pacientes.ts
│   ├── terapeutas.ts
│   ├── insumos.ts
│   ├── stock.ts
│   ├── fichas.ts
│   ├── sesiones.ts
│   ├── historial.ts
│   └── informes.ts
│
├── types/            # One file per entity — pure interfaces, no logic
│   ├── auth.ts       # Usuario, LoginForm, LoginResponse, Rol
│   ├── empresa.ts / sucursal.ts / persona.ts / paciente.ts
│   ├── terapeuta.ts / insumo.ts / stock.ts / ficha.ts
│   ├── sesion.ts / historial.ts / informe.ts
│
├── context/
│   ├── AuthContext.tsx   # JWT auth state, role helpers, setAuth/logout
│   └── ToastContext.tsx  # Global toast notifications (showToast)
│
├── components/
│   ├── auth/
│   │   └── PrivateRoute.tsx   # Route guard (optional requiredRole prop)
│   ├── layout/
│   │   ├── Layout.tsx         # Sidebar + main area shell; mobile hamburger
│   │   └── Sidebar.tsx        # Nav links; role-aware visibility
│   └── ui/                    # All built from scratch with Tailwind
│       ├── Button.tsx         # variants: primary/secondary/danger/ghost
│       ├── Input.tsx          # + TextArea export
│       ├── Select.tsx
│       ├── Modal.tsx          # ESC key closes; backdrop click closes
│       ├── ConfirmDialog.tsx  # Wraps Modal; used before every DELETE
│       ├── Table.tsx          # Generic sortable table (Column<T> type)
│       ├── Tabs.tsx           # Tabs + TabPanel components
│       ├── Badge.tsx          # + StockBajoBadge export
│       ├── Card.tsx
│       └── Spinner.tsx        # + PageSpinner export
│
├── pages/
│   ├── Login/LoginPage.tsx
│   ├── Dashboard.tsx
│   ├── Pacientes/
│   │   ├── PacientesList.tsx   # Search + filter table; create modal
│   │   └── PacienteDetail.tsx  # 3 tabs: Datos / Ficha clínica / Sesiones
│   ├── Terapeutas/
│   │   ├── TerapeutasList.tsx
│   │   └── TerapeutaDetail.tsx # 3 tabs: Datos / Sucursales / Sesiones
│   ├── Sesiones/SesionesList.tsx   # Filter bar + detail modal + insumos
│   ├── Insumos/InsumosPage.tsx     # 2 tabs: Catálogo / Stock
│   ├── Estructura/EstructuraPage.tsx # 2 tabs: Empresas / Sucursales
│   └── Informes/InformesPage.tsx
│
├── utils/
│   └── format.ts   # formatRut, formatDate, formatDateTime, formatDateInput
│
├── App.tsx         # Route tree (see Routes section)
├── main.tsx        # React root, providers order
└── style.css       # @tailwind directives + base reset + animate-fade-in
```

---

## Auth system

### Roles
- `administrador` — full access to all routes and actions
- `terapeuta` — read pacientes/sesiones; create/edit own sesiones; no access to Terapeutas/Insumos/Estructura/Informes routes

### Flow
1. `POST /auth/login` → `{ token, usuario }` → stored in `localStorage`
2. On mount, `AuthProvider` reads token, sets `Authorization` header, calls `GET /auth/me` to hydrate user
3. 401 response from any endpoint → `client.ts` interceptor clears token and redirects to `/login`

### Key hooks
```ts
const { user, isAdmin, isTerapeuta, setAuth, logout, loading } = useAuth();
```

### PrivateRoute
```tsx
// Redirect to /login if unauthenticated
<PrivateRoute>...</PrivateRoute>

// Show "Acceso denegado" if wrong role
<PrivateRoute requiredRole="administrador">...</PrivateRoute>
```

---

## Routes

```
/login                    — LoginPage (no auth required)
/                         — Dashboard
/pacientes                — PacientesList
/pacientes/:id            — PacienteDetail
/terapeutas               — TerapeutasList        [admin only]
/terapeutas/:id           — TerapeutaDetail       [admin only]
/sesiones                 — SesionesList
/insumos                  — InsumosPage           [admin only]
/estructura               — EstructuraPage        [admin only]
/informes                 — InformesPage          [admin only]
```

---

## Backend API

Base URL: `http://localhost:3000/api`

All responses JSON. Errors: `{ error: string }`.

### Entities & primary endpoints

| Entity | Base path | Notes |
|---|---|---|
| Auth | `/auth/login`, `/auth/me` | JWT |
| Empresa | `/empresas` | CRUD + `/empresas/:id/sucursales` |
| Sucursal | `/sucursales` | CRUD + `/sucursales/:id/terapeutas` + `/sucursales/:id/stock` |
| Persona | `/personas` | CRUD |
| Paciente | `/pacientes` | Creates persona+paciente atomically |
| Terapeuta | `/terapeutas` | Creates persona+terapeuta atomically |
| Insumo | `/insumos` | CRUD |
| Stock | `/stock` | CRUD + `PATCH /stock/:id/ajustar { delta }` |
| Ficha clínica | `/fichas` | PUT requires `id_terapeuta` for audit trail |
| Sesión | `/sesiones` | CRUD + insumos sub-resource |
| Historial | `/historial` | Read-only audit log |
| Informe | `/informes` | CRUD |

### Special endpoints
- `GET /stock/bajo-minimo` — stock items below minimum
- `GET /fichas/:id/historial` — audit log of clinical record changes
- `GET /sesiones/:id/insumos` — insumos used in a session
- `POST /sesiones/:id/insumos` — deducts stock
- `DELETE /sesiones/:id/insumos/:id_uso` — restores stock
- `POST /terapeutas/:id/sucursales` — assign branch
- `PUT /terapeutas/:id/sucursales/:id_sucursal/desasignar` — unassign branch
- `GET /sesiones/stock-sucursal/:id` — terapeuta-scoped stock view

---

## Key patterns

### Query keys convention
```ts
['pacientes']               // list
['paciente', id]            // single
['ficha', id_paciente]      // by patient
['fichaHistorial', id_ficha]
['sesiones', filters]       // filtered list
['sesionInsumos', id_sesion]
['sucursalStock', id_sucursal]
['terapeutaSucursales', id]
['stock', 'bajo-minimo']
```

### Mutation pattern
```ts
const mut = useMutation({
  mutationFn: createPaciente,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['pacientes'] });
    showToast('Paciente creado', 'success');
  },
  onError: (e: Error) => showToast(e.message, 'error'),
});
```

### Toast
```ts
const { showToast } = useToast();
showToast('Mensaje', 'success' | 'error' | 'info');
```

### Confirm before delete (always)
```tsx
<ConfirmDialog
  open={deleteId !== null}
  message="¿Eliminar este registro?"
  onConfirm={() => deleteMut.mutate(deleteId!)}
  onCancel={() => setDeleteId(null)}
  loading={deleteMut.isPending}
/>
```

### Generic Table
```tsx
const columns: Column<Paciente>[] = [
  { key: 'rut', header: 'RUT', sortable: true, accessor: (r) => r.rut, render: (r) => formatRut(r.rut) },
];
<Table columns={columns} data={data} keyExtractor={(r) => r.id_paciente} onRowClick={(r) => navigate(...)} />
```

---

## Design tokens

| Token | Value |
|---|---|
| Primary color | `#0f5c5c` (teal-800 = `primary-800`) |
| Sidebar bg | `bg-slate-100` |
| Page bg | `bg-white` |
| Font | Inter / system-ui |
| Border radius | `rounded-lg` (inputs, buttons), `rounded-xl` (cards, modals) |

### Estado sesión chips
- `realizada` → `green`
- `pendiente` → `yellow`
- `cancelada` → `red`

---

## Dev commands

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # tsc + vite build
npm run preview  # preview production build
```

---

## Pending / known gaps

- `src/main.ts` and `src/counter.ts` exist as empty stubs (vanilla Vite template remnants) — do not delete, they don't affect the build
- No unit tests yet
- No React Query DevTools installed
- `getStockSucursalSesion` in `sesiones.ts` assumes endpoint `GET /sesiones/stock-sucursal/:id` — verify with backend
