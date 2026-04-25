"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("user_email") || "";
    setAdminEmail(email);
    // Extract first name from email: ajay.grandhisila07@gmail.com → "Ajay"
    const namePart = email.split("@")[0].split(".")[0];
    setAdminName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("user_role");
    router.push("/signin");
  };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span className={styles.logoText}>
            Kizuna<span className={styles.logoAccent}>Hire</span>
          </span>
        </div>

        {/* Right — Admin Profile */}
        <div className={styles.navLinks}>
          {/* Admin badge */}
          <div className={styles.adminBadge}>
            <span className={styles.adminDot} />
            <span>Admin</span>
          </div>

          {/* Profile dropdown */}
          <div className={styles.dropdownWrap} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen(o => !o)}
              aria-label="Admin menu"
            >
              {/* Avatar circle */}
              <div className={styles.avatar}>
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.avatarInfo}>
                <span className={styles.avatarName}>{adminName}</span>
              </div>
              {/* Chevron */}
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className={styles.dropdown}>
                {/* Header */}
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>{adminName.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className={styles.dropdownName}>{adminName}</p>
                    <p className={styles.dropdownEmail}>{adminEmail}</p>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                {/* Menu Items */}
                <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); router.push("/admin/profile"); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile
                </button>

                <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); router.push("/admin/stats"); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  Statistics
                </button>

                <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); router.push("/admin/interviews"); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  Interviews
                </button>

                <div className={styles.dropdownDivider} />
                <button className={`${styles.dropdownItem} ${styles.dropdownLogout}`} onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
