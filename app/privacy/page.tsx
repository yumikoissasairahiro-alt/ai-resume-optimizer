import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | AI Resume Optimizer",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 20, 2026</p>

      <p className="mb-6">
        This Privacy Policy explains how AI Resume Optimizer ("we", "our", "the Service")
        collects, uses, and protects your information when you use our website and services.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Your email address (for account creation and login via Google OAuth or magic link).</li>
        <li>The content of resumes you upload or paste into the Service.</li>
        <li>Job descriptions you provide, and the optimized resume content we generate for you.</li>
        <li>Payment and subscription status (we do not store your card details — see Section 3).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use AI to Process Your Data</h2>
      <p className="mb-6">
        To generate optimized resumes, the content of your resume and any job description you
        provide is sent to OpenAI, our third-party AI provider, for processing. OpenAI processes
        this data solely to generate a response and does not use it to train their models under
        our API agreement. By using the Service, you consent to this transfer of your resume and
        job description content to OpenAI for the purpose of generating your results.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Payment Processing</h2>
      <p className="mb-6">
        All payments are processed by Stripe, Inc. We do not store your credit card number or
        payment credentials on our servers. Stripe's own privacy policy governs how your payment
        information is handled.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Authentication & Cookies</h2>
      <p className="mb-6">
        We use Supabase Auth to manage your login session. This may involve cookies or local
        storage tokens necessary for keeping you signed in. We do not use these for advertising
        or tracking purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention & Deletion</h2>
      <p className="mb-6">
        We retain your account data and generation history for as long as your account is active.
        If you would like your data deleted, please email us at{" "}
        <a href="mailto:support@yourdomain.com" className="text-blue-600 underline">
          support@yourdomain.com
        </a>{" "}
        and we will delete your personal data within a reasonable timeframe, except where retention
        is required by law.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Sharing</h2>
      <p className="mb-6">
        We do not sell your personal data. We only share data with the third-party processors
        described above (OpenAI, Stripe, Supabase) strictly to operate the Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Contact</h2>
      <p className="mb-6">
        Questions about this policy can be sent to{" "}
        <a href="mailto:support@yourdomain.com" className="text-blue-600 underline">
          support@yourdomain.com
        </a>
        .
      </p>

      <Link href="/" className="text-blue-600 underline">
        ← Back to home
      </Link>
    </div>
  );
}
