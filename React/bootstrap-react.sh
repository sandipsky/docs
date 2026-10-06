#!/usr/bin/env bash
# =============================================================================
#  bootstrap-react.sh - scaffold a React + TypeScript starter
#  (Linux / macOS / Git Bash). On Windows PowerShell use bootstrap-react.ps1.
#
#  What you get
#    - Vite + React 19 + TypeScript + React Compiler + ESLint (npm create vite)
#    - axios, TanStack Router (file-based routes + devtools), TanStack Query,
#      zustand, zod, react-hook-form, SCSS
#    - src/{config,features/{auth,home,products},lib,providers,routes}
#    - .env + .env.example (.env is git-ignored), `@/` -> `src/` alias
#    - Express mock API: login (admin / admin) + product CRUD, file-backed
#
#  Usage
#    ./bootstrap-react.sh                      # asks for everything
#    ./bootstrap-react.sh my-app               # name given, asks about install
#    ./bootstrap-react.sh my-app --install     # no prompts: install + start
#    ./bootstrap-react.sh my-app --no-install  # no prompts: scaffold only
#
#  Requires Node.js 20.19+ / 22.12+ and npm on your PATH.
# =============================================================================
set -euo pipefail

# ---- pretty printing --------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\e[1m' GREEN=$'\e[32m' YELLOW=$'\e[33m' RED=$'\e[31m' CYAN=$'\e[36m' RESET=$'\e[0m'
else
  BOLD='' GREEN='' YELLOW='' RED='' CYAN='' RESET=''
fi
info() { printf '%s>%s %s\n' "$CYAN" "$RESET" "$*"; }
warn() { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*"; }
fail() { printf '%sx %s%s\n' "$RED" "$*" "$RESET" >&2; exit 1; }

usage() {
  cat <<'__USAGE__'
Usage: bootstrap-react.sh [project-name] [--install | --no-install]

  project-name   Folder to create (letters, numbers, . _ -). Prompted for if omitted.
  --install      Skip the prompt: install node_modules and start the dev servers.
  --no-install   Skip the prompt: scaffold only.
__USAGE__
}

# ---- arguments --------------------------------------------------------------
PROJECT_NAME=''
INSTALL=''   # '' = ask, y = install + start, n = scaffold only
for arg in "$@"; do
  case "$arg" in
    --install)    INSTALL=y ;;
    --no-install) INSTALL=n ;;
    -h|--help)    usage; exit 0 ;;
    -*)           fail "Unknown option: $arg (try --help)" ;;
    *)            PROJECT_NAME="$arg" ;;
  esac
done

# ---- prerequisites ----------------------------------------------------------
command -v node >/dev/null 2>&1 || fail 'node was not found. Install Node.js 20.19+ or 22.12+ first.'
command -v npm  >/dev/null 2>&1 || fail 'npm was not found. It normally ships with Node.js.'
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  warn "Node $(node -v) detected. Vite needs 20.19+ or 22.12+; expect trouble."
fi

# ---- 1. project name --------------------------------------------------------
while :; do
  if [ -z "$PROJECT_NAME" ]; then
    read -r -p 'Project name: ' PROJECT_NAME
  fi
  if ! [[ "$PROJECT_NAME" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
    warn "Use letters, numbers, '.', '_' or '-' only (no spaces). Try again."
    PROJECT_NAME=''
  elif [ -e "$PROJECT_NAME" ] && [ -n "$(ls -A "$PROJECT_NAME" 2>/dev/null)" ]; then
    warn "'$PROJECT_NAME' already exists and is not empty. Pick another name."
    PROJECT_NAME=''
  else
    break
  fi
done

# ---- 2. install now? --------------------------------------------------------
if [ -z "$INSTALL" ]; then
  read -r -p 'Install node_modules and start the dev servers now? (y/N) ' answer
  case "$answer" in
    y|Y|yes|YES|Yes) INSTALL=y ;;
    *)               INSTALL=n ;;
  esac
fi

# ---- 3. scaffold with create-vite -------------------------------------------
# --template react-compiler-ts : React + TypeScript + React Compiler
# --eslint                     : ESLint instead of the (new) Oxlint default
# --no-immediate               : do not run `npm install` / `npm run dev` yet
# --no-interactive             : never stop to ask questions
# --yes (before the --)        : tells npm itself not to ask "Ok to proceed?"
info "Scaffolding '$PROJECT_NAME' with create-vite (react-compiler-ts + ESLint)..."
npm create vite@latest "$PROJECT_NAME" --yes -- \
  --template react-compiler-ts --eslint --no-immediate --no-interactive
cd "$PROJECT_NAME"

# Template leftovers that our own structure replaces
rm -f src/App.tsx src/App.css src/index.css src/assets/hero.png

# write_file <path>   (content comes on stdin; __PROJECT_NAME__ gets replaced)
write_file() {
  mkdir -p "$(dirname "$1")"
  sed "s|__PROJECT_NAME__|${PROJECT_NAME}|g" > "$1"
  printf '  %s\n' "$1"
}

info 'Writing project files...'

