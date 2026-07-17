// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Globe", href: "/explore" },
  { label: "History", href: "/history" },
  { label: "News", href: "/news" },
  { label: "Games", href: "/games" },
  { label: "Donate", href: "/donate" },
];

const EXTERNAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Pansony67" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pannadhorn-rugseree-90a8b6403/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/pancantalk/?theme=dark",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-2 backdrop-blur-md">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <span className="mx-1 h-4 w-px bg-white/15" />

        {EXTERNAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href === "#" ? undefined : "_blank"}
            rel={link.href === "#" ? undefined : "noopener noreferrer"}
            className="rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
