import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import SyncStatus from "./SyncStatus";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // If we're done loading and authentication is required but no user exists
    if (!isLoading && requireAuth && !user) {
      router.push("/auth");
    } else if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading, requireAuth, router, user]);

  if (requireAuth && (isLoading || !authChecked)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-neutral-600">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-20 p-6">
        {user && (
          <div className="fixed bottom-4 right-4 z-40">
            <SyncStatus />
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