# ---- Project config --------------------------------------------------------------
write_file 'vite.config.ts' <<'__TPL__'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must run before react(): scans src/routes/ and generates src/routeTree.gen.ts
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    // React Compiler (automatic memoisation) via Babel
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      // `@/` -> `src/` (mirrored in tsconfig.app.json "paths")
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
__TPL__

write_file 'tsconfig.app.json' <<'__TPL__'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,

    /* Path alias: `@/x` -> `src/x` (mirrored in vite.config.ts resolve.alias) */
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
__TPL__

write_file 'eslint.config.js' <<'__TPL__'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // routeTree.gen.ts is generated code - never lint it
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // TanStack Router file routes export a `Route` object and usually define
    // their component right next to it. The react-refresh rule flags that
    // pattern, but Vite + TanStack Router hot-reload route files just fine.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
__TPL__

write_file 'index.html' <<'__TPL__'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>__PROJECT_NAME__</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
__TPL__

write_file '.env.example' <<'__TPL__'
# Copy this file to `.env` and adjust the values. `.env` is git-ignored.
# Every variable must start with VITE_ to be exposed to the browser bundle.
VITE_APP_ENV=dev
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
__TPL__

write_file '.env' <<'__TPL__'
VITE_APP_ENV=dev
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
__TPL__

# ---- App entry + styles ----------------------------------------------------------
write_file 'src/main.tsx' <<'__TPL__'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { AppProviders } from './providers/AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
__TPL__

write_file 'src/index.scss' <<'__TPL__'
@use './styles/variables' as *;

// Deliberately minimal: enough to make the pages readable, nothing more.

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: $color-text;
  background: $color-bg;
  line-height: 1.5;
}

a {
  color: $color-primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

code {
  padding: 0 0.25em;
  border-radius: 3px;
  background: $color-border;
}

// ---- Layout -----------------------------------------------------------------
.app-header {
  display: flex;
  align-items: center;
  gap: $space * 3;
  padding: $space * 2 $space * 3;
  background: $color-surface;
  border-bottom: 1px solid $color-border;

  nav {
    display: flex;
    gap: $space * 2;

    // TanStack Router adds this class to the <Link> of the current route
    a.active {
      font-weight: 600;
    }
  }

  .spacer {
    flex: 1;
  }

  .user {
    color: $color-muted;
    font-size: 0.9rem;
  }
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: $space * 3;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space * 2;
  margin-bottom: $space * 2;

  h1 {
    margin: 0;
  }
}

.card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  padding: $space * 3;
}

// ---- Forms ------------------------------------------------------------------
.form {
  display: flex;
  flex-direction: column;
  gap: $space * 2;
  max-width: 420px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: $space * 0.5;

  label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  input,
  textarea {
    padding: $space $space * 1.5;
    border: 1px solid $color-border;
    border-radius: $radius;
    font: inherit;

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }

  .error {
    color: $color-danger;
    font-size: 0.85rem;
  }
}

.form-actions {
  display: flex;
  gap: $space * 1.5;
}

// ---- Buttons ----------------------------------------------------------------
.btn {
  display: inline-flex;
  align-items: center;
  padding: $space $space * 2;
  border: 1px solid transparent;
  border-radius: $radius;
  background: $color-primary;
  color: #fff;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: $color-primary-dark;
    text-decoration: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.btn-secondary {
    background: $color-surface;
    color: $color-text;
    border-color: $color-border;

    &:hover {
      background: $color-bg;
    }
  }

  &.btn-danger {
    background: $color-danger;
  }

  &.btn-sm {
    padding: $space * 0.5 $space;
    font-size: 0.85rem;
  }
}

// ---- Tables -----------------------------------------------------------------
.table {
  width: 100%;
  border-collapse: collapse;
  background: $color-surface;
  border: 1px solid $color-border;

  th,
  td {
    text-align: left;
    padding: $space $space * 1.5;
    border-bottom: 1px solid $color-border;
  }

  th {
    background: $color-bg;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .actions {
    display: flex;
    gap: $space;
  }
}

// ---- Misc -------------------------------------------------------------------
.alert {
  padding: $space $space * 1.5;
  border-radius: $radius;
  background: #fef2f2;
  color: $color-danger;
  border: 1px solid #fecaca;
}

.muted {
  color: $color-muted;
}

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: $space * 2;

  .card {
    width: 100%;
    max-width: 380px;
  }

  h1 {
    margin-top: 0;
  }
}
__TPL__

write_file 'src/styles/_variables.scss' <<'__TPL__'
// Shared SCSS variables. Pull them into a stylesheet with:
//   @use './styles/variables' as *;   (path relative to the importing file)
$color-primary: #2563eb;
$color-primary-dark: #1d4ed8;
$color-danger: #dc2626;
$color-text: #1f2937;
$color-muted: #6b7280;
$color-border: #e5e7eb;
$color-bg: #f9fafb;
$color-surface: #ffffff;

$radius: 6px;
$space: 0.5rem;
__TPL__

# ---- src/config ------------------------------------------------------------------
write_file 'src/config/env.ts' <<'__TPL__'
import { z } from 'zod'

