import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Flame,
  Lock,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Layers,
} from 'lucide-react';
import type { Prediction } from '../../types';
import type { MappedDeepAnalytics } from '../../match/mapDeepAnalytics';
import { parseAiDossierSections } from '../../utils/formatters';
import { useTranslation } from '../../i18n';

interface MatchDeepAnalysisProps {
  match: Prediction;
  analytics: MappedDeepAnalytics | null;
  canSeeFullAi: boolean;
  onUnlockClick?: () => void;
}

interface DossierSlideItem {
  id: string;
  type: string;
  title: string;
  shortTitle: string;
  icon: string | React.ReactNode;
  color: string;
  bgTint: string;
  borderColor: string;
  badge: string;
  content: React.ReactNode;
}

export const MatchDeepAnalysis: React.FC<MatchDeepAnalysisProps> = ({
  match,
  analytics,
  canSeeFullAi,
  onUnlockClick,
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'slider' | 'stack'>('slider');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const allSections = parseAiDossierSections(match.ai_summary || '');
  // Exclude duplicate upset scenario / risk sections from the core sections
  const sections = allSections.filter(
    s => s.type !== 'risk' &&
         !s.title.toLowerCase().includes('upset scenario') &&
         !s.title.toLowerCase().includes('devils advocate')
  );

  // Single source of truth for the red Critical Upset Scenario
  const upsetRisk = (match.devils_advocate_risk && match.devils_advocate_risk.trim()) ||
    allSections.find(
      s => s.type === 'risk' ||
           s.title.toLowerCase().includes('upset scenario') ||
           s.title.toLowerCase().includes('devils advocate')
    )?.body?.trim();

  // Deduplicate cards against upsetRisk
  const cards = (analytics?.cards || []).filter(c => {
    const titleLower = c.title.toLowerCase();
    if (titleLower.includes('upset scenario') || titleLower.includes('devils advocate')) return false;
    if (upsetRisk && c.description.trim() === upsetRisk) return false;
    return true;
  });

  // Build unified slides array
  const slides: DossierSlideItem[] = useMemo(() => {
    const items: DossierSlideItem[] = [];

    const toShortTitle = (title: string, fallback: string): string => {
      const t = title.toLowerCase();
      if (t.includes('executive') || t.includes('overview')) return 'Overview';
      if (t.includes('statistical') || t.includes('dynamics') || t.includes('surface')) return 'Dynamics';
      if (t.includes('physical') || t.includes('fatigue') || t.includes('conditioning')) return 'Physical';
      if (t.includes('historical') || t.includes('fortitude') || t.includes('mental')) return 'Mental';
      if (t.includes('strategic') || t.includes('projection') || t.includes('verdict')) return 'Strategy';
      if (t.includes('factor')) return 'Factors';
      if (t.includes('upset') || t.includes('risk') || t.includes('devil')) return 'Upset Risk';
      return fallback;
    };

    // 1. AI Text Sections
    sections.forEach((sec, idx) => {
      let badge = 'TACTICAL INTEL';
      if (sec.type === 'overview') badge = 'EXECUTIVE SUMMARY';
      else if (sec.type === 'statistical') badge = 'SURFACE & STATS';
      else if (sec.type === 'physical') badge = 'STAMINA & REST';
      else if (sec.type === 'historical') badge = 'H2H & PSYCHOLOGY';
      else if (sec.type === 'verdict') badge = 'AI PROJECTION';

      items.push({
        id: `sec-${idx}`,
        type: sec.type,
        title: sec.title,
        shortTitle: toShortTitle(sec.title, `Insight ${idx + 1}`),
        icon: sec.icon,
        color: sec.color || '#38bdf8',
        bgTint: sec.bg || 'rgba(56, 189, 248, 0.04)',
        borderColor: sec.border || 'rgba(56, 189, 248, 0.2)',
        badge,
        content: <p className="dossier-card-body">{sec.body}</p>,
      });
    });

    // 2. Key Decisive Factors
    if (match.key_factors && match.key_factors.length > 0) {
      items.push({
        id: 'key-factors',
        type: 'factors',
        title: t('deepAnalysis.keyDecisiveFactors', 'KEY DECISIVE FACTORS'),
        shortTitle: t('deepAnalysis.shortFactors', 'Key Factors'),
        icon: <ShieldCheck size={16} className="text-emerald" />,
        color: '#34d399',
        bgTint: 'rgba(52, 211, 153, 0.04)',
        borderColor: 'rgba(52, 211, 153, 0.22)',
        badge: t('deepAnalysis.decisiveEdges', 'DECISIVE EDGES'),
        content: (
          <ul className="dossier-factors-list">
            {match.key_factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ),
      });
    }

    // 3. Critical Upset Scenario
    if (upsetRisk) {
      items.push({
        id: 'upset-risk',
        type: 'risk',
        title: t('deepAnalysis.criticalUpsetRisk', 'CRITICAL UPSET SCENARIO'),
        shortTitle: t('deepAnalysis.shortUpsetRisk', 'Upset Risk'),
        icon: <AlertTriangle size={16} className="text-rose" />,
        color: '#f87171',
        bgTint: 'rgba(239, 68, 68, 0.04)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
        badge: 'DEVILS ADVOCATE',
        content: <p className="dossier-risk-body">{upsetRisk}</p>,
      });
    }

    // 4. Additional Analytics Cards
    cards.forEach((card, idx) => {
      items.push({
        id: `card-${idx}`,
        type: 'analytics-card',
        title: card.title,
        shortTitle: toShortTitle(card.title, `Card ${idx + 1}`),
        icon: <Flame size={15} style={{ color: 'var(--accent-amber)' }} />,
        color: '#fbbf24',
        bgTint: 'rgba(251, 191, 36, 0.04)',
        borderColor: 'rgba(251, 191, 36, 0.2)',
        badge: 'ADDITIONAL INTEL',
        content: <p className="dossier-card-body">{card.description}</p>,
      });
    });

    return items;
  }, [sections, match.key_factors, upsetRisk, cards]);

  // Keep active index within bounds if slide count changes
  useEffect(() => {
    if (activeIndex >= slides.length && slides.length > 0) {
      setActiveIndex(slides.length - 1);
    }
  }, [slides.length, activeIndex]);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activePill = tabsContainerRef.current.querySelector<HTMLElement>('.dossier-tab-pill.active');
    if (activePill) {
      activePill.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && activeIndex < slides.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  // Gated Teaser View
  if (!canSeeFullAi) {
    const previewSections = sections.length > 0 ? sections.slice(0, 1) : [];

    return (
      <div className="dossier-gate-container">
        {/* Background Teaser Content (Blurred) */}
        <div className="dossier-gate-blur-bg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="dossier-section-header">
              <Sparkles size={14} className="text-cyan" />
              <span>Pro Tactical Dossier &amp; Simulation</span>
            </div>
            {previewSections.length > 0 ? (
              <div className="dossier-card">
                <div className="dossier-card-header">
                  <span className="dossier-card-icon">{previewSections[0].icon}</span>
                  <span className="dossier-card-title">{previewSections[0].title}</span>
                </div>
                <p className="dossier-card-body">{previewSections[0].body}</p>
              </div>
            ) : (
              <div className="dossier-card">
                <p className="dossier-card-body">
                  Breakdown of hold/break synergy, court geometry advantages, and fatigue indexes.
                </p>
              </div>
            )}
            <div className="dossier-card">
              <div className="dossier-card-header">
                <Flame size={14} style={{ color: 'var(--accent-amber)' }} />
                <span className="dossier-card-title" style={{ color: 'var(--accent-amber)' }}>Key Decisive Factors</span>
              </div>
              <ul className="dossier-factors-list">
                <li>Second serve exploit differential on return games</li>
                <li>Clutch tiebreak win probability under pressure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Foreground Elegant Blur Gate Card */}
        <div className="dossier-gate-overlay">
          <div className="dossier-gate-lock-icon">
            <Lock size={20} />
          </div>
          <h3 className="dossier-gate-title">{t('deepAnalysis.gateTitle', 'Full Tactical Dossier & Simulation')}</h3>
          <p className="dossier-gate-subtitle">
            {t('deepAnalysis.gateSubtitle', 'Advanced serve/return KPIs, matchup exploit analysis, and upset scenarios are available for members.')}
          </p>
          {onUnlockClick && (
            <button
              type="button"
              className="btn-primary dossier-gate-btn"
              onClick={onUnlockClick}
            >
              <span>{t('deepAnalysis.connectForAccess', 'Connect Account for Full Access')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback if no sections or slides exist
  if (slides.length === 0) {
    return (
      <div className="dossier-container">
        <div className="dossier-section-header">
          <Sparkles size={14} className="text-cyan" />
          <span>{t('deepAnalysis.tacticalDossier', 'Tactical Match Dossier')}</span>
        </div>
        <div className="dossier-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('deepAnalysis.notAvailable', 'Detailed dossier text is not available for this match yet.')}
        </div>
      </div>
    );
  }

  // Stack Mode (User toggled to see all sections stacked vertically)
  if (viewMode === 'stack') {
    return (
      <div className="dossier-container">
        <div className="dossier-section-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} className="text-cyan" />
            <span>{t('deepAnalysis.tacticalDossier', 'Tactical Match Dossier')}</span>
          </div>
          <button
            type="button"
            className="dossier-toggle-btn"
            onClick={() => setViewMode('slider')}
            title={t('deepAnalysis.slideView', 'Slide View')}
          >
            <Sliders size={12} />
            <span>{t('deepAnalysis.slideView', 'Slide View')}</span>
          </button>
        </div>

        <div className="dossier-cards-stack">
          {slides.map(slide => (
            <div
              key={slide.id}
              className="dossier-card"
              style={{
                background: slide.bgTint,
                borderColor: slide.borderColor,
                borderLeft: `3px solid ${slide.color}`,
              }}
            >
              <div className="dossier-card-header">
                <span className="dossier-card-icon">{slide.icon}</span>
                <span className="dossier-card-title">{slide.title}</span>
              </div>
              {slide.content}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Slide in Slider Mode
  const activeSlide = slides[activeIndex] || slides[0];

  return (
    <div className="dossier-slider-container">
      {/* ── Slider Top Bar ── */}
      <div className="dossier-slider-header">
        <div className="dossier-slider-title-group">
          <div className="dossier-slider-title">
            <Sparkles size={14} className="text-cyan" />
            <span>{t('deepAnalysis.tacticalDossier', 'Tactical Match Dossier')}</span>
          </div>
          {slides.length > 1 && (
            <div className="dossier-slider-badge-counter">
              <span>{activeIndex + 1}</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span>{slides.length}</span>
            </div>
          )}
        </div>

        <div className="dossier-slider-actions">
          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="dossier-icon-nav-btn"
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                title={t('deepAnalysis.prev', 'Prev')}
                aria-label={t('deepAnalysis.prev', 'Prev')}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                className="dossier-icon-nav-btn"
                onClick={() => setActiveIndex(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={activeIndex === slides.length - 1}
                title={t('deepAnalysis.next', 'Next')}
                aria-label={t('deepAnalysis.next', 'Next')}
              >
                <ChevronRight size={15} />
              </button>
            </>
          )}

          <button
            type="button"
            className="dossier-toggle-btn"
            onClick={() => setViewMode('stack')}
            title={t('deepAnalysis.viewAll', 'View All')}
          >
            <Layers size={12} />
            <span>{t('deepAnalysis.viewAll', 'View All')}</span>
          </button>
        </div>
      </div>

      {/* ── Quick Navigation Tab Pills ── */}
      {slides.length > 1 && (
        <div className="dossier-tabs-nav" ref={tabsContainerRef}>
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                className={`dossier-tab-pill ${isActive ? 'active' : ''}`}
                style={
                  isActive
                    ? {
                        borderColor: slide.color,
                        background: slide.bgTint,
                        color: '#ffffff',
                      }
                    : undefined
                }
                onClick={() => setActiveIndex(idx)}
              >
                <span className="dossier-pill-icon">{slide.icon}</span>
                <span>{slide.shortTitle}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Active Slide Viewport (Touch Swipeable) ── */}
      <div
        className="dossier-slide-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={activeSlide.id}
          className="dossier-slide-card"
          style={{
            background: activeSlide.bgTint,
            borderColor: activeSlide.borderColor,
            borderLeft: `3px solid ${activeSlide.color}`,
          }}
        >
          <div className="dossier-slide-header">
            <div className="dossier-slide-title-wrap">
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{activeSlide.icon}</span>
              <span>{activeSlide.title}</span>
            </div>
            {activeSlide.badge && (
              <span className="dossier-slide-badge" style={{ color: activeSlide.color }}>
                {activeSlide.badge}
              </span>
            )}
          </div>

          {activeSlide.content}
        </div>
      </div>

      {/* ── Bottom Controls (Nav Buttons & Indicator Dots) ── */}
      {slides.length > 1 && (
        <div className="dossier-slider-footer">
          <button
            type="button"
            className="dossier-nav-btn"
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={14} />
            <span>{t('deepAnalysis.prev', 'Prev')}</span>
          </button>

          <div className="dossier-dots">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`dossier-dot ${idx === activeIndex ? 'active' : ''}`}
                style={idx === activeIndex ? { background: activeSlide.color, boxShadow: `0 0 10px ${activeSlide.color}80` } : undefined}
                onClick={() => setActiveIndex(idx)}
                title={slide.title}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="dossier-nav-btn"
            onClick={() => setActiveIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={activeIndex === slides.length - 1}
          >
            <span>{t('deepAnalysis.next', 'Next')}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
