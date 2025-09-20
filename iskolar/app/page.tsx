import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e3f0ff] via-[#f5f7fa] to-[#e3f0ff] py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center relative" style={{ boxShadow: "0 8px 32px 0 rgba(60,60,60,0.12)" }}>
        <Image
          src="/IskoLAR.png"
          alt="IskoLAR Logo"
          width={80}
          height={80}
          className="mb-3"
          priority
        />
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">IskoLAR</h1>
        <div className="text-md text-gray-500 mb-7">Scholar Portal</div>
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/auth/sign-in"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-lg shadow hover:opacity-90 transition text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold text-lg bg-white shadow hover:bg-gray-50 transition text-center"
          >
            Register
          </Link>
        </div>
        <div className="mt-6 text-sm text-gray-700 flex flex-col items-center">
          <span>Need help?{' '}
            <Link href="#" className="text-[#1976D2] font-medium hover:underline">Contact Support</Link>
          </span>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-400">© 2025 IskoLAR</div>
    </div>
  );
}