// Validate environment variables once at startup, so a typo in .env fails
// loudly here instead of surfacing later as a confusing network error.
const envSchema = z.object({
  VITE_APP_ENV: z.enum(['dev', 'qa', 'prod']).default('dev'),
  VITE_API_BASE_URL: z.url('VITE_API_BASE_URL must be a valid URL'),
  VITE_API_TIMEOUT: z.coerce.number().int().positive().default(30000),
})

function validateEnv() {
  const result = envSchema.safeParse(import.meta.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    throw new Error('Invalid environment configuration - check your .env file')
  }

  return result.data
}

const env = validateEnv()

// The rest of the app imports `config`, never `import.meta.env` directly.
export const config = {
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeout: env.VITE_API_TIMEOUT,
  },
  app: {
    env: env.VITE_APP_ENV,
  },
} as const
__TPL__

# ---- src/lib ---------------------------------------------------------------------
write_file 'src/lib/apiClient.ts' <<'__TPL__'
import axios, { type AxiosError } from 'axios'
import { config } from '@/config/env'
import { useAuthStore } from '@/features/auth/auth.store'

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach the bearer token (when logged in) to every call.
apiClient.interceptors.request.use((requestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }
  return requestConfig
})

// Response interceptor: the mock server answers 403 for a missing/invalid
// token, so log out and send the user back to /login.
// Keep this status in sync with `requireAuth` in mock-server/server.js.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)
__TPL__

write_file 'src/lib/apiError.ts' <<'__TPL__'
import { isAxiosError } from 'axios'

// Pull a human-readable message out of whatever a request threw.
// The mock server always answers failures with `{ message: string }`.
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
__TPL__

write_file 'src/lib/queryClient.ts' <<'__TPL__'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data counts as "fresh" for 1 minute -> no refetch on remount
      gcTime: 5 * 60 * 1000, // unused cache entries are dropped after 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
__TPL__

write_file 'src/lib/router.ts' <<'__TPL__'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

// routeTree.gen.ts is generated from src/routes/ by @tanstack/router-plugin
// (see vite.config.ts). Never edit it by hand.
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // start loading a route when the user hovers its link
  scrollRestoration: true,
})

// Registers our router with TanStack's types so <Link to="..."> and
// useNavigate() are type-checked against the real route paths.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
__TPL__

write_file 'src/lib/index.ts' <<'__TPL__'
// Barrel file: one import path for the shared infrastructure.
// `apiClient` is listed first on purpose - it must be initialised before the
// router pulls in the feature modules that use it.
export { apiClient } from './apiClient'
export { getApiErrorMessage } from './apiError'
export { queryClient } from './queryClient'
export { router } from './router'
__TPL__

# ---- src/providers ---------------------------------------------------------------
write_file 'src/providers/AppProviders.tsx' <<'__TPL__'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient, router } from '@/lib'

// Every app-wide provider lives here so main.tsx stays a one-liner.
export const AppProviders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
__TPL__

# ---- src/features/auth -----------------------------------------------------------
write_file 'src/features/auth/auth.types.ts' <<'__TPL__'
export interface ILoginBody {
  username: string
  password: string
}

export interface IUser {
  id: number
  name: string
  username: string
}

export interface ILoginResponse {
  token: string
  user: IUser
}
__TPL__

write_file 'src/features/auth/auth.api.ts' <<'__TPL__'
import { apiClient } from '@/lib'
import type { ILoginBody, ILoginResponse } from './auth.types'

export const login = async (body: ILoginBody) => {
  const res = await apiClient.post<ILoginResponse>('/auth/login', body)
  return res.data
}
__TPL__

write_file 'src/features/auth/auth.query.ts' <<'__TPL__'
import { useMutation } from '@tanstack/react-query'
import { login } from './auth.api'

export const useLogin = () => useMutation({ mutationFn: login })
__TPL__

write_file 'src/features/auth/auth.store.ts' <<'__TPL__'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IUser } from './auth.types'

interface AuthState {
  token: string | null
  user: IUser | null
  setAuth: (token: string, user: IUser) => void
  logout: () => void
}

// Persisted to localStorage under the key "auth", so a page refresh keeps you logged in.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null })
        // Hard redirect on purpose: it also wipes the in-memory React Query cache.
        window.location.href = '/login'
      },
    }),
    { name: 'auth' },
  ),
)
__TPL__

write_file 'src/features/auth/components/LoginPage.tsx' <<'__TPL__'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useLogin } from '../auth.query'
import { useAuthStore } from '../auth.store'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

type LoginPageProps = {
  /** Where to go after a successful login (comes from `?redirect=...`). */
  redirectTo?: string
}

