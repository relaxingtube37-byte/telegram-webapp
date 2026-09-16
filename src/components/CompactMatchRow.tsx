import React from 'react';
import type { ContentLayerFlags, Prediction, ReferralSite } from '../types';
import {
  Clock, CheckCircle2, XCircle, ChevronRight,
  Tv, Sparkles, Lock, Trophy, PauseCircle
} from 'lucide-react';
import {
  formatMatchTime,
  getCompactDateLabel,
  formatMatchSubLabel,
  getSurfaceEmoji,
  formatPlayerDisplayName,
  getMatchGender,
  parseTennisScore
} from '../utils/formatters';
import { buildPartnerWatchUrl, openExternalLink, shouldShowWatchLive } from '../utils/referralLinks';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerImageUrl } from '../utils/playerImage';
import { useTranslation } from '../i18n';

export interface CompactMatchRowProps {
  prediction: Prediction;
  selectedTimezone: string;
  isLocked?: boolean;
  isSelected?: boolean;
  onUnlockClick?: () => void;
  onOpenMatchPage?: (prediction: Prediction) => void;
  apiBase?: string;
  referralSites?: ReferralSite[];
  trackingId?: string | number;
  contentLayers?: ContentLayerFlags;
  canWatchLive?: boolean;
}

export const CompactMatchRow: React.FC<CompactMatchRowProps> = ({
  prediction,
  selectedTimezone,
  isLocked = false,
  isSelected = false,
  onUnlockClick,
  onOpenMatchPage,
  apiBase = '',
  referralSites = [],
  trackingId = 'anonymous',
  canWatchLive = true,
}) => {
  const { t } = useTranslation();
  const matchGender = getMatchGender(
    prediction.tournament_name,
    prediction.round_name,
    `${prediction.home_name} vs ${prediction.away_name}`,
    prediction.home_name,
    prediction.away_name
  );
  const isWomen = matchGender === 'women';

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleClick = () => {
    triggerHaptic();
    onOpenMatchPage?.(prediction);
  };

  const rawDateStr = prediction.match_date || prediction.published_at;
  const matchTimeStr = formatMatchTime(rawDateStr, selectedTimezone);
  const matchDateLabel = getCompactDateLabel(rawDateStr, selectedTimezone);

  const isRowLocked = isLocked || prediction.content_locked === true;
  const isHomeWinner = !isRowLocked && Boolean(prediction.predicted_winner && prediction.predicted_winner !== 'LOCKED' && prediction.predicted_winner === prediction.home_name);
  const isAwayWinner = !isRowLocked && Boolean(prediction.predicted_winner && prediction.predicted_winner !== 'LOCKED' && prediction.predicted_winner === prediction.away_name);
  const winProb = !isRowLocked ? (prediction.win_probability || 65) : null;

  const rawScore = (prediction.result_score || '').trim();
  const isMatchInFuture = rawDateStr ? new Date(rawDateStr).getTime() > Date.now() + 15 * 60 * 1000 : false;
  const isZeroScore = !rawScore || rawScore === '0-0   0-0    0-0' || rawScore === '0-0' || rawScore === '0:0';

  // Safeguard: Matches that have not started yet are strictly classified as UPCOMING
  const effectiveStatus = (prediction.status === 'LIVE' && isZeroScore && isMatchInFuture)
    ? 'UPCOMING'
    : prediction.status;

  const parsedScore = parseTennisScore(prediction.result_score, effectiveStatus);

  const homeAvatarUrl = getPlayerImageUrl(prediction.home_image, prediction.home_name, prediction.home_id, apiBase);
  const awayAvatarUrl = getPlayerImageUrl(prediction.away_image, prediction.away_name, prediction.away_id, apiBase);

  // Status Badge
  const renderStatus = () => {
    if (effectiveStatus === 'WON') {
      return (
        <span className="tennis-status-badge badge-won">
          <CheckCircle2 size={11} />
          <span>{t('matchRow.status.won', 'WON')}</span>
        </span>
      );
    }
    if (effectiveStatus === 'LOST') {
      return (
        <span className="tennis-status-badge badge-lost">
          <XCircle size={11} />
          <span>{t('matchRow.status.lost', 'LOST')}</span>
        </span>
      );
    }
    if (effectiveStatus === 'LIVE') {
      return (
        <span className="tennis-status-badge badge-live">
          <span className="live-dot-pulse" />
          <span>{t('matchRow.status.live', 'LIVE')}</span>
        </span>
      );
    }
    if (effectiveStatus === 'INTERRUPTED') {
      return (
        <span className="tennis-status-badge badge-interrupted" title="Match Interrupted / Rain Delay">
          <PauseCircle size={11} />
          <span>{t('matchRow.status.paused', 'PAUSED')}</span>
        </span>
      );
    }
    if (effectiveStatus === 'POSTPONED') {
      return (
        <span className="tennis-status-badge badge-postponed" title="Match Postponed">
          <Clock size={10} className="status-clock-icon" />
          <span>{t('matchRow.status.postponed', 'POSTP.')}</span>
        </span>
      );
    }
    if (effectiveStatus === 'VOID') {
      return <span className="tennis-status-badge badge-void">{t('matchRow.status.void', 'VOID')}</span>;
    }
    return (
      <span className="tennis-status-badge badge-upcoming" title={matchTimeStr !== '--:--' ? `Time: ${matchTimeStr}` : 'Upcoming Match'}>
        <Clock size={10} className="status-clock-icon" />
        <span className="match-time-text">{matchTimeStr !== '--:--' ? matchTimeStr : t('matchRow.status.upcoming', 'Upcoming')}</span>
      </span>
    );
  };

  const showWatch = canWatchLive && shouldShowWatchLive(effectiveStatus, rawDateStr);
  const isFinished = effectiveStatus === 'WON' || effectiveStatus === 'LOST' || effectiveStatus === 'VOID';
  const isLive = effectiveStatus === 'LIVE';
  const subLabelInfo = formatMatchSubLabel(
    isFinished || isLive ? '' : matchDateLabel,
    prediction.round_name
  );

  return (
    <div
      className={`tennis-match-row ${isWomen ? 'match-row-wta' : 'match-row-atp'} ${isSelected ? 'row-active-selected' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Open match ${prediction.home_name} vs ${prediction.away_name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* ── Mobile Tier 1: Header Meta Bar (Only visible on mobile screens) ── */}
      <div className="match-mobile-header">
        <div className="match-mobile-header-left">
          {renderStatus()}
          {subLabelInfo.text && (
            <span className="match-round-tag" title={subLabelInfo.fullTitle}>
              {subLabelInfo.text}
            </span>
          )}
        </div>

        <div className="match-mobile-header-right">
          {showWatch && (
            <button
              type="button"
              className="btn-watch-live-mini"
              title="Watch Live Stream"
              onClick={(e) => {
                e.stopPropagation();
                const url = buildPartnerWatchUrl({ apiBase, sites: referralSites, trackingId });
                if (url) openExternalLink(url);
                else onUnlockClick?.();
              }}
            >
              <Tv size={11} />
              <span>{t('matchRow.liveStream', 'Live')}</span>
            </button>
          )}

          {isRowLocked ? (
            <span
              className="mobile-vip-indicator"
              title="VIP Prediction Locked"
              onClick={(e) => {
                e.stopPropagation();
                onUnlockClick?.();
              }}
            >
              <Lock size={10} />
              <span>{t('matchRow.vipBadge', 'VIP')}</span>
            </span>
          ) : winProb ? (
            <span className="mobile-winprob-indicator" title={`AI Model Win Probability: ${winProb}%`}>
              <Sparkles size={9} style={{ marginRight: 2 }} /> {winProb}%
            </span>
          ) : null}

          <div className="row-open-cta" title="Open Full Match Intelligence">
            <ChevronRight size={16} className="chevron-open-icon" />
          </div>
        </div>
      </div>

      {/* ── Main Content Area (Tier 2 on Mobile, Full 5-Column Row on Desktop) ── */}
      <div className="match-main-content">
        {/* ── Column 1: Time / Status (Desktop only) ── */}
        <div className="match-col-status">
          {renderStatus()}
          {subLabelInfo.text && (
            <span className="match-round-tag" title={subLabelInfo.fullTitle}>
              {subLabelInfo.text}
            </span>
          )}
        </div>

        {/* ── Column 2: Players & Odds ── */}
        <div className="match-col-players">
          {/* Home Player */}
          <div className={`player-row ${isHomeWinner ? 'player-is-winner' : ''}`}>
            <div className="player-info">
              <PlayerAvatar
                name={prediction.home_name}
                imageUrl={homeAvatarUrl}
                size={22}
                isWinner={isHomeWinner}
              />
              <span className={`player-name-text ${isHomeWinner ? 'selected-pick-name' : ''}`}>
                {isHomeWinner && <span className="selected-pick-check">✓</span>}
                {formatPlayerDisplayName(prediction.home_name)}
              </span>
            </div>

            <div className="player-row-right">
              {prediction.home_odds && prediction.home_odds !== 'N/A' && (
                <span className={`player-odds-tag ${isHomeWinner ? 'odds-selected-accent' : ''}`}>{prediction.home_odds}</span>
              )}
            </div>
          </div>

          {/* Away Player */}
          <div className={`player-row ${isAwayWinner ? 'player-is-winner' : ''}`}>
            <div className="player-info">
              <PlayerAvatar
                name={prediction.away_name}
                imageUrl={awayAvatarUrl}
                size={22}
                isWinner={isAwayWinner}
              />
              <span className={`player-name-text ${isAwayWinner ? 'selected-pick-name' : ''}`}>
                {isAwayWinner && <span className="selected-pick-check">✓</span>}
                {formatPlayerDisplayName(prediction.away_name)}
              </span>
            </div>

            <div className="player-row-right">
              {prediction.away_odds && prediction.away_odds !== 'N/A' && (
                <span className={`player-odds-tag ${isAwayWinner ? 'odds-selected-accent' : ''}`}>{prediction.away_odds}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Column 3: Dedicated Results Column (Aligned with each player's row: Home on top, Away on bottom) ── */}
        <div className={`match-col-score ${!parsedScore ? 'score-col-empty' : ''}`}>
          {/* Micro Headers: SET, GM, PTS */}
          {isLive && parsedScore ? (
            <div className="score-col-headers">
              <span className="score-header-label">{t('matchRow.table.set', 'SET')}</span>
              <span className="score-header-label">{t('matchRow.table.game', 'GM')}</span>
              <span className="score-header-label">{t('matchRow.table.pts', 'PTS')}</span>
            </div>
          ) : isFinished && parsedScore && parsedScore.homeSets !== undefined ? (
            <div className="score-col-headers single-col">
              <span className="score-header-label">{t('matchRow.table.set', 'SET')}</span>
            </div>
          ) : null}

          {/* Row 1: Home Player Score (aligned with Home Player name) */}
          <div className="player-score-row" title={`Home Player Score: ${formatPlayerDisplayName(prediction.home_name)}`}>
            {isLive && parsedScore ? (
              <div className="player-score-cells">
                <span className="score-cell cell-set" title="Sets Won">
                  <span className="cell-num">{parsedScore.homeSets || '0'}</span>
                </span>
                <span className="score-cell cell-game" title="Current Set Games">
                  <span className="cell-num">{parsedScore.homeGames || '0'}</span>
                </span>
                <span className="score-cell cell-point" title="Current Game Points">
                  <span className="cell-num pts-accent">{parsedScore.homePoints || '0'}</span>
                </span>
              </div>
            ) : isFinished && parsedScore ? (
              // Walkover / Retirement: no individual sets — show summary label in row 1
              parsedScore.homeSets === undefined ? (
                <span className="score-walkover-label">{parsedScore.setsScore}</span>
              ) : (
                <div className="player-score-cells">
                  <span
                    className={`score-cell cell-final-set ${Number(parsedScore.homeSets) > Number(parsedScore.awaySets) ? 'is-winner' : ''}`}
                    title="Final Sets Won"
                  >
                    <span className="cell-num">{parsedScore.homeSets}</span>
                  </span>
                </div>
              )
            ) : (
              <span className="score-dash">—</span>
            )}
          </div>

          {/* Row 2: Away Player Score (aligned with Away Player name) */}
          <div className="player-score-row" title={`Away Player Score: ${formatPlayerDisplayName(prediction.away_name)}`}>
            {isLive && parsedScore ? (
              <div className="player-score-cells">
                <span className="score-cell cell-set" title="Sets Won">
                  <span className="cell-num">{parsedScore.awaySets || '0'}</span>
                </span>
                <span className="score-cell cell-game" title="Current Set Games">
                  <span className="cell-num">{parsedScore.awayGames || '0'}</span>
                </span>
                <span className="score-cell cell-point" title="Current Game Points">
                  <span className="cell-num pts-accent">{parsedScore.awayPoints || '0'}</span>
                </span>
              </div>
            ) : isFinished && parsedScore ? (
              // Walkover / Retirement: row 2 is empty (label shown in row 1)
              parsedScore.awaySets === undefined ? (
                <span className="score-dash">—</span>
              ) : (
                <div className="player-score-cells">
                  <span
                    className={`score-cell cell-final-set ${Number(parsedScore.awaySets) > Number(parsedScore.homeSets) ? 'is-winner' : ''}`}
                    title="Final Sets Won"
                  >
                    <span className="cell-num">{parsedScore.awaySets}</span>
                  </span>
                </div>
              )
            ) : (
              <span className="score-dash">—</span>
            )}
          </div>
        </div>


        {/* ── Column 3.5: AI Prediction & Win Probability ── */}
        <div className="match-col-ai">
          {isRowLocked ? (
            <div
              className="ai-pred-locked-state"
              onClick={(e) => {
                e.stopPropagation();
                onUnlockClick?.();
              }}
              title="Click to complete 2-step verification and unlock prediction"
              style={{ cursor: 'pointer' }}
            >
              <div className="ai-pred-headline">
                <span className="ai-pred-label" style={{ color: '#fbbf24' }}>
                  <Lock size={9} className="ai-sparkle-icon" /> {t('matchRow.vipPick', 'VIP Pick')}
                </span>
                <span className="ai-prob-pct" style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                  🔒 {t('matchRow.locked', 'Locked')}
                </span>
              </div>

              {/* Locked Track */}
              <div className="ai-prob-track">
                <div
                  className="ai-prob-fill"
                  style={{ width: '0%', background: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              <div className="ai-meta-subrow">
                <span className="ai-winner-name compact-winner-name ai-unlock-cta" style={{ color: '#fbbf24', fontSize: '0.62rem', fontWeight: 700 }}>
                  {t('matchRow.unlockAnalysis', 'Unlock Analysis ➔')}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="ai-pred-headline">
                <span className="ai-pred-label">
                  <Sparkles size={10} className="ai-sparkle-icon" /> {t('matchRow.aiForecast', 'AI Forecast')}
                </span>
                <span className="ai-prob-pct">{winProb}%</span>
              </div>

              {/* Dual Progress Bar */}
              <div className="ai-prob-track">
                <div
                  className="ai-prob-fill"
                  style={{ width: `${Math.min(Math.max(winProb || 65, 10), 96)}%` }}
                />
              </div>

              <div className="ai-meta-subrow">
                <span className="ai-winner-name compact-winner-name truncate-text">
                  {prediction.predicted_winner ? formatPlayerDisplayName(prediction.predicted_winner) : t('matchRow.pick', 'Pick')}
                </span>
                {prediction.confidence && (
                  <span className="ai-conf-chip">★ {prediction.confidence}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Column 4: Quick Action & Arrow ── */}
        <div className="match-col-action">
          {showWatch && (
            <button
              type="button"
              className="btn-watch-live-mini"
              title="Watch Live Stream"
              onClick={(e) => {
                e.stopPropagation();
                const url = buildPartnerWatchUrl({ apiBase, sites: referralSites, trackingId });
                if (url) openExternalLink(url);
                else onUnlockClick?.();
              }}
            >
              <Tv size={11} />
              <span className="hide-on-mobile">{t('matchRow.liveStream', 'Live')}</span>
            </button>
          )}

          {/* Mobile-visible prediction indicator */}
          {isRowLocked ? (
            <span
              className="mobile-vip-indicator"
              title="VIP Prediction Locked"
              onClick={(e) => {
                e.stopPropagation();
                onUnlockClick?.();
              }}
            >
              <Lock size={10} />
              <span>{t('matchRow.vipBadge', 'VIP')}</span>
            </span>
          ) : winProb ? (
            <span className="mobile-winprob-indicator" title={`AI Model Win Probability: ${winProb}%`}>
              {winProb}%
            </span>
          ) : null}

          <div className="row-open-cta" title="Open Full Match Intelligence">
            <ChevronRight size={18} className="chevron-open-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
