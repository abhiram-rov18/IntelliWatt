'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Sparkles, X, Linkedin } from 'lucide-react';
import { TEAM_MEMBERS, type TeamMember } from '@/data/team';
import styles from './TeamMembersSection.module.css';

interface BuilderCardProps {
  member: TeamMember;
  index: number;
  onSelect: (member: TeamMember) => void;
}

const BuilderCard = memo(function BuilderCard({ member, index, onSelect }: BuilderCardProps) {
  const handleClick = useCallback(() => {
    onSelect(member);
  }, [member, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(member);
      }
    },
    [member, onSelect]
  );

  const linkedInUrl = member.linkedin.startsWith('http')
    ? member.linkedin
    : `https://${member.linkedin}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${styles.builderCard} ${styles.animateEnter} ${styles[`stagger${index}`]}`}
      aria-label={`View profile poster of ${member.name}, ${member.role}`}
    >
      {/* Top Edge Specular Highlight */}
      <div
        className={`${styles.cardSpecularLine} ${member.isLead ? styles.leadSpecularLine : ''}`}
      />

      {/* Floating LinkedIn Quick-Connect Icon Button */}
      {member.linkedin && (
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cardLinkedInBtn}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open ${member.name}'s LinkedIn profile in a new tab`}
          title={`View ${member.name} on LinkedIn`}
        >
          <Linkedin size={15} />
        </a>
      )}

      {/* Portrait Area */}
      <div className={styles.portraitArea}>
        <Image
          src={member.image}
          alt={`${member.name} — ${member.role}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.portraitImg}
          priority={index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
          quality={90}
        />

        {/* Seamless gradient fade into card body */}
        <div className={styles.portraitOverlay} />
      </div>

      {/* Content Body — Ends immediately after the department line */}
      <div className={styles.cardBody}>
        <h3 className={styles.memberName}>{member.name}</h3>
        <div className={styles.designation}>{member.role}</div>
        <div className={styles.department}>{member.dept}</div>
      </div>
    </div>
  );
});

export default function TeamMembersSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Manage background scroll lock and Escape key listener
  useEffect(() => {
    if (!selectedMember) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMember]);

  const closeModal = useCallback(() => {
    setSelectedMember(null);
  }, []);

  return (
    <section
      id="meet-the-builders"
      aria-label="Meet the Builders"
      className={styles.sectionWrapper}
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Master Floating Liquid Glass Container */}
      <div className={styles.liquidGlassContainer}>
        {/* Specular Master Top Rail */}
        <div className={styles.specularTopLine} />

        {/* Conductive Ambient Particle Layer */}
        <div className={styles.conductiveBackdrop} />

        {/* Section Header */}
        <div className={styles.headerWrapper}>
          <div className={styles.eyebrow}>
            <Sparkles size={13} color="var(--gold-bright, #F5D76E)" />
            <span>Engineering Leadership</span>
          </div>

          <h2 className={styles.title}>MEET THE BUILDERS</h2>

          <p className={styles.subtitle}>
            The engineering minds behind IntelliWatt — designing intelligent hardware, scalable cloud infrastructure, embedded systems, and AI-powered energy solutions.
          </p>
        </div>

        {/* Team Cards Grid (Desktop: 4 in 1 row, Tablet: 2x2, Mobile: 1x4) */}
        <div className={styles.cardsGrid}>
          {TEAM_MEMBERS.map((member, index) => (
            <BuilderCard
              key={member.id}
              member={member}
              index={index}
              onSelect={setSelectedMember}
            />
          ))}
        </div>
      </div>

      {/* Centered Profile Poster Modal rendered directly into document.body via React Portal */}
      {selectedMember &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedMember.name} Profile Poster`}
          >
            {/* Top-Right Floating Accessible Close Button */}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={closeModal}
              aria-label="Close modal (Escape)"
              title="Close (ESC)"
            >
              <X size={22} />
            </button>

            {/* Centered Poster Card */}
            <div
              className={styles.modalPosterWrapper}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.posterContainer}>
                {/* Profile Poster Artwork (Preserves exact 819 / 1024 aspect ratio, scaled proportionally) */}
                <Image
                  src={selectedMember.poster}
                  alt={`${selectedMember.name} — Meet The Builder Poster`}
                  className={styles.posterImage}
                  width={819}
                  height={1024}
                  priority
                  quality={95}
                />

                {/* Invisible clickable overlay placed precisely on top of the LinkedIn logo */}
                <a
                  href={
                    selectedMember.linkedin.startsWith('http')
                      ? selectedMember.linkedin
                      : `https://${selectedMember.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkedInOverlay}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${selectedMember.name} on LinkedIn (opens in new tab)`}
                  title={`View ${selectedMember.name} on LinkedIn`}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
