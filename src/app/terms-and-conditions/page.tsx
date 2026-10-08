import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { TERMS_AND_CONDITIONS } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply to using the EVINN website and services.",
};

export default function TermsPage() {
  return <LegalPage document={TERMS_AND_CONDITIONS} />;
}
