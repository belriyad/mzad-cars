"use client";

import { useAuthStore } from "@/store/auth-store";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";

function AdminRoleWall({ email }: { email?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-lg w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Admin access required</h1>
            <p className="text-sm text-neutral-500">
              Logged in as <strong>{email}</strong> — role is <code className="bg-neutral-100 px-1 rounded">user</code>, needs <code className="bg-neutral-100 px-1 rounded">admin</code>
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-700">
          To elevate this account to admin, SSH into the backend server and run:
        </p>

        <pre className="bg-neutral-900 text-green-400 rounded-xl px-4 py-3 text-xs overflow-x-auto leading-relaxed">
{`sqlite3 /path/to/mzad.db \\
"UPDATE users SET role='admin' \\
 WHERE email='${email ?? "your@email.com"}'"`}
        </pre>

        <p className="text-xs text-neutral-500">
          Or if using PostgreSQL:
        </p>
        <pre className="bg-neutral-900 text-green-400 rounded-xl px-4 py-3 text-xs overflow-x-auto leading-relaxed">
{`UPDATE users SET role='admin'
WHERE email='${email ?? "your@email.com"}';`}
        </pre>

        <p className="text-sm text-neutral-500">
          After running, log out and log back in — the new role will be in the JWT.
        </p>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Re-login
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium hover:bg-neutral-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  // Not loaded yet — show a skeleton instead of null/blank
  if (!hydrated) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  // Not logged in — ProtectedRoute handles redirect
  if (!token || !user) {
    return <ProtectedRoute allowRoles={["admin"]}>{children}</ProtectedRoute>;
  }

  // Logged in but wrong role — show helpful wall
  if (user.role !== "admin") {
    return <AdminRoleWall email={user.email} />;
  }

  return <>{children}</>;
}