export const LoginPage = ({ redirectTo }: LoginPageProps) => {
  const navigate = useNavigate()
  const login = useLogin()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.token, data.user)
        // Only follow same-site paths, never an external URL smuggled into the query string.
        const target = redirectTo?.startsWith('/') ? redirectTo : '/'
        navigate({ href: target })
      },
    })
  }

  return (
    <div className="login-page">
      <div className="card">
        <h1>Login</h1>
        <p className="muted">
          Mock credentials: <code>admin</code> / <code>admin</code>
        </p>

        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" {...register('username')} />
            {errors.username && <span className="error">{errors.username.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {login.isError && <div className="alert">{getApiErrorMessage(login.error)}</div>}

          <button className="btn" type="submit" disabled={login.isPending}>
            {login.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
__TPL__

write_file 'src/features/auth/index.ts' <<'__TPL__'
export { LoginPage } from './components/LoginPage'
export { useAuthStore } from './auth.store'
export { useLogin } from './auth.query'
export type { ILoginBody, ILoginResponse, IUser } from './auth.types'
__TPL__

# ---- src/features/home -----------------------------------------------------------
write_file 'src/features/home/components/Home.tsx' <<'__TPL__'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'

export const Home = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="card">
      <h1>Welcome{user ? `, ${user.name}` : ''}</h1>
      <p>
        This is the home page of <strong>__PROJECT_NAME__</strong>. It lives under the{' '}
        <code>_authenticated</code> layout route, so you only see it when logged in.
      </p>
      <p>
        <Link className="btn" to="/products">
          Manage products
        </Link>
      </p>
    </div>
  )
}
__TPL__

write_file 'src/features/home/index.ts' <<'__TPL__'
export { Home } from './components/Home'
__TPL__

# ---- src/features/products -------------------------------------------------------
write_file 'src/features/products/product.types.ts' <<'__TPL__'
export interface IProduct {
  id: number
  name: string
  price: number
  description: string
}

// What the client sends when creating/updating - the server owns the id.
export type IProductBody = Omit<IProduct, 'id'>
__TPL__

write_file 'src/features/products/products.api.ts' <<'__TPL__'
import { apiClient } from '@/lib'
import type { IProduct, IProductBody } from './product.types'

export const getProducts = async () => {
  const res = await apiClient.get<IProduct[]>('/products')
  return res.data
}

export const getProduct = async (id: number) => {
  const res = await apiClient.get<IProduct>(`/products/${id}`)
  return res.data
}

export const createProduct = async (body: IProductBody) => {
  const res = await apiClient.post<IProduct>('/products', body)
  return res.data
}

export const updateProduct = async (id: number, body: IProductBody) => {
  const res = await apiClient.put<IProduct>(`/products/${id}`, body)
  return res.data
}

export const deleteProduct = async (id: number) => {
  await apiClient.delete(`/products/${id}`)
}
__TPL__

write_file 'src/features/products/product.query.ts' <<'__TPL__'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './products.api'
import type { IProductBody } from './product.types'

// Query keys in one place so invalidation never drifts out of sync.
// `detail` starts with the same 'products' prefix, so invalidating
// `productKeys.all` refreshes the list AND every cached detail at once.
export const productKeys = {
  all: ['products'] as const,
  detail: (id: number) => ['products', id] as const,
}

export const useProducts = () => useQuery({ queryKey: productKeys.all, queryFn: getProducts })

export const useProduct = (id: number, enabled = true) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: enabled && Number.isFinite(id),
  })

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: IProductBody) => createProduct(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: IProductBody }) => updateProduct(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
__TPL__

write_file 'src/features/products/components/ProductList.tsx' <<'__TPL__'
import { Link } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useDeleteProduct, useProducts } from '../product.query'

