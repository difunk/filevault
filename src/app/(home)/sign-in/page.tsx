import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-neutral-900 to-neutral-950 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo area */}
        <div className="mb-12">
          <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 shadow-lg">
            <svg
              className="h-6 w-6 text-neutral-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 21l4-4 4 4"
              />
            </svg>
          </div>
        </div>

        {/* Sign in section */}
        <div className="mb-16">
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-700/50 bg-neutral-800/30 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-2xl font-bold text-neutral-100">
                Sign in to your account
              </h1>
              <p className="text-sm text-neutral-400">
                Access your secure file storage
              </p>
            </div>

            <SignInButton forceRedirectUrl={"/drive"}>
              <button className="h-10 rounded-md border border-neutral-700 bg-neutral-800 px-6 text-white transition-colors hover:bg-neutral-700 has-[>svg]:px-4">
                Sign In
              </button>
            </SignInButton>

            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500">
                Secure authentication powered by Clerk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
