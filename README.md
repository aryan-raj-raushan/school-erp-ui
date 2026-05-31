# School ERP UI

## Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · React Hook Form · Zod

## Architecture

```
Pages (.tsx)        → hook calls + UI component calls only. Zero className. Zero raw HTML.
UI Components       → own all HTML + className (theme layer). Change theme here only.
Hooks               → all logic, form state, service calls, navigation.
Services            → raw API calls only.
```

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                      Root layout + ThemeProvider + Toaster
│   ├── page.tsx                        Root redirect
│   ├── (auth)/
│   │   ├── layout.tsx                  Centered card layout
│   │   └── login/page.tsx
│   └── (dashboard)/
│       └── dashboard/
│           ├── layout.tsx              Sidebar + main shell
│           ├── page.tsx                Role-based redirect
│           ├── schools/page.tsx
│           └── school/page.tsx
│
├── components/
│   └── ui/                            All reusable styled primitives
│       ├── index.ts                   Barrel export
│       ├── layout.tsx                 Div (type=row|col|grid)
│       ├── typography.tsx             H1 H2 H3 P Span Label ErrorText SectionLabel
│       ├── form.tsx                   Input Select Textarea FormField
│       ├── button.tsx                 Button (CVA variants)
│       ├── table.tsx                  Table TableHead TableBody TableRow TableCell TablePagination
│       ├── modal.tsx                  Modal ModalBody ModalFooter
│       ├── nav.tsx                    Nav NavItem NavButton
│       ├── sidebar.tsx                Sidebar SidebarHeader SidebarBrand SidebarFooter DashboardShell DashboardMain
│       ├── tabs.tsx                   Tabs
│       ├── badge.tsx                  Badge (success|warning|danger|info|default)
│       ├── spinner.tsx                Spinner
│       └── theme-toggle.tsx           ThemeToggle button
│
├── hooks/
│   ├── index.ts                       Barrel export
│   ├── useAuth.ts                     Login, logout, getMe
│   ├── useSchools.ts                  School list, create, filters
│   ├── useLoginPage.ts                Tab state + both login forms
│   ├── useCreateSchoolForm.ts         School create modal + form
│   └── useDashboardLayout.ts          Nav items, logout, sidebar state, theme
│
├── services/
│   ├── auth.service.ts
│   └── schools.service.ts
│
├── store/
│   ├── auth.store.ts                  User, context, isAuthenticated (cookie-persisted)
│   ├── theme.store.ts                 theme (light|dark), future templateId
│   └── sidebar.store.ts               isCollapsed toggle
│
├── lib/
│   ├── utils.ts                       cn()
│   ├── errors.ts
│   ├── cookie.utils.ts
│   ├── validations/
│   │   ├── auth.validation.ts
│   │   └── schools.validation.ts
│   └── api-gateway/
│       ├── api-gateway.ts
│       ├── api-gateway.instance.ts
│       ├── endpoints.ts
│       ├── token.storage.ts
│       └── interceptors/
│           ├── auth.interceptor.ts
│           └── error.interceptor.ts
│
├── types/
│   └── index.ts                       All types + enums (Role, AuthContext, UserProfile, School, PaginationMeta, …)
│
└── constants/
    ├── index.ts                       Barrel export
    ├── app.constants.ts               APP, ROUTES, STORAGE_KEYS
    ├── auth.constants.ts              AUTH_TABS, COMPANY_LOGIN_FORM, SCHOOL_LOGIN_FORM
    ├── nav.constants.ts               NAV_ITEMS, NAV_LABELS, NavIconKey
    ├── regex.constants.ts             REGEX patterns
    └── schools.constants.ts           SCHOOLS_PAGE, CREATE_SCHOOL_FORM, BOARD_TYPES
```

## Theme System

CSS variables defined in `globals.css`:
- `:root` — light mode defaults
- `.dark` — dark mode overrides (toggled via `.dark` class on `<html>`)
- Future: `[data-template="blue"]` etc. for swappable color palettes

Theme state managed in `store/theme.store.ts`.  
Applied by `ThemeProvider` (injected in root layout).  
UI components use semantic tokens (`bg-background`, `text-foreground`, `border-border`) — never hardcoded colors.

## Rules

- Pages: **no `className`**, no raw HTML, no service imports
- Hooks: all logic — call services, manage state, navigate
- Services: API calls only
- UI components: all `className` lives here — theme changes in one place
