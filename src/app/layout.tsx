import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Topbar  from '@/components/layout/Topbar';
import Footer  from '@/components/layout/Footer';
import ExportPdfHeader from '@/components/export/ExportPdfHeader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import PageTransition from '@/components/ui/PageTransition';
import GlobalLogoSync from '@/components/brand/GlobalLogoSync';

export const metadata: Metadata = {
  title:       { default: 'IntelliWatt — Smart Energy Intelligence', template: '%s — IntelliWatt — Smart Energy Intelligence' },
  description: 'Professional IoT energy monitoring and optimization platform. Real-time voltage, current, power & relay control via ESP32 and Firebase.',
  keywords:    ['IoT', 'energy monitor', 'ESP32', 'smart meter', 'power monitoring', 'Firebase'],
  authors:     [{ name: 'IntelliWatt' }],
  manifest:    '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: [
      { url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor:   '#050505',
  width:        'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Synchronous pre-paint check & autonomous bulletproof loader fail-safe */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              // Initialize synchronized brand logo timeline angle immediately before first paint
              try {
                var angle = ((Date.now() % 24000) / 24000) * 360;
                document.documentElement.style.setProperty('--global-logo-rotation', angle.toFixed(2) + 'deg');
              } catch(e) {}

              try {
                var s = sessionStorage.getItem('intelliwatt_intro_seen');
                if (!s) {
                  document.documentElement.classList.add('intelliwatt-intro-active');
                }
              } catch(e) {}

              function forceDismiss() {
                try {
                  document.documentElement.classList.remove('intelliwatt-intro-active');
                  var overlay = document.getElementById('premium-intro-overlay');
                  if (overlay) {
                    overlay.style.transition = 'opacity 300ms ease, transform 300ms ease';
                    overlay.style.opacity = '0';
                    overlay.style.pointerEvents = 'none';
                    setTimeout(function() {
                      if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                      }
                    }, 350);
                  }
                  var app = document.querySelector('.app-layout');
                  if (app) {
                    app.style.opacity = '1';
                    app.style.visibility = 'visible';
                    app.style.pointerEvents = 'auto';
                  }
                } catch(err) {
                  console.warn('[FailSafe] Error dismissing loader:', err);
                }
              }

              window.__intelliwatt_dismiss_loader = forceDismiss;

              // Absolute hard fail-safe: dismiss after 2.2s maximum if not already finished
              setTimeout(function() {
                var overlay = document.getElementById('premium-intro-overlay');
                if (overlay && window.getComputedStyle(overlay).opacity !== '0') {
                  console.warn('[IntelliWatt] Max intro loading timeout reached. Automatically revealing application.');
                  forceDismiss();
                }
              }, 2200);

              // Instant interaction bypass: dismiss immediately if user clicks or touches the screen
              window.addEventListener('click', forceDismiss, { once: true, capture: true });
              window.addEventListener('keydown', forceDismiss, { once: true, capture: true });
              window.addEventListener('touchstart', forceDismiss, { once: true, capture: true });
            })();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <GlobalLogoSync />
        <PremiumLoader />
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main id="main" className="page-wrapper" role="main">
              <ExportPdfHeader />
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
