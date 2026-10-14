import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF8A00]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-soft">
          The page you&apos;re looking for doesn&apos;t exist or is no longer
          available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonPrimary}>
            Back to Home
          </Link>
          <Link href="/vehicles" className={buttonSecondary}>
            Browse Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}
