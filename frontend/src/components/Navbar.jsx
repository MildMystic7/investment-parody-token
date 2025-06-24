import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "../lib/utils";

function Navbar({ className }) {
  const [active, setActive] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
          <div className="hover:opacity-80 transition-opacity cursor-pointer">
            Account
          </div>
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
            <div className="hover:text-[#FF971D] cursor-pointer">Account</div>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Navbar;
