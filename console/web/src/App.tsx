import LoginPage from "./pages/login"
import DashboardPage from "./pages/dashboard"
import MainLayout from "./components/main-layout"
import { ProtectedRoute } from "./lib/helpers/route"
import { Router, Route } from "wouter"
import { Toaster } from "sonner"

export function App() {
  return (
    <>
      <Router>
        <Route path="/login" component={LoginPage} />
        <ProtectedRoute
          path="/"
          component={DashboardPage}
          redirectOnUnauthorized="/login"
          layout={MainLayout}
        />
      </Router>
      <Toaster />
    </>
  )
}

export default App
