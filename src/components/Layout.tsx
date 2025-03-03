import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import SkipToContent from "./SkipToContent";
import SyncStatus from "./SyncStatus";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Corso Connect",
  requireAuth = false,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      setIsRedirecting(true);
      router.push("/auth");
    }
  }, [isLoading, requireAuth, user, router]);

  if (isLoading || isRedirecting) {
    return (
      <div
        className="min-h-screen flex justify-center items-center bg-background"
        role="status"
        aria-live="polite"
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"
          aria-hidden="true"
        ></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="Track and manage your vehicle maintenance"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SkipToContent />
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main
          className="flex-grow pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
        <footer className="bg-neutral-800 text-neutral-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm">
                  &copy; {new Date().getFullYear()} Corso Connect. All rights
                  reserved.
                </p>
              </div>
              {user && (
                <div className="flex items-center">
                  <span className="text-sm mr-2">Sync Status:</span>
                  <SyncStatus showDetails={false} />
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
