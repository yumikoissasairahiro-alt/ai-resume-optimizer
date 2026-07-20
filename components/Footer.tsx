import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-sm text-gray-500 text-center py-6 border-t mt-12">
      <Link href="/privacy" className="hover:underline mr-4">
        Privacy Policy
      </Link>
      <Link href="/terms" className="hover:underline">
        Terms of Service
      </Link>
    </footer>
  );
}
