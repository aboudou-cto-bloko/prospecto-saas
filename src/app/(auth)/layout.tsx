export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-headline text-ink">
            ◆ Prospecto
          </h1>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
