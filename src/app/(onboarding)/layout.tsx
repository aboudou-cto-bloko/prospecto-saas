export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-headline text-ink">
            ◆ Prospecto
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