export const ProductList = () => {
  const { data: products, isLoading, isError, error } = useProducts()
  const deleteProduct = useDeleteProduct()

  const onDelete = (id: number, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deleteProduct.mutate(id)
    }
  }

  if (isLoading) return <p>Loading products...</p>
  if (isError) return <div className="alert">{getApiErrorMessage(error)}</div>

  return (
    <>
      <div className="page-title">
        <h1>Products</h1>
        <Link className="btn" to="/products/add">
          Add product
        </Link>
      </div>

      {deleteProduct.isError && (
        <div className="alert">{getApiErrorMessage(deleteProduct.error)}</div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No products yet.
              </td>
            </tr>
          )}
          {products?.map((product, index) => (
            <tr key={product.id}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>
                <div className="actions">
                  <Link
                    className="btn btn-secondary btn-sm"
                    to="/products/$productId"
                    params={{ productId: String(product.id) }}
                  >
                    View
                  </Link>
                  <Link
                    className="btn btn-secondary btn-sm"
                    to="/products/$productId/edit"
                    params={{ productId: String(product.id) }}
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => onDelete(product.id, product.name)}
                    disabled={deleteProduct.isPending}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
__TPL__

write_file 'src/features/products/components/ProductForm.tsx' <<'__TPL__'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { getApiErrorMessage } from '@/lib'
import { useCreateProduct, useProduct, useUpdateProduct } from '../product.query'

type ProductFormProps = {
  mode: 'add' | 'edit' | 'view'
  productId?: string // present for edit + view, absent for add
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number({ error: 'Price must be a number' }).positive('Price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
})

type ProductFormValues = z.infer<typeof productSchema>

export const ProductForm = ({ mode, productId }: ProductFormProps) => {
  const id = Number(productId)
  const navigate = useNavigate()

  // Only fetch when there is an id to fetch (edit/view) - never for "add".
  const product = useProduct(id, mode !== 'add')
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', price: 0, description: '' },
    // `values` is reactive: once the product arrives, the form fills itself in.
    values: product.data
      ? {
          name: product.data.name,
          price: product.data.price,
          description: product.data.description,
        }
      : undefined,
  })

  const onSubmit = (values: ProductFormValues) => {
    const backToList = () => navigate({ to: '/products' })

    if (mode === 'edit') {
      updateProduct.mutate({ id, body: values }, { onSuccess: backToList })
    } else {
      createProduct.mutate(values, { onSuccess: backToList })
    }
  }

  if (mode !== 'add' && product.isLoading) return <p>Loading product...</p>
  if (mode !== 'add' && product.isError) {
    return <div className="alert">{getApiErrorMessage(product.error)}</div>
  }

  if (mode === 'view') {
    return (
      <div className="card">
        <div className="page-title">
          <h1>{product.data?.name}</h1>
          <div className="form-actions">
            <Link className="btn btn-secondary" to="/products">
              Back
            </Link>
            <Link className="btn" to="/products/$productId/edit" params={{ productId: String(id) }}>
              Edit
            </Link>
          </div>
        </div>
        <p>
          <strong>Price:</strong> {product.data?.price}
        </p>
        <p>
          <strong>Description:</strong> {product.data?.description}
        </p>
      </div>
    )
  }

  const saving = createProduct.isPending || updateProduct.isPending
  const saveError = createProduct.error ?? updateProduct.error

  return (
    <div className="card">
      <h1>{mode === 'edit' ? 'Edit product' : 'Add product'}</h1>

      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register('name')} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          {/* Inputs give strings; valueAsNumber converts so zod sees a number */}
          <input id="price" type="number" step="any" {...register('price', { valueAsNumber: true })} />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} {...register('description')} />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        {saveError && <div className="alert">{getApiErrorMessage(saveError)}</div>}

        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link className="btn btn-secondary" to="/products">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
__TPL__

write_file 'src/features/products/index.ts' <<'__TPL__'
export { ProductList } from './components/ProductList'
export { ProductForm } from './components/ProductForm'
export {
  productKeys,
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './product.query'
export type { IProduct, IProductBody } from './product.types'
__TPL__

# ---- src/routes (file-based routing) ---------------------------------------------
write_file 'src/routes/__root.tsx' <<'__TPL__'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      {/* Devtools render nothing in production builds */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
__TPL__

write_file 'src/routes/login.tsx' <<'__TPL__'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage, useAuthStore } from '@/features/auth'

// /login?redirect=/products -> after logging in, go back to where the user was heading.
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  // Already logged in? Skip the login page.
  beforeLoad: () => {
    if (useAuthStore.getState().token) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect: redirectTo } = Route.useSearch()
  return <LoginPage redirectTo={redirectTo} />
}
__TPL__

write_file 'src/routes/_authenticated.tsx' <<'__TPL__'
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth'

// Layout route: everything inside src/routes/_authenticated/ requires a login.
// `beforeLoad` runs before any child route renders - think of it as a bouncer.
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const isAuthenticated = !!useAuthStore.getState().token
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <>
      <header className="app-header">
        <strong>__PROJECT_NAME__</strong>
        <nav>
          <Link to="/" activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/products">Products</Link>
        </nav>
        <span className="spacer" />
        <span className="user">{user?.name}</span>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => logout()}>
          Logout
        </button>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
__TPL__

write_file 'src/routes/_authenticated/index.tsx' <<'__TPL__'
import { createFileRoute } from '@tanstack/react-router'
import { Home } from '@/features/home'

export const Route = createFileRoute('/_authenticated/')({
  component: Home,
})
__TPL__

write_file 'src/routes/_authenticated/products/index.tsx' <<'__TPL__'
import { createFileRoute } from '@tanstack/react-router'
import { ProductList } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/')({
  component: ProductList,
})
__TPL__

write_file 'src/routes/_authenticated/products/add.tsx' <<'__TPL__'
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

// The static segment `add` wins over the dynamic `$productId` sibling.
export const Route = createFileRoute('/_authenticated/products/add')({
  component: () => <ProductForm mode="add" />,
})
__TPL__

write_file 'src/routes/_authenticated/products/$productId/index.tsx' <<'__TPL__'
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/$productId/')({
  component: ProductViewPage,
})

function ProductViewPage() {
  const { productId } = Route.useParams()
  return <ProductForm mode="view" productId={productId} />
}
__TPL__

write_file 'src/routes/_authenticated/products/$productId/edit.tsx' <<'__TPL__'
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/$productId/edit')({
  component: ProductEditPage,
})

function ProductEditPage() {
  const { productId } = Route.useParams()
  return <ProductForm mode="edit" productId={productId} />
}
__TPL__

# ---- src/routeTree.gen.ts (normally generated by the router plugin on `vite dev`; shipped so `npm run build` works before the first dev run) ---
write_file 'src/routeTree.gen.ts' <<'__TPL__'
/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as AuthenticatedRouteImport } from './routes/_authenticated'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AuthenticatedIndexRouteImport } from './routes/_authenticated/index'
import { Route as AuthenticatedProductsIndexRouteImport } from './routes/_authenticated/products/index'
import { Route as AuthenticatedProductsAddRouteImport } from './routes/_authenticated/products/add'
import { Route as AuthenticatedProductsProductIdIndexRouteImport } from './routes/_authenticated/products/$productId/index'
import { Route as AuthenticatedProductsProductIdEditRouteImport } from './routes/_authenticated/products/$productId/edit'

