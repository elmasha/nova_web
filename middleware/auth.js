// middleware/auth.js
export default function ({ app, route, redirect }) {
  const appPublicRoutes = ['/', '/login', '/forgot-password']
  const isAdminLogin = route.path === '/admin/login'
  const isAdminRoute = route.path.startsWith('/admin') && !isAdminLogin
  const isAppPublic = appPublicRoutes.includes(route.path) || isAdminLogin

  const isLoggedIn = !!(app.$fire && app.$fire.auth && app.$fire.auth.currentUser)

  // =========================================================
  // 1. Admin login page — special handling
  // =========================================================
  if (isAdminLogin) {
    // Logged-in users shouldn't see the admin login form.
    // Send them where they were going, or to /admin.
    if (isLoggedIn) {
      const target = route.query && route.query.redirect
        ? decodeURIComponent(route.query.redirect)
        : '/admin'
      return redirect(target)
    }
    // Logged out → let them see the admin login page
    return
  }

  // =========================================================
  // 2. Admin routes (everything under /admin except /admin/login)
  //    require login. Redirect to /admin/login, not /login.
  // =========================================================
  if (isAdminRoute && !isLoggedIn) {
    return redirect('/admin/login?redirect=' + encodeURIComponent(route.fullPath))
  }

  // =========================================================
  // 3. App login/register — logged-in users go to /dashboard
  // =========================================================
  if (isLoggedIn && (route.path === '/login' || route.path === '/register')) {
    const target = route.query && route.query.redirect
      ? decodeURIComponent(route.query.redirect)
      : '/dashboard'
    return redirect(target)
  }

  // =========================================================
  // 4. Any other protected route — unauthenticated → /login
  // =========================================================
  if (!isLoggedIn && !isAppPublic) {
    return redirect('/login?redirect=' + encodeURIComponent(route.fullPath))
  }
}