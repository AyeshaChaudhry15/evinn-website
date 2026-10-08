import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PRIVACY_POLICY } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How EVINN collects, uses and protects your information.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage document={PRIVACY_POLICY} />;
}
