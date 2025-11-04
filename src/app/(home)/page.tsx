import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-neutral-900 to-neutral-950 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo/Brand area */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-800 shadow-2xl">
            <svg
              className="h-8 w-8 text-neutral-200"
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
          <h1 className="mb-6 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-300 bg-clip-text text-5xl font-bold text-transparent md:text-6xl lg:text-7xl">
            filevault
          </h1>
        </div>

        {/* Main content */}
        <div className="mb-12">
          <p className="mx-auto mb-4 max-w-2xl text-xl text-neutral-300 md:text-2xl">
            Secure, fast, and easy file storage for the modern web
          </p>
          <p className="mx-auto max-w-lg text-sm text-neutral-500 md:text-base">
            Store, organize, and share your files with enterprise-grade security
            and lightning-fast access from anywhere.
          </p>
        </div>

        {/* CTA Section */}
        <form
          action={async () => {
            "use server";

            const session = await auth();

            if (!session.userId) {
              return redirect("/sign-in");
            }

            return redirect("/drive");
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              Get Started
            </Button>
            <p className="text-xs text-neutral-500">
              No credit card required • Start organizing your files today
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <svg
                className="h-5 w-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-neutral-200">Secure</h3>
            <p className="text-sm text-neutral-400">
              End-to-end encryption keeps your files safe and private.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-neutral-200">Fast</h3>
            <p className="text-sm text-neutral-400">
              Lightning-fast uploads and downloads worldwide.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-6 backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-neutral-200">Easy</h3>
            <p className="text-sm text-neutral-400">
              Intuitive interface that just works out of the box.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
