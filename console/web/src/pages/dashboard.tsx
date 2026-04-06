import { authClient } from "@/lib/auth-client"

export default function DashboardPage() {
  const session = authClient.useSession()
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {session.data?.user?.name}.
      </p>
    </div>
  )
}
