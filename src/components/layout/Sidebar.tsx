'use client';

import React, { useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  BarChart3,
  Cpu,
  ToggleRight,
  Info,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Navigation',
    items: [
      { href: '/',          icon: Home,            label: 'Home' },
      { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { href: '/analytics', icon: BarChart3,       label: 'Energy Analytics' },
      { href: '/devices',   icon: Cpu,             label: 'Connected Devices' },
      { href: '/relay',     icon: ToggleRight,     label: 'Control Center' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/about',                   icon: Info,     label: 'About IntelliWatt' },
      { href: '/about#meet-the-builders', icon: Users,    label: 'Meet the Builders' },
      { href: '/settings',                icon: Settings, label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Proactively warm up routes on hover/pointer-down for instantaneous first-click navigation
  const handlePrefetch = useCallback(
    (href: string) => {
      try {
        const clean = href.split('#')[0];
        if (clean) router.prefetch(clean);
      } catch {
        // ignore
      }
    },
    [router]
  );

  // Instant responsive navigation on the very first click
  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.includes('#')) {
        const [targetPath, hash] = href.split('#');
        const isCurrentPage = pathname === targetPath || (targetPath === '' && (pathname === '/about' || pathname === '/'));

        if (isCurrentPage) {
          e.preventDefault();
          const targetEl = document.getElementById(hash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.pushState(null, '', href);
          }
          return;
        }
      } else if (pathname === href) {
        // If clicking the current page link, smoothly scroll to top immediately
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [pathname]
  );

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      {/* Brand Header */}
      <Link
        href="/"
        onClick={(e) => handleItemClick(e, '/')}
        onMouseEnter={() => handlePrefetch('/')}
        onPointerDown={() => handlePrefetch('/')}
        style={{ textDecoration: 'none', display: 'block' }}
        aria-label="IntelliWatt Home"
      >
        <div className="sidebar-logo">
          <IntelliWattLogo size="md" align="center" glow={true} showSubtitle={true} sculptureRotate={true} />
        </div>
      </Link>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-label">{section.title}</div>
            <div className="sidebar-section-items">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isHash = item.href.includes('#');
                const baseHref = item.href.split('#')[0];
                const active = isHash
                  ? false
                  : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleItemClick(e, item.href)}
                    onMouseEnter={() => handlePrefetch(item.href)}
                    onPointerDown={() => handlePrefetch(item.href)}
                    className={`sidebar-item ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    prefetch={true}
                  >
                    <span className="sidebar-item-icon">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="sidebar-item-text">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Card */}
      <div className="sidebar-footer">
        <Link
          href="/profile"
          className="profile-card"
          title="Open Premium Executive Profile"
          aria-label="K. Abhiram - Project Lead, HITAM"
          prefetch={true}
        >
          <div className="profile-card-top-row">
            <div className="profile-card-avatar-wrapper">
              <Image
                src="/profile.jpg"
                alt="K. Abhiram"
                width={44}
                height={44}
                className="profile-card-avatar"
                priority
                unoptimized
              />
              <span className="profile-card-online-indicator" title="Online" />
            </div>

            <div className="profile-card-identity">
              <div className="profile-card-name">K. Abhiram</div>
              <div className="profile-card-role-row">
                <span className="profile-card-role-tag">Project Lead</span>
                <span className="profile-status-live-tag">
                  <span className="live-dot" />
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="profile-card-institute">
            Hyderabad Institute of Technology and Management (HITAM)
          </div>
        </Link>
      </div>
    </aside>
  );
}
