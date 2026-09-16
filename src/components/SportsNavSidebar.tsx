import React from 'react';
import { 
  Flame, 
  Calendar, 
  History, 
  Trophy, 
  ShieldCheck, 
  Clock, 
  Layers
} from 'lucide-react';
import { useTranslation } from '../i18n';

interface SportsNavSidebarProps {
  activeTab: 'active' | 'history';
  onTabChange: (tab: 'active' | 'history') => void;
  dateFilter: 'all' | 'today' | 'tomorrow' | 'week';
  onDateFilterChange: (f: 'all' | 'today' | 'tomorrow' | 'week') => void;
  genderFilter: 'all' | 'men' | 'women';
  onGenderFilterChange: (g: 'all' | 'men' | 'women') => void;
  surfaceFilter: 'all' | 'clay' | 'hard';
  onSurfaceFilterChange: (s: 'all' | 'clay' | 'hard') => void;
  liveCount: number;
  todayCount: number;
  atpCount: number;
  wtaCount: number;
  isVerified: boolean;
  onOpenModal: () => void;
}

export const SportsNavSidebar: React.FC<SportsNavSidebarProps> = ({
  activeTab,
  onTabChange,
  dateFilter,
  onDateFilterChange,
  genderFilter,
  onGenderFilterChange,
  surfaceFilter,
  onSurfaceFilterChange,
  liveCount,
  todayCount,
  atpCount,
  wtaCount,
  isVerified,
  onOpenModal,
}) => {
  const { t } = useTranslation();

  return (
    <nav className="sports-nav-sidebar" aria-label="Tennis Tournament Navigation">
      {/* ── SECTION 1: TIMELINE & STATUS ── */}
      <div className="nav-section">
        <div className="nav-section-title">{t('sportsNav.timelineSection', 'TIMELINE & STATUS')}</div>
        <div className="nav-items-list">
          <button
            className={`nav-item-btn ${activeTab === 'active' && dateFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              onTabChange('active');
              onDateFilterChange('all');
            }}
          >
            <div className="nav-item-left">
              <Flame size={15} color="#f87171" className={liveCount > 0 ? 'pulse-icon' : ''} />
              <span>{t('sportsNav.allActiveMatches', 'All Active Matches')}</span>
            </div>
            {liveCount > 0 && <span className="nav-live-dot">{liveCount} {t('sportsNav.live', 'Live')}</span>}
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'active' && dateFilter === 'today' ? 'active' : ''}`}
            onClick={() => {
              onTabChange('active');
              onDateFilterChange('today');
            }}
          >
            <div className="nav-item-left">
              <Clock size={15} color="#d4a843" />
              <span>{t('sportsNav.todaysMatches', "Today's Matches")}</span>
            </div>
            <span className="nav-item-badge">{todayCount}</span>
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'active' && dateFilter === 'tomorrow' ? 'active' : ''}`}
            onClick={() => {
              onTabChange('active');
              onDateFilterChange('tomorrow');
            }}
          >
            <div className="nav-item-left">
              <Calendar size={15} color="#38bdf8" />
              <span>{t('sportsNav.tomorrowsSchedule', "Tomorrow's Schedule")}</span>
            </div>
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onTabChange('history')}
          >
            <div className="nav-item-left">
              <History size={15} color="#a3e635" />
              <span>{t('sportsNav.settledResults', 'Settled Results & ROI')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── SECTION 2: TOURS (ATP / WTA FOCUS) ── */}
      <div className="nav-section">
        <div className="nav-section-title">{t('sportsNav.proTours', 'PROFESSIONAL TOURS')}</div>
        <div className="nav-items-list">
          <button
            className={`nav-item-btn ${genderFilter === 'all' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('all')}
          >
            <div className="nav-item-left">
              <Trophy size={15} color="#d4a843" />
              <span>{t('sportsNav.allTours', 'All Tours (Combined)')}</span>
            </div>
            <span className="nav-item-badge">{atpCount + wtaCount}</span>
          </button>

          <button
            className={`nav-item-btn ${genderFilter === 'men' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('men')}
          >
            <div className="nav-item-left">
              <span className="tour-badge-pill tour-pill-atp">ATP</span>
              <span>{t('sportsNav.atpMensTour', "ATP Men's Tour")}</span>
            </div>
            <span className="nav-item-badge badge-atp-count">{atpCount}</span>
          </button>

          <button
            className={`nav-item-btn ${genderFilter === 'women' ? 'active' : ''}`}
            onClick={() => onGenderFilterChange('women')}
          >
            <div className="nav-item-left">
              <span className="tour-badge-pill tour-pill-wta">WTA</span>
              <span>{t('sportsNav.wtaWomensTour', "WTA Women's Tour")}</span>
            </div>
            <span className="nav-item-badge badge-wta-count">{wtaCount}</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 3: COURT SURFACE ── */}
      <div className="nav-section">
        <div className="nav-section-title">{t('sportsNav.courtSurface', 'COURT SURFACE')}</div>
        <div className="surface-pills-row">
          <button
            className={`surface-pill-btn ${surfaceFilter === 'all' ? 'active' : ''}`}
            onClick={() => onSurfaceFilterChange('all')}
          >
            {t('sportsNav.surfaceAll', 'All')}
          </button>
          <button
            className={`surface-pill-btn ${surfaceFilter === 'hard' ? 'active' : ''}`}
            onClick={() => onSurfaceFilterChange('hard')}
          >
            🟦 {t('sportsNav.surfaceHard', 'Hard')}
          </button>
          <button
            className={`surface-pill-btn ${surfaceFilter === 'clay' ? 'active' : ''}`}
            onClick={() => onSurfaceFilterChange('clay')}
          >
            🧱 {t('sportsNav.surfaceClay', 'Clay')}
          </button>
        </div>
      </div>

      {/* ── SECTION 4: AI ENGINE STATUS ── */}
      <div className="nav-ai-status-card">
        <div className="nav-ai-status-top">
          <div className="nav-ai-status-indicator">
            <span className="ai-live-beacon" />
            <span className="nav-ai-status-label">{t('sportsNav.predictiveAi', 'PREDICTIVE AI v3.2')}</span>
          </div>
          <span className="nav-ai-status-badge">{t('sportsNav.kpisActive', '77 KPIs Active')}</span>
        </div>
        <div className="nav-ai-status-title">{t('sportsNav.neuralPipeline', '5-Agent Neural Pipeline')}</div>
        <div className="nav-ai-status-desc">
          {t('sportsNav.neuralPipelineDesc', 'Continuous Bayesian updating for physical stamina, court ELO & tactical simulations.')}
        </div>
        <div className="nav-ai-status-footer">
          <span className="ai-footer-dot" />
          <span>{t('sportsNav.feedsActive', 'Real-time odds & injury feeds active')}</span>
        </div>
      </div>
    </nav>
  );
};