const AuthenticatedRoute = AuthenticatedRouteImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthenticatedIndexRoute = AuthenticatedIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthenticatedRoute,
} as any)
const AuthenticatedProductsIndexRoute =
  AuthenticatedProductsIndexRouteImport.update({
    id: '/products/',
    path: '/products/',
    getParentRoute: () => AuthenticatedRoute,
  } as any)
const AuthenticatedProductsAddRoute =
  AuthenticatedProductsAddRouteImport.update({
    id: '/products/add',
    path: '/products/add',
    getParentRoute: () => AuthenticatedRoute,
  } as any)
const AuthenticatedProductsProductIdIndexRoute =
  AuthenticatedProductsProductIdIndexRouteImport.update({
    id: '/products/$productId/',
    path: '/products/$productId/',
    getParentRoute: () => AuthenticatedRoute,
  } as any)
const AuthenticatedProductsProductIdEditRoute =
  AuthenticatedProductsProductIdEditRouteImport.update({
    id: '/products/$productId/edit',
    path: '/products/$productId/edit',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof AuthenticatedIndexRoute
  '/login': typeof LoginRoute
  '/products/add': typeof AuthenticatedProductsAddRoute
  '/products/': typeof AuthenticatedProductsIndexRoute
  '/products/$productId/edit': typeof AuthenticatedProductsProductIdEditRoute
  '/products/$productId/': typeof AuthenticatedProductsProductIdIndexRoute
}
export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/': typeof AuthenticatedIndexRoute
  '/products/add': typeof AuthenticatedProductsAddRoute
  '/products': typeof AuthenticatedProductsIndexRoute
  '/products/$productId/edit': typeof AuthenticatedProductsProductIdEditRoute
  '/products/$productId': typeof AuthenticatedProductsProductIdIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/login': typeof LoginRoute
  '/_authenticated/': typeof AuthenticatedIndexRoute
  '/_authenticated/products/add': typeof AuthenticatedProductsAddRoute
  '/_authenticated/products/': typeof AuthenticatedProductsIndexRoute
  '/_authenticated/products/$productId/edit': typeof AuthenticatedProductsProductIdEditRoute
  '/_authenticated/products/$productId/': typeof AuthenticatedProductsProductIdIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/login'
    | '/products/add'
    | '/products/'
    | '/products/$productId/edit'
    | '/products/$productId/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/'
    | '/products/add'
    | '/products'
    | '/products/$productId/edit'
    | '/products/$productId'
  id:
    | '__root__'
    | '/_authenticated'
    | '/login'
    | '/_authenticated/'
    | '/_authenticated/products/add'
    | '/_authenticated/products/'
    | '/_authenticated/products/$productId/edit'
    | '/_authenticated/products/$productId/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
  LoginRoute: typeof LoginRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated/': {
      id: '/_authenticated/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedIndexRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/products/': {
      id: '/_authenticated/products/'
      path: '/products'
      fullPath: '/products/'
      preLoaderRoute: typeof AuthenticatedProductsIndexRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/products/add': {
      id: '/_authenticated/products/add'
      path: '/products/add'
      fullPath: '/products/add'
      preLoaderRoute: typeof AuthenticatedProductsAddRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/products/$productId/': {
      id: '/_authenticated/products/$productId/'
      path: '/products/$productId'
      fullPath: '/products/$productId/'
      preLoaderRoute: typeof AuthenticatedProductsProductIdIndexRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/products/$productId/edit': {
      id: '/_authenticated/products/$productId/edit'
      path: '/products/$productId/edit'
      fullPath: '/products/$productId/edit'
      preLoaderRoute: typeof AuthenticatedProductsProductIdEditRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
  }
}

interface AuthenticatedRouteChildren {
  AuthenticatedIndexRoute: typeof AuthenticatedIndexRoute
  AuthenticatedProductsAddRoute: typeof AuthenticatedProductsAddRoute
  AuthenticatedProductsIndexRoute: typeof AuthenticatedProductsIndexRoute
  AuthenticatedProductsProductIdEditRoute: typeof AuthenticatedProductsProductIdEditRoute
  AuthenticatedProductsProductIdIndexRoute: typeof AuthenticatedProductsProductIdIndexRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedIndexRoute: AuthenticatedIndexRoute,
  AuthenticatedProductsAddRoute: AuthenticatedProductsAddRoute,
  AuthenticatedProductsIndexRoute: AuthenticatedProductsIndexRoute,
  AuthenticatedProductsProductIdEditRoute:
    AuthenticatedProductsProductIdEditRoute,
  AuthenticatedProductsProductIdIndexRoute:
    AuthenticatedProductsProductIdIndexRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  LoginRoute: LoginRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
__TPL__

# ---- mock-server -----------------------------------------------------------------
write_file 'mock-server/server.js' <<'__TPL__'
import express from 'express'
import cors from 'cors'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const app = express()
const PORT = Number(process.env.MOCK_API_PORT ?? 3000)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ---------------------------------------------------------------------------
// File-backed "database": data lives in db.json next to this file, so it
// survives restarts. Delete db.json to reset everything to the seed below.
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'db.json')

