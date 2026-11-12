'use client';

import React from 'react';
import IntelliWattLogo from '@/components/brand/IntelliWattLogo';

export default function ExportPdfHeader({
  documentTitle = 'Energy Monitoring & Telemetry Report',
  reportPeriod = 'Real-Time IoT Snapshot',
}: {
  documentTitle?: string;
  reportPeriod?: string;
}) {
  return (
    <div
      className="export-pdf-header"
      style={{
        display: 'none', // Visible only when exporting / printing via @media print
        width: '100%',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #D4AF37',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <IntelliWattLogo size="lg" align="center" glow={false} showSubtitle={true} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: '1rem',
          padding: '0 0.5rem',
          fontFamily: 'Manrope, sans-serif',
          fontSize: '0.8rem',
          color: '#333333',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#000000', fontFamily: 'Sora, sans-serif' }}>
            {documentTitle}
          </div>
          <div style={{ color: '#666666', marginTop: 2 }}>Period: {reportPeriod}</div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#666666' }}>
          <div>Hardware: ESP32 + PZEM-004T</div>
          <div>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
        </div>
      </div>
    </div>
  );
}
