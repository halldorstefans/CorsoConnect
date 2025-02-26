import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/component";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        if (!supabase.auth)
          throw new Error("Supabase client is not initialized");

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.error("Session error:", sessionError);
          return null;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          console.error("Get user error:", error);
          return null;
        }

        return data.user;
      } catch (error) {
        console.error("Failed to get user:", error);
        return null;
      }
    };

    const checkAuth = async () => {
      const fetchedUser = await getUser();

      if (requireAuth && !fetchedUser) {
        router.push("/auth");
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setLoading(false);
        } else if (requireAuth) {
          router.push("/auth");
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, [requireAuth, router, supabase.auth]);

  if (requireAuth && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-neutral-600">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-20 p-6">{children}</main>
    </div>
  );
};

export default Layout;
