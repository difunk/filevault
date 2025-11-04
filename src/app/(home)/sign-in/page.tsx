import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <h1 className="mb-8 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
        Welcome Back
      </h1>
      <p className="mx-auto mb-8 max-w-md text-lg text-neutral-400">
        Sign in to access your files
      </p>
      <div className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700 px-6 py-3 rounded-md font-medium">
        <SignInButton forceRedirectUrl={"/drive"}>Sign in</SignInButton>
      </div>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Goo Drive. All rights reserved.
      </footer>
    </>
  );
}
