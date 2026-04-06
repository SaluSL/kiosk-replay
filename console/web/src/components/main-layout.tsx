export default function MainLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
