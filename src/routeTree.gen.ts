/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as GuestImport } from './routes/_guest'
import { Route as AuthImport } from './routes/_auth'
import { Route as GuestResetPasswordImport } from './routes/_guest/reset-password'
import { Route as AuthUsersImport } from './routes/_auth/users'
import { Route as AuthUsersIndexImport } from './routes/_auth/users/index'

// Create Virtual Routes

const AuthIndexLazyImport = createFileRoute('/_auth/')()
const GuestLoginLazyImport = createFileRoute('/_guest/login')()
const GuestForgotPasswordLazyImport = createFileRoute(
  '/_guest/forgot-password',
)()
const AuthAboutLazyImport = createFileRoute('/_auth/about')()
const AuthUsersAddNewLazyImport = createFileRoute('/_auth/users/add-new')()

// Create/Update Routes

const GuestRoute = GuestImport.update({
  id: '/_guest',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const AuthIndexLazyRoute = AuthIndexLazyImport.update({
  path: '/',
  getParentRoute: () => AuthRoute,
} as any).lazy(() => import('./routes/_auth/index.lazy').then((d) => d.Route))

const GuestLoginLazyRoute = GuestLoginLazyImport.update({
  path: '/login',
  getParentRoute: () => GuestRoute,
} as any).lazy(() => import('./routes/_guest/login.lazy').then((d) => d.Route))

const GuestForgotPasswordLazyRoute = GuestForgotPasswordLazyImport.update({
  path: '/forgot-password',
  getParentRoute: () => GuestRoute,
} as any).lazy(() =>
  import('./routes/_guest/forgot-password.lazy').then((d) => d.Route),
)

const AuthAboutLazyRoute = AuthAboutLazyImport.update({
  path: '/about',
  getParentRoute: () => AuthRoute,
} as any).lazy(() => import('./routes/_auth/about.lazy').then((d) => d.Route))

const GuestResetPasswordRoute = GuestResetPasswordImport.update({
  path: '/reset-password',
  getParentRoute: () => GuestRoute,
} as any)

const AuthUsersRoute = AuthUsersImport.update({
  path: '/users',
  getParentRoute: () => AuthRoute,
} as any)

const AuthUsersIndexRoute = AuthUsersIndexImport.update({
  path: '/',
  getParentRoute: () => AuthUsersRoute,
} as any)

const AuthUsersAddNewLazyRoute = AuthUsersAddNewLazyImport.update({
  path: '/add-new',
  getParentRoute: () => AuthUsersRoute,
} as any).lazy(() =>
  import('./routes/_auth/users/add-new.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/_guest': {
      id: '/_guest'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof GuestImport
      parentRoute: typeof rootRoute
    }
    '/_auth/users': {
      id: '/_auth/users'
      path: '/users'
      fullPath: '/users'
      preLoaderRoute: typeof AuthUsersImport
      parentRoute: typeof AuthImport
    }
    '/_guest/reset-password': {
      id: '/_guest/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof GuestResetPasswordImport
      parentRoute: typeof GuestImport
    }
    '/_auth/about': {
      id: '/_auth/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AuthAboutLazyImport
      parentRoute: typeof AuthImport
    }
    '/_guest/forgot-password': {
      id: '/_guest/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof GuestForgotPasswordLazyImport
      parentRoute: typeof GuestImport
    }
    '/_guest/login': {
      id: '/_guest/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof GuestLoginLazyImport
      parentRoute: typeof GuestImport
    }
    '/_auth/': {
      id: '/_auth/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthIndexLazyImport
      parentRoute: typeof AuthImport
    }
    '/_auth/users/add-new': {
      id: '/_auth/users/add-new'
      path: '/add-new'
      fullPath: '/users/add-new'
      preLoaderRoute: typeof AuthUsersAddNewLazyImport
      parentRoute: typeof AuthUsersImport
    }
    '/_auth/users/': {
      id: '/_auth/users/'
      path: '/'
      fullPath: '/users/'
      preLoaderRoute: typeof AuthUsersIndexImport
      parentRoute: typeof AuthUsersImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  AuthRoute: AuthRoute.addChildren({
    AuthUsersRoute: AuthUsersRoute.addChildren({
      AuthUsersAddNewLazyRoute,
      AuthUsersIndexRoute,
    }),
    AuthAboutLazyRoute,
    AuthIndexLazyRoute,
  }),
  GuestRoute: GuestRoute.addChildren({
    GuestResetPasswordRoute,
    GuestForgotPasswordLazyRoute,
    GuestLoginLazyRoute,
  }),
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_auth",
        "/_guest"
      ]
    },
    "/_auth": {
      "filePath": "_auth.tsx",
      "children": [
        "/_auth/users",
        "/_auth/about",
        "/_auth/"
      ]
    },
    "/_guest": {
      "filePath": "_guest.tsx",
      "children": [
        "/_guest/reset-password",
        "/_guest/forgot-password",
        "/_guest/login"
      ]
    },
    "/_auth/users": {
      "filePath": "_auth/users.tsx",
      "parent": "/_auth",
      "children": [
        "/_auth/users/add-new",
        "/_auth/users/"
      ]
    },
    "/_guest/reset-password": {
      "filePath": "_guest/reset-password.tsx",
      "parent": "/_guest"
    },
    "/_auth/about": {
      "filePath": "_auth/about.lazy.tsx",
      "parent": "/_auth"
    },
    "/_guest/forgot-password": {
      "filePath": "_guest/forgot-password.lazy.tsx",
      "parent": "/_guest"
    },
    "/_guest/login": {
      "filePath": "_guest/login.lazy.tsx",
      "parent": "/_guest"
    },
    "/_auth/": {
      "filePath": "_auth/index.lazy.tsx",
      "parent": "/_auth"
    },
    "/_auth/users/add-new": {
      "filePath": "_auth/users/add-new.lazy.tsx",
      "parent": "/_auth/users"
    },
    "/_auth/users/": {
      "filePath": "_auth/users/index.tsx",
      "parent": "/_auth/users"
    }
  }
}
ROUTE_MANIFEST_END */
