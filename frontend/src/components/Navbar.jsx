import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "../lib/utils";

function Navbar({ className }) {
  const [active, setActive] = useState(null);
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
        className="justify-between w-full px-8 py-4 rounded-full bg-[#141414] border border-[#1f1f1f]"
      >
        <div className="text-white font-bold text-lg">
          <MenuItem
            setActive={setActive}
            active={active}
            item="OakmemeStratton"
            href="/dashboard"
          />
        </div>

        <div className="flex items-center space-x-4">
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

        <div className="flex items-center space-x-4 text-white">
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
      </Menu>
    </div>
  );
}

export default Navbar;
