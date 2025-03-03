import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    // Handle escape key press
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = () => {
    setMenuOpen(!menuOpen);
  };

  const closeDropdown = () => {
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    closeDropdown();
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full bg-primary text-neutral-200 shadow-lg z-50"
      role="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-heading"
            aria-label="Corso Connect Home"
          >
            Corso Connect
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="hover:text-primary-hover transition">
              Home
            </Link>
            {user && (
              <Link
                href="/vehicles"
                className="hover:text-primary-hover transition"
              >
                Vehicles
              </Link>
            )}
            <>
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    ref={dropdownButtonRef}
                    className="flex items-center gap-2 px-3 py-1 bg-neutral-800 text-neutral-200 rounded hover:bg-primary-hover transition"
                    onClick={toggleDropdown}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? "true" : "false"}
                  >
                    {user.email}
                    <span className="ml-2" aria-hidden="true">
                      ▼
                    </span>
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-background text-primary shadow-lg rounded-lg"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-error hover:bg-neutral-200 transition"
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover transition"
                >
                  Sign In
                </Link>
              )}
            </>
          </div>

          <button
            ref={mobileMenuButtonRef}
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-primary text-background py-4"
          role="menu"
        >
          <div className="flex flex-col items-center space-y-4">
            <Link
              href="/"
              className="hover:text-primary-hover transition"
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="hover:text-primary-hover transition"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                Dashboard
              </Link>
            )}
            <>
              {user ? (
                <>
                  <button
                    onClick={handleSignOut}
                    className="bg-error px-4 py-2 rounded-lg hover:bg-error-bg transition"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover transition"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  Sign In
                </Link>
              )}
            </>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
