import { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="fixed top-0 left-0 w-full bg-primary text-neutral-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-heading">
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
                    className="flex items-center gap-2 px-3 py-1 bg-neutral-800 text-neutral-200 rounded hover:bg-primary-hover transition"
                    onClick={toggleDropdown}
                  >
                    {user.email}
                    <span className="ml-2">▼</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background text-primary shadow-lg rounded-lg">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-primary-hover"
                        onClick={closeDropdown}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 hover:bg-error text-neutral-600"
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
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-primary text-background py-4">
          <div className="flex flex-col items-center space-y-4">
            <Link
              href="/"
              className="hover:text-primary-hover transition"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="hover:text-primary-hover transition"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="hover:text-primary-hover transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-error px-4 py-2 rounded-lg hover:bg-error-bg transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover transition"
                  onClick={() => setMenuOpen(false)}
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
