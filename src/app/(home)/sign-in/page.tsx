import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignInButton forceRedirectUrl={"/drive"}>Sign in</SignInButton>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Goo Drive. All rights reserved.
      </footer>
    </>
  );
}
