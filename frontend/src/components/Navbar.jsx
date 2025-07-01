import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";
import LoginModal from "./LoginModal";

function Navbar({ className }) {
  const [active, setActive] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, loginWithTwitter, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsAccountMenuOpen(false); // Close account dropdown
    setIsMenuOpen(false); // Ensure mobile menu is closed
    navigate("/");
  };

  const handleLogin = async () => {
    await loginWithTwitter();
  };

  if (location.pathname === "/") {
    return null;
  }

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-4xl mx-auto z-50", className)}
    >
      <Menu
        setActive={setActive}
        className="justify-between w-full px-8 py-4 rounded-full bg-[#F9F6F7] border border-[#FFE8D6]"
      >
        <div className="text-black font-bold text-lg">
          <MenuItem
            setActive={setActive}
            active={active}
            item="OakmemeStratton"
            href="/dashboard"
          />
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <MenuItem
            setActive={setActive}
            active={active}
            item="Portfolio"
            href="/portfolio"
          />
          <MenuItem
            setActive={setActive}
            active={active}
            item="Council"
            href="/council"
          />
          <MenuItem
            setActive={setActive}
            active={active}
            item="OakCoin"
            href="/oakcoin"
          />
        </div>

        <div className="hidden md:flex items-center space-x-4 text-black">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            Twitter
          </a>
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            Telegram
          </a>
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
              >
                {user.mode === "development" ? (
                  <span className="font-medium">dev</span>
                ) : user.photo ? (
                  <>
                    <img
                      src={user.photo}
                      alt={user.displayName || user.username || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.displayName || user.username || user.email}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">👤</span>
                    <span className="font-medium">{user.username || user.email}</span>
                  </>
                )}
              </button>
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-full border border-black/20 text-black bg-white flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors font-bold"
              >
                <span className="text-lg">📝</span>
                Sign up
              </button>
              {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
            </>
          )}
        </div>
        {/* Hamburger Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>
      </Menu>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 bg-[#F9F6F7] rounded-2xl p-6 text-black shadow-lg border border-[#FFE8D6]">
          <nav className="flex flex-col items-start space-y-4 text-lg">
            <Link
              to="/portfolio"
              className="hover:text-[#FF971D]"
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/council"
              className="hover:text-[#FF971D]"
              onClick={() => setIsMenuOpen(false)}
            >
              Council
            </Link>
            <Link
              to="/oakcoin"
              className="hover:text-[#FF971D]"
              onClick={() => setIsMenuOpen(false)}
            >
              OakCoin
            </Link>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF971D]"
            >
              Twitter
            </a>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF971D]"
            >
              Telegram
            </a>
            <hr className="w-full my-2 border-gray-200" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  {user.mode === "development" ? (
                    <span className="font-medium">dev</span>
                  ) : user.photo ? (
                    <>
                      <img
                        src={user.photo}
                        alt={user.displayName || user.username || user.email}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{user.displayName || user.username || user.email}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">👤</span>
                      <span className="font-medium">{user.username || user.email}</span>
                    </>
                  )}
                </div>
                <div
                  onClick={handleLogout}
                  className="cursor-pointer hover:text-[#FF971D] py-2"
                >
                  Logout
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() => { setIsMenuOpen(false); setShowLoginModal(true); }}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#FF971D] py-2 font-bold"
                >
                  <span className="text-lg">📝</span>
                  <span>Sign up</span>
                </div>
                {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

export default Navbar;
