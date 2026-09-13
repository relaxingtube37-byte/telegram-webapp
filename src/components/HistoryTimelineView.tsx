import React, { useState, useMemo } from 'react';
import type { ContentLayerFlags, Prediction, ReferralSite } from '../types';
import { CompactMatchRow } from './CompactMatchRow';
import {
  Calendar, ChevronDown, ChevronUp, Trophy, CheckCircle2,
  Sparkles, TrendingUp, Flame, Percent
} from 'lucide-react';

export interface HistoryTimelineViewProps {
  predictions: Prediction[];
  selectedTimezone: string;
  canSeeDeepAnalysis: boolean;
  onOpenMatchPage?: (prediction: Prediction) => void;
  onUnlockClick?: () => void;
  apiBase?: string;
  referralSites?: ReferralSite[];
  trackingId?: string | number;
  contentLayers?: ContentLayerFlags;
  canWatchLive?: boolean;
}

interface DayGroup {
  dateKey: string;
  fullDateTitle: string;
  relativeLabel: string;
  monthYear: string;
  items: Prediction[];
  total: number;
  won: number;
  lost: number;
  voidCount: number;
  winRate: number;
  isSweep: boolean;
}

export const HistoryTimelineView: React.FC<HistoryTimelineViewProps> = ({
  predictions,
  selectedTimezone,
  canSeeDeepAnalysis,
  onOpenMatchPage,
  onUnlockClick,
  apiBase,
  referralSites,
  trackingId,
  contentLayers,
  canWatchLive,
}) => {
  // Selected Month filter: 'all' or specific Month Year (e.g. 'September 2026')
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Helper to extract YYYY-MM-DD in selected timezone
  const getDateKey = (dateStr?: string): string => {
    if (!dateStr) return 'unknown';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.slice(0, 10);
      const tz = selectedTimezone === 'local' ? undefined : (selectedTimezone || 'UTC');
      return d.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  // Group history predictions by day
  const { dayGroups, monthsList, globalStats } = useMemo(() => {
    const groupsMap: Record<string, Prediction[]> = {};
    const tz = selectedTimezone === 'local' ? undefined : (selectedTimezone || 'UTC');
    const now = new Date();
    const todayKey = now.toLocaleDateString('en-CA', { timeZone: tz });
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKey = yesterday.toLocaleDateString('en-CA', { timeZone: tz });

    let globalWon = 0;
    let globalLost = 0;
    let globalVoid = 0;
    let totalOddsSum = 0;
    let oddsCount = 0;

    // Filter to only settled predictions (WON, LOST, VOID)
    const settledList = predictions.filter(
      p => p.status === 'WON' || p.status === 'LOST' || p.status === 'VOID'
    );

    settledList.forEach(p => {
      const rawDate = p.match_date || p.published_at;
      const key = getDateKey(rawDate);
      if (!groupsMap[key]) {
        groupsMap[key] = [];
      }
      groupsMap[key].push(p);

      if (p.status === 'WON') globalWon++;
      else if (p.status === 'LOST') globalLost++;
      else if (p.status === 'VOID') globalVoid++;

      const oddsNum = Number(p.predicted_winner === p.home_name ? p.home_odds : p.away_odds);
      if (!isNaN(oddsNum) && oddsNum > 1) {
        totalOddsSum += oddsNum;
        oddsCount++;
      }
    });

    // Sort date keys descending (newest date first)
    const sortedDateKeys = Object.keys(groupsMap).sort((a, b) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return b.localeCompare(a);
    });

    const monthsSet = new Set<string>();
    const groups: DayGroup[] = [];

    sortedDateKeys.forEach(key => {
      const items = groupsMap[key];
      // Sort items within day chronologically descending
      items.sort((a, b) => {
        const tA = new Date(a.match_date || a.published_at).getTime() || 0;
        const tB = new Date(b.match_date || b.published_at).getTime() || 0;
        return tB - tA;
      });

      let won = 0;
      let lost = 0;
      let voidCount = 0;

      items.forEach(p => {
        if (p.status === 'WON') won++;
        else if (p.status === 'LOST') lost++;
        else if (p.status === 'VOID') voidCount++;
      });

      const decisive = won + lost;
      const winRate = decisive > 0 ? Math.round((won / decisive) * 100) : 0;
      const isSweep = won >= 2 && lost === 0;

      // Format clean readable date title
      let fullDateTitle = key;
      let monthYear = '';
      let relativeLabel = '';

      if (key === todayKey) relativeLabel = 'Today';
      else if (key === yesterdayKey) relativeLabel = 'Yesterday';

      if (key !== 'unknown') {
        try {
          const [yr, mo, dy] = key.split('-').map(Number);
          const dObj = new Date(Date.UTC(yr, mo - 1, dy, 12, 0, 0));
          fullDateTitle = dObj.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          });
          monthYear = dObj.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          });
          monthsSet.add(monthYear);
        } catch {
          fullDateTitle = key;
        }
      }

      groups.push({
        dateKey: key,
        fullDateTitle,
        relativeLabel,
        monthYear,
        items,
        total: items.length,
        won,
        lost,
        voidCount,
        winRate,
        isSweep,
      });
    });

    const decisiveGlobal = globalWon + globalLost;
    const globalWinRate = decisiveGlobal > 0 ? Math.round((globalWon / decisiveGlobal) * 100) : 0;
    const avgOdds = oddsCount > 0 ? (totalOddsSum / oddsCount).toFixed(2) : '1.78';

    return {
      dayGroups: groups,
      monthsList: Array.from(monthsSet),
      globalStats: {
        total: settledList.length,
        won: globalWon,
        lost: globalLost,
        voidCount: globalVoid,
        winRate: globalWinRate,
        avgOdds,
      },
    };
  }, [predictions, selectedTimezone]);

  // Initial state: expand the first day, collapse the rest
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    dayGroups.forEach((g, idx) => {
      // First day is open (false = not collapsed), others collapsed
      initial[g.dateKey] = idx > 0;
    });
    return initial;
  });

  const toggleDay = (dateKey: string) => {
    setCollapsedMap(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    dayGroups.forEach(g => { allOpen[g.dateKey] = false; });
    setCollapsedMap(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    dayGroups.forEach(g => { allClosed[g.dateKey] = true; });
    setCollapsedMap(allClosed);
  };

  // Filter groups by month if selected
  const filteredGroups = useMemo(() => {
    if (selectedMonth === 'all') return dayGroups;
    return dayGroups.filter(g => g.monthYear === selectedMonth);
  }, [dayGroups, selectedMonth]);

  return (
    <div className="history-timeline-container">
      {/* ── 1. Global Performance KPI Hero Banner ── */}
      <div className="history-kpi-banner">
        <div className="kpi-banner-top">
          <div className="kpi-banner-title">
            <TrendingUp size={16} className="kpi-banner-icon" />
            <span>Historical Accuracy & Performance</span>
          </div>
          <span className="kpi-settled-count">
            {globalStats.total} Settled Predictions
          </span>
        </div>

        <div className="kpi-metrics-grid">
          {/* Win Rate */}
          <div className="kpi-metric-card kpi-winrate">
            <span className="kpi-metric-val">
              {globalStats.winRate}%
            </span>
            <span className="kpi-metric-lbl">
              <Percent size={11} /> Win Rate
            </span>
          </div>

          {/* Record (W - L) */}
          <div className="kpi-metric-card">
            <div className="kpi-record-row">
              <span className="record-won">{globalStats.won}W</span>
              <span className="record-dash">-</span>
              <span className="record-lost">{globalStats.lost}L</span>
              {globalStats.voidCount > 0 && (
                <span className="record-void">({globalStats.voidCount}V)</span>
              )}
            </div>
            <span className="kpi-metric-lbl">
              <CheckCircle2 size={11} /> Win-Loss Record
            </span>
          </div>

          {/* Average Odds */}
          <div className="kpi-metric-card hide-on-tiny-mobile">
            <span className="kpi-metric-val kpi-odds-val">
              @{globalStats.avgOdds}
            </span>
            <span className="kpi-metric-lbl">
              <Sparkles size={11} /> Avg Pick Odds
            </span>
          </div>

          {/* Profitable Hits Tag */}
          <div className="kpi-metric-card">
            <span className="kpi-metric-val kpi-streak-val">
              🔥 {globalStats.won} Hits
            </span>
            <span className="kpi-metric-lbl">
              <Trophy size={11} /> Verified Results
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Month Selector & Accordion Actions ── */}
      <div className="history-toolbar">
        {/* Month Pills */}
        <div className="history-month-pills">
          <button
            type="button"
            className={`month-pill ${selectedMonth === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedMonth('all')}
          >
            All Dates ({dayGroups.length} Days)
          </button>
          {monthsList.map(m => (
            <button
              key={m}
              type="button"
              className={`month-pill ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Expand / Collapse All Buttons */}
        <div className="history-expand-controls">
          <button type="button" className="btn-history-toggle" onClick={expandAll}>
            Expand All
          </button>
          <button type="button" className="btn-history-toggle" onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>

      {/* ── 3. Daily Timeline Accordion Stream ── */}
      {filteredGroups.length > 0 ? (
        <div className="history-days-list">
          {filteredGroups.map(day => {
            const isCollapsed = collapsedMap[day.dateKey] ?? false;

            return (
              <div
                key={day.dateKey}
                className={`history-day-card ${day.isSweep ? 'day-is-sweep' : ''}`}
              >
                {/* Day Header Accordion Toggle */}
                <div
                  className="history-day-header"
                  onClick={() => toggleDay(day.dateKey)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={!isCollapsed}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDay(day.dateKey);
                    }
                  }}
                >
                  {/* Left: Date & Relative Tag */}
                  <div className="history-day-left">
                    <div className="history-day-icon-wrap">
                      <Calendar size={14} className="history-cal-icon" />
                    </div>
                    <div className="history-date-titles">
                      <div className="history-date-main">
                        <span className="history-date-text">{day.fullDateTitle}</span>
                        {day.relativeLabel && (
                          <span className="history-relative-tag">{day.relativeLabel}</span>
                        )}
                      </div>
                      <span className="history-match-count-sub">
                        {day.total} {day.total === 1 ? 'Match' : 'Matches'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Aggregated Day Stats & Chevron */}
                  <div className="history-day-right">
                    {/* Sweep Badge */}
                    {day.isSweep && (
                      <span className="history-sweep-badge" title="100% Win Rate Clean Sweep">
                        <Flame size={12} /> 100% Sweep
                      </span>
                    )}

                    {/* Day Score Chip (e.g. 6W - 2L) */}
                    <div className="history-day-chips">
                      <span className="day-chip-won">
                        {day.won}W
                      </span>
                      {day.lost > 0 && (
                        <span className="day-chip-lost">
                          {day.lost}L
                        </span>
                      )}
                      {day.voidCount > 0 && (
                        <span className="day-chip-void">
                          {day.voidCount}V
                        </span>
                      )}
                    </div>

                    {/* Day Win Rate Pill */}
                    <div
                      className={`history-winrate-pill ${
                        day.winRate >= 70 ? 'pill-high' : day.winRate >= 50 ? 'pill-mid' : 'pill-low'
                      }`}
                    >
                      {day.winRate}%
                    </div>

                    {/* Chevron Arrow */}
                    <div className="history-day-chevron">
                      {isCollapsed ? (
                        <ChevronDown size={17} color="var(--text-secondary)" />
                      ) : (
                        <ChevronUp size={17} color="#38bdf8" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Day Matches List (Shown when expanded) */}
                {!isCollapsed && (
                  <div className="history-day-matches">
                    {day.items.map(p => (
                      <CompactMatchRow
                        key={p.id}
                        prediction={p}
                        selectedTimezone={selectedTimezone}
                        isLocked={!canSeeDeepAnalysis}
                        isSelected={false}
                        onUnlockClick={onUnlockClick}
                        onOpenMatchPage={onOpenMatchPage}
                        apiBase={apiBase}
                        referralSites={referralSites}
                        trackingId={trackingId}
                        contentLayers={contentLayers}
                        canWatchLive={canWatchLive}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass empty-state-box">
          <Calendar size={42} className="empty-icon" />
          <h3 className="empty-title">No Settled Matches for this Date</h3>
          <p className="empty-desc">
            Try switching to another month or clearing filters to view historical match results.
          </p>
        </div>
      )}
    </div>
  );
};
