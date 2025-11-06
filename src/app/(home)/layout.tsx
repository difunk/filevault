export default function HomePage(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 px-4 py-8 text-center">
      <main className="mx-auto w-full max-w-6xl">{props.children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-800 pt-8 text-center">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} filevault. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