const SEED = {
  users: [{ id: 1, name: 'Admin', username: 'admin', password: 'admin' }],
  products: [
    { id: 1, name: 'Keyboard', price: 2500, description: 'Mechanical keyboard' },
    { id: 2, name: 'Mouse', price: 1200, description: 'Wireless mouse' },
    { id: 3, name: 'Monitor', price: 15000, description: '27 inch 4K display' },
  ],
}

const writeDb = (db) => writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')
const readDb = () => {
  if (!existsSync(DB_PATH)) writeDb(SEED)
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
}

// Next id = highest existing id + 1 (starts at 1 when the list is empty)
const nextId = (items) => items.reduce((max, item) => Math.max(max, item.id), 0) + 1

// Never send passwords back to the client
const toPublicUser = ({ password: _password, ...user }) => user

// A real server would sign a JWT. For a mock, one fixed token is enough.
const DUMMY_TOKEN = 'mock-token-admin'

// ---------------------------------------------------------------------------
// Auth middleware: protected routes need "Authorization: Bearer <token>".
// A missing/invalid token gets 403, which the frontend's axios interceptor
// turns into a logout + redirect to /login. Keep the two in sync.
// ---------------------------------------------------------------------------
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (token !== DUMMY_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: missing or invalid token' })
  }
  next()
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' })
  }

  const db = readDb()
  const user = db.users.find((u) => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  res.json({ token: DUMMY_TOKEN, user: toPublicUser(user) })
})

// ---------------------------------------------------------------------------
// Products (protected)
// ---------------------------------------------------------------------------
const validateProduct = ({ name, price, description }) => {
  if (typeof name !== 'string' || !name.trim()) return 'name is required'
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return 'price must be a positive number'
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'description must be a string'
  }
  return null
}

app.get('/products', requireAuth, (req, res) => {
  res.json(readDb().products)
})

app.get('/products/:id', requireAuth, (req, res) => {
  const product = readDb().products.find((p) => p.id === Number(req.params.id))
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

app.post('/products', requireAuth, (req, res) => {
  const body = req.body ?? {}
  const error = validateProduct(body)
  if (error) return res.status(400).json({ message: error })

  const db = readDb()
  const product = {
    id: nextId(db.products),
    name: body.name.trim(),
    price: body.price,
    description: body.description ?? '',
  }
  db.products.push(product)
  writeDb(db)
  res.status(201).json(product)
})

app.put('/products/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const existing = db.products.find((p) => p.id === id)
  if (!existing) return res.status(404).json({ message: 'Product not found' })

  const body = req.body ?? {}
  const error = validateProduct(body)
  if (error) return res.status(400).json({ message: error })

  // Immutable update: build a new array instead of mutating in place
  const updated = {
    ...existing,
    name: body.name.trim(),
    price: body.price,
    description: body.description ?? '',
  }
  db.products = db.products.map((p) => (p.id === id ? updated : p))
  writeDb(db)
  res.json(updated)
})

app.delete('/products/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  if (!db.products.some((p) => p.id === id)) {
    return res.status(404).json({ message: 'Product not found' })
  }
  db.products = db.products.filter((p) => p.id !== id)
  writeDb(db)
  res.status(204).end()
})

// Anything else -> JSON 404 (instead of Express' HTML error page)
app.use((req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` })
})

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`)
  console.log('Login with: admin / admin')
})
__TPL__

# ---- README ----------------------------------------------------------------------
write_file 'README.md' <<'__TPL__'
# __PROJECT_NAME__

React 19 + TypeScript starter generated by `bootstrap-react`.

| Area               | Library                                               |
| ------------------ | ----------------------------------------------------- |
| Build / dev server | Vite (React Compiler enabled)                         |
| Routing            | TanStack Router, file-based from `src/routes/`        |
| Server state       | TanStack Query                                        |
| Client state       | zustand (`src/features/auth/auth.store.ts`)           |
| HTTP               | axios (`src/lib/apiClient.ts`)                        |
| Forms + validation | react-hook-form + zod                                 |
| Styling            | SCSS (`src/index.scss`, `src/styles/_variables.scss`) |
| Linting            | ESLint                                                |
| Mock backend       | Express (`mock-server/server.js`)                     |

## Getting started

```bash
npm install
npm run dev:all   # mock API on http://localhost:3000 + app on http://localhost:5173
```

Or run the two halves in separate terminals: `npm run mock-api` and `npm run dev`.

Log in with **admin / admin**.

## Scripts

| Script             | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Vite dev server (app only)                             |
| `npm run mock-api` | Express mock API on port 3000                          |
| `npm run dev:all`  | Both of the above in one terminal (via `concurrently`) |
| `npm run build`    | Type-check (`tsc -b`) and build for production         |
| `npm run preview`  | Serve the production build locally                     |
| `npm run lint`     | ESLint                                                 |

