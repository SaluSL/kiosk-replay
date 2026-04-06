import { Route, type RouteProps, Redirect } from "wouter"
import { authClient } from "@/lib/auth-client"

type RouteWithLayoutProps = Omit<RouteProps, "component"> & {
  component: React.ComponentType
  layout: React.ComponentType<React.PropsWithChildren>
}

const RouteWithLayout = ({
  layout,
  component,
  ...props
}: RouteWithLayoutProps) => {
  const Page = component
  const Layout = layout

  return (
    <Route {...props}>
      <Layout>
        <Page />
      </Layout>
    </Route>
  )
}

type ProtectedRouteProps = Omit<RouteProps, "component"> & {
  component: React.ComponentType
  redirectOnUnauthorized: string
  layout?: React.ComponentType<React.PropsWithChildren>
}

const ProtectedRoute = ({
  component,
  redirectOnUnauthorized,
  layout = undefined,
  ...props
}: ProtectedRouteProps) => {
  const session = authClient.useSession()
  const Page = component

  if (session.isPending) {
    return null
  }

  if (
    !session.data?.user ||
    session.data.session?.expiresAt?.getTime() < Date.now()
  ) {
    return <Redirect to={redirectOnUnauthorized} />
  }

  return layout ? (
    <RouteWithLayout layout={layout} component={component} {...props} />
  ) : (
    <Route {...props}>
      <Page />
    </Route>
  )
}

export { RouteWithLayout, ProtectedRoute }
