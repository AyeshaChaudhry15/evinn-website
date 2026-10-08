export interface LegalDocument {
  badge: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
}

export const PRIVACY_POLICY: LegalDocument = {
  badge: "Privacy",
  title: "Privacy Policy",
  intro:
    "Your privacy is important to us. This Privacy Policy explains how EVINN collects, uses and protects your information.",
  lastUpdated: "September 2026",
  sections: [
    {
      heading: "Introduction",
      body: "EVINN respects your privacy and is committed to protecting personal information that may be collected when you use our website, contact us, browse vehicle information or use our services.",
    },
    {
      heading: "Information We Collect",
      body: "Depending on how you interact with our website, we may collect information such as your name, email address, phone number and other information that you voluntarily provide through forms or inquiries.",
    },
    {
      heading: "Automatically Collected Information",
      body: "When you visit our website, certain technical information may be collected automatically. This may include browser type, device information, approximate location, pages visited and general usage information.",
    },
    {
      heading: "How We Use Your Information",
      body: "Information may be used to respond to inquiries, provide requested services, improve our website, communicate with users, understand website usage and maintain the security and functionality of our services.",
    },
    {
      heading: "Cookies",
      body: "Our website may use cookies or similar technologies to improve website functionality, remember preferences and understand how visitors interact with the website.",
    },
    {
      heading: "Sharing of Information",
      body: "EVINN does not sell or rent your personal information. We may share information with trusted service providers when necessary to operate our website or provide requested services, or when required by applicable law.",
    },
    {
      heading: "Data Security",
      body: "We take reasonable measures to protect information against unauthorized access, misuse, alteration or disclosure. However, no internet transmission or storage system can be guaranteed to be completely secure.",
    },
    {
      heading: "Third-Party Websites",
      body: "Our website may include links to external websites. We are not responsible for the privacy practices or content of those third-party websites. We recommend reviewing their privacy policies before providing personal information.",
    },
    {
      heading: "Children's Privacy",
      body: "Our website is not intended to knowingly collect personal information from children. If you believe that a child has provided personal information to us, please contact us so that appropriate action can be taken.",
    },
    {
      heading: "Your Privacy Choices",
      body: "Depending on applicable law, you may have rights regarding your personal information, including requesting access, correction or deletion of information you have provided to us.",
    },
    {
      heading: "Changes to This Privacy Policy",
      body: "We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated revision date.",
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  badge: "Legal",
  title: "Terms & Conditions",
  intro: "Please read these Terms & Conditions carefully before using the EVINN website and services.",
  lastUpdated: "September 2026",
  sections: [
    {
      heading: "Acceptance of Terms",
      body: "By accessing and using the EVINN website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue use of the website.",
    },
    {
      heading: "About EVINN",
      body: "EVINN provides information about electric bikes, electric scooters, their specifications, features, prices, brands and related services. The information displayed on the website is provided for general informational purposes.",
    },
    {
      heading: "Product Information",
      body: "We make reasonable efforts to ensure that product names, specifications, images, prices and other information are accurate. However, product information may change without notice and EVINN does not guarantee that all information will always be completely accurate or up to date.",
    },
    {
      heading: "Prices & Availability",
      body: "Prices, availability and specifications of vehicles may change at any time. Any price displayed on the website should be considered subject to confirmation before purchase or booking.",
    },
    {
      heading: "User Responsibilities",
      body: "Users agree to use the website only for lawful purposes. You must not attempt to interfere with the operation of the website, misuse its content, or use the website for fraudulent or unauthorized activities.",
    },
    {
      heading: "Intellectual Property",
      body: "All website content, including text, graphics, logos, design, images, icons and other materials, is protected by applicable intellectual property laws. Content may not be copied, reproduced or distributed without appropriate permission.",
    },
    {
      heading: "Third-Party Links",
      body: "The website may contain links to third-party websites or services. EVINN is not responsible for the content, policies, availability or practices of third-party websites.",
    },
    {
      heading: "Disclaimer",
      body: "EVINN provides the website and its content on an “as available” basis. We do not guarantee that the website will always be available, error-free or completely accurate.",
    },
    {
      heading: "Limitation of Liability",
      body: "To the maximum extent permitted by applicable law, EVINN will not be responsible for losses or damages resulting from the use of, or inability to use, the website or information provided through it.",
    },
    {
      heading: "Changes to These Terms",
      body: "EVINN may update these Terms & Conditions from time to time. Updated terms will be posted on this page, and continued use of the website after changes means you accept the updated terms.",
    },
  ],
};
