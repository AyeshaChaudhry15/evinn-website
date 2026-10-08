"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20 text-center">
      <div role="alert">
        <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
        <p className="mt-3 max-w-md text-soft">
          We couldn&apos;t load this page. This is usually temporary, so please
          try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className={buttonPrimary}
          >
            Try again
          </button>
          <Link href="/" className={buttonSecondary}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
