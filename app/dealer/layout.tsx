import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowRoles={["dealer", "admin"]}>{children}</ProtectedRoute>;
}
