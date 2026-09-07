import React, { useEffect } from 'react';
import type { Prediction } from '../types';
import { 
  ArrowLeft, Trophy, Sparkles, ShieldAlert,
  CheckCircle2, Flame, Share2, Lock, ExternalLink
} from 'lucide-react';
import { 
  formatMatchTime, 
  getSurfaceEmoji, 
  formatPlayerDisplayName, 
  getMatchGender, 
  parseAiDossierSections 
} from '../utils/formatters';

interface MatchSeoViewProps {
  prediction: Prediction;
  selectedTimezone: string;
  isLocked?: boolean;
  onBack: () => void;
  onUnlockClick?: () => void;
}

export const MatchSeoView: React.FC<MatchSeoViewProps> = ({
  prediction,
  selectedTimezone,
  isLocked = false,
  onBack,
  onUnlockClick,
}) => {
  const homeDisplay = formatPlayerDisplayName(prediction.home_name);
  const awayDisplay = formatPlayerDisplayName(prediction.away_name);
  const surfaceEmoji = getSurfaceEmoji(prediction.surface);
  const matchGender = getMatchGender(
    prediction.tournament_name,
    prediction.round_name,
    `${prediction.home_name} vs ${prediction.away_name}`,
    prediction.home_name,
    prediction.away_name
  );
  const tourBadge = matchGender === 'women' ? 'WTA' : 'ATP';
  const winProb = prediction.win_probability || 60;
  const isHomeWinner = prediction.predicted_winner
    ? prediction.predicted_winner.toLowerCase().includes(prediction.home_name.toLowerCase())
    : true;

  const matchTitle = `${prediction.home_name} vs ${prediction.away_name}`;
  const seoHeadline = `${matchTitle} Prediction & Match Tactical Analysis | Ptin AI`;
  const seoDescription = prediction.ai_summary
    ? prediction.ai_summary.slice(0, 160).replace(/[\n\r]+/g, ' ')
    : `Expert AI tennis analysis, win probability, and statistical breakdown for ${matchTitle} at ${prediction.tournament_name || 'ATP/WTA Tour'}.`;

  const canonicalUrl = `https://ptin-ai.com/?match=${prediction.fixture_id || prediction.id}`;

  // ─── Dynamic SEO & Schema.org JSON-LD Injection ─────────────────────────────
  useEffect(() => {
    // 1. Update Document Title & Meta Description
    const prevTitle = document.title;
    document.title = seoHeadline;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute('content');
    metaDesc.setAttribute('content', seoDescription);

    // 2. Inject Google Schema.org Structured Data
    const schemaScriptId = 'ptin-seo-schema-jsonld';
    let scriptEl = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaScriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SportsEvent',
          'name': matchTitle,
          'sport': 'Tennis',
          'startDate': prediction.match_date || new Date().toISOString(),
          'location': {
            '@type': 'Place',
            'name': prediction.tournament_name || 'Tennis Tour',
          },
          'competitor': [
            { '@type': 'Person', 'name': prediction.home_name },
            { '@type': 'Person', 'name': prediction.away_name },
          ],
        },
        {
          '@type': 'NewsArticle',
          'headline': seoHeadline,
          'description': seoDescription,
          'datePublished': prediction.published_at || new Date().toISOString(),
          'mainEntityOfPage': canonicalUrl,
          'publisher': {
            '@type': 'Organization',
            'name': 'Ptin AI',
            'url': 'https://ptin-ai.com',
          },
          'author': {
            '@type': 'Organization',
            'name': 'Ptin AI Sports Analytics Team',
          },
        },
      ],
    };

    scriptEl.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = prevTitle;
      if (prevDesc) metaDesc?.setAttribute('content', prevDesc);
      const existing = document.getElementById(schemaScriptId);
      if (existing) existing.remove();
    };
  }, [matchTitle, seoHeadline, seoDescription, canonicalUrl, prediction]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seoHeadline,
          text: `Check out the AI match breakdown for ${matchTitle} on Ptin AI!`,
          url: canonicalUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(canonicalUrl);
      alert('Link copied to clipboard!');
    }
  };

  const sections = parseAiDossierSections(prediction.ai_summary);

  return (
    <div className="seo-match-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '0.45rem 0.9rem',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> All Matches
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--accent-cyan)',
              padding: '0.45rem 0.9rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>

      {/* Hero Match Banner */}
      <div className="glass" style={{ padding: '1.4rem', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Tournament & Surface Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 800, color: matchGender === 'women' ? '#f472b6' : '#38bdf8' }}>{tourBadge}</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: 'white' }}>{prediction.tournament_name || 'ATP Tour'}</span>
            {prediction.round_name && (
              <>
                <span>•</span>
                <span>{prediction.round_name}</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{surfaceEmoji} {prediction.surface || 'Hard Court'}</span>
            <span>•</span>
            <span>{formatMatchTime(prediction.match_date, selectedTimezone)}</span>
          </div>
        </div>

        {/* Competitors Scoreboard Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
          {/* Home Player */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
              {homeDisplay}
            </div>
            {isHomeWinner && (
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(34, 197, 94, 0.15)', padding: '0.2rem 0.55rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={11} /> PREDICTED WINNER
              </span>
            )}
          </div>

          {/* VS Divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.6rem', borderRadius: 20 }}>
              VS
            </span>
          </div>

          {/* Away Player */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', textAlign: 'right' }}>
              {awayDisplay}
            </div>
            {!isHomeWinner && (
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(34, 197, 94, 0.15)', padding: '0.2rem 0.55rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={11} /> PREDICTED WINNER
              </span>
            )}
          </div>
        </div>

        {/* Model Confidence Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            <span>Projected Winner: <strong style={{ color: 'white' }}>{prediction.predicted_winner}</strong></span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>{winProb}% Win Probability</span>
          </div>
          <div className="confidence-bar-track" style={{ height: 6 }}>
            <div className="confidence-bar-fill" style={{ width: `${winProb}%` }} />
          </div>
        </div>
      </div>

      {/* Locked State: Partner Referral Unlock */}
      {isLocked ? (
        <div
          className="glass"
          style={{
            padding: '2rem 1.5rem',
            borderRadius: 14,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.05) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} color="#fbbf24" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
              Specialist AI Match Dossier Locked
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.5, margin: '0 auto' }}>
              Complete instant free registration with our verified partner bookmaker to unlock deep 5-agent tactical breakdowns and upset alerts.
            </p>
          </div>
          <button
            onClick={onUnlockClick}
            className="btn-primary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShieldAlert size={16} /> Unlock Full AI Dossier with Partner
          </button>
        </div>
      ) : (
        /* Unlocked: Full 5-Agent Dossier Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={16} /> In-Depth Tactical & Statistical Match Analysis
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                style={{
                  background: sec.bg,
                  border: `1px solid ${sec.border}`,
                  borderLeft: `3px solid ${sec.color}`,
                  borderRadius: 10,
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 800, color: sec.color, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  <span style={{ fontSize: '1rem' }}>{sec.icon}</span>
                  <span>{sec.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.6, color: '#e2e8f0', textAlign: 'left' }}>
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Key Decisive Factors */}
          {prediction.key_factors && prediction.key_factors.length > 0 && (
            <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 10 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={14} /> Key Decisive Factors:
              </div>
              <ul style={{ paddingLeft: '1.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {prediction.key_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Upset Scenario */}
          {prediction.devils_advocate_risk && !sections.some(s => s.type === 'risk') && (
            <div
              style={{
                fontSize: '0.82rem',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.8rem 1rem',
                borderRadius: 10,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#f87171' }}>⚠️ Critical Upset Scenario: </strong>
              {prediction.devils_advocate_risk}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