## Project structure

```
mock-server/
  server.js            Express mock API (login + product CRUD)
  db.json              Created on first run, git-ignored; delete it to reset the data
src/
  config/env.ts        Validates VITE_* env vars with zod, exports `config`
  lib/                 Shared infrastructure: apiClient (axios), queryClient, router
  providers/           AppProviders = QueryClientProvider + RouterProvider
  features/
    auth/              Login page, zustand auth store, login mutation
    home/              Home page
    products/          Product list + add/edit/view form, queries + mutations
  routes/              File-based routes (thin: they just point at feature components)
    __root.tsx
    login.tsx
    _authenticated.tsx           Layout + auth guard (beforeLoad -> redirect to /login)
    _authenticated/
      index.tsx                  /
      products/index.tsx         /products
      products/add.tsx           /products/add
      products/$productId/       /products/:id and /products/:id/edit
  routeTree.gen.ts     GENERATED by @tanstack/router-plugin - never edit by hand
  index.scss           Global styles
```

Conventions:

- UI lives in `src/features/<feature>/` with a barrel `index.ts`; route files stay thin.
- `@/` is an alias for `src/` (set in both `vite.config.ts` and `tsconfig.app.json`).
- The mock API returns **403** for a missing/invalid token and the axios response
  interceptor logs out + redirects to `/login` on 403. Change both or neither.

## Environment variables

Copy `.env.example` to `.env` (the bootstrap script already did). Variables are validated
on startup in `src/config/env.ts`; the app refuses to boot with a bad value.

| Variable            | Default                 |
| ------------------- | ----------------------- |
| `VITE_APP_ENV`      | `dev`                   |
| `VITE_API_BASE_URL` | `http://localhost:3000` |
| `VITE_API_TIMEOUT`  | `30000`                 |

## Mock API

| Method | Path            | Auth | Notes                                         |
| ------ | --------------- | ---- | --------------------------------------------- |
| POST   | `/auth/login`   | no   | `{ username, password }` -> `{ token, user }` |
| GET    | `/products`     | yes  |                                               |
| GET    | `/products/:id` | yes  | 404 if missing                                |
| POST   | `/products`     | yes  | 201; body `{ name, price, description }`      |
| PUT    | `/products/:id` | yes  | full replace, same body as POST               |
| DELETE | `/products/:id` | yes  | 204                                           |

"Auth: yes" means the request needs `Authorization: Bearer <token>` using the token
from the login response. Without it the server answers **403**.
__TPL__

# ---- .gitignore additions ---------------------------------------------------
cat >> .gitignore <<'__TPL__'

# Environment files (commit .env.example only)
.env
.env.local

# Mock API data (recreated from the seed on first run)
mock-server/db.json

# TanStack Router plugin scratch folder
.tanstack/
__TPL__
printf '  %s\n' '.gitignore (appended)'

# ---- package.json scripts ---------------------------------------------------
# Edited with a tiny Node script instead of sed: JSON-safe and quote-safe.
node - <<'__JS__'
const fs = require('node:fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts['mock-api'] = 'node mock-server/server.js'
pkg.scripts['dev:all'] = 'concurrently -k -n api,web -c blue,green "npm run mock-api" "npm run dev"'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
__JS__
printf '  %s\n' 'package.json (scripts: mock-api, dev:all)'

# ---- dependencies -----------------------------------------------------------
RUNTIME_DEPS=(
  axios
  @tanstack/react-router
  @tanstack/react-router-devtools
  @tanstack/react-query
  zustand
  zod
  react-hook-form
  @hookform/resolvers
)
DEV_DEPS=(
  @tanstack/router-plugin   # file-based routing codegen (Vite plugin)
  sass                      # SCSS support for Vite
  express cors              # mock API
  concurrently              # `npm run dev:all`
)

if [ "$INSTALL" = y ]; then
  info 'Installing dependencies (this can take a minute)...'
  npm install --no-audit --no-fund "${RUNTIME_DEPS[@]}"
  npm install --no-audit --no-fund --save-dev "${DEV_DEPS[@]}"
else
  # Resolves versions and writes package.json + package-lock.json, but
  # creates no node_modules - `npm install` later does the real work.
  info 'Adding dependencies to package.json (no node_modules yet)...'
  npm install --package-lock-only --no-audit --no-fund "${RUNTIME_DEPS[@]}"
  npm install --package-lock-only --no-audit --no-fund --save-dev "${DEV_DEPS[@]}"
fi

# ---- done -------------------------------------------------------------------
printf '\n%sDone!%s Project created in ./%s\n\n' "$GREEN$BOLD" "$RESET" "$PROJECT_NAME"
printf '  Login with: %sadmin / admin%s\n' "$BOLD" "$RESET"
printf '  Mock API:   http://localhost:3000\n'
printf '  App:        http://localhost:5173\n\n'

if [ "$INSTALL" = y ]; then
  info 'Starting mock API + Vite dev server (Ctrl+C stops both)...'
  npm run dev:all
else
  printf 'Next steps:\n\n  cd %s\n  npm install\n  npm run dev:all\n\n' "$PROJECT_NAME"
fi
