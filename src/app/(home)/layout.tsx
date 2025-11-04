export default function HomePage(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4 text-center">
      <main className="mx-auto max-w-4xl">{props.children}</main>
    </div>
  );
}
