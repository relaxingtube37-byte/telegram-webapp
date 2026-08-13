import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { PredictionCard } from './components/PredictionCard';
import { ReferralModal } from './components/ReferralModal';
import type { Prediction, StatsOverviewData, ReferralSite } from './types';
import { Trophy, RefreshCw, Flame, History, Key } from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/webapp';

export function App() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<StatsOverviewData | null>(null);
  const [referralSites, setReferralSites] = useState<ReferralSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [telegramUser, setTelegramUser] = useState<{ id?: number; first_name?: string; username?: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp SDK if running inside Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        setTelegramUser(u);
        if (u.id) {
          fetch(`${API_BASE}/user/${u.id}`)
            .then(r => r.json())
            .then(res => { if (res?.verified) setIsVerified(true); })
            .catch(() => {});
        }
      }
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [predRes, statsRes, refRes] = await Promise.all([
        fetch(`${API_BASE}/predictions`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/referrals`).then(r => r.json()).catch(() => []),
      ]);

      setPredictions(Array.isArray(predRes) ? predRes : []);
      setStats(statsRes);
      setReferralSites(Array.isArray(refRes) ? refRes : []);
    } catch (e) {
      console.warn("Failed to load WebApp predictions data", e);
    } finally {
      setLoading(false);
    }
  };

  const activePredictions = predictions.filter(p => p.status === 'UPCOMING' || p.status === 'LIVE');
  const historyPredictions = predictions.filter(p => p.status === 'WON' || p.status === 'LOST' || p.status === 'VOID');

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0.8rem 1rem 3rem 1rem' }}>
      <Header stats={stats} telegramUser={telegramUser} />

      {/* Navigation Tabs & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '0.6rem' }}>
        <div className="nav-tabs" style={{ flex: 1 }}>
          <button
            className={`nav-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            🔥 Active ({activePredictions.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 History ({historyPredictions.length})
          </button>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid var(--border)', color: 'white', padding: '0.6rem', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Refresh Data"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>

        <button
          onClick={() => setShowReferralModal(true)}
          style={{ background: isVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)', border: `1px solid ${isVerified ? '#22c55e' : '#fbbf24'}`, color: isVerified ? '#22c55e' : '#fbbf24', padding: '0.6rem 0.8rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Key size={14} /> {isVerified ? 'VIP ✓' : 'UNLOCK'}
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <Trophy size={40} style={{ opacity: 0.3, marginBottom: '1rem', animation: 'bounce 1s infinite' }} />
          <div>Fetching AI Predictions...</div>
        </div>
      ) : activeTab === 'active' ? (
        activePredictions.length > 0 ? (
          activePredictions.map((p, idx) => (
            <PredictionCard
              key={p.id}
              prediction={p}
              isLocked={!isVerified && idx > 0}
              onUnlockClick={() => setShowReferralModal(true)}
            />
          ))
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Flame size={40} style={{ opacity: 0.2, marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '0.4rem' }}>No Active Predictions Right Now</h3>
            <p style={{ fontSize: '0.8rem' }}>Check back soon! New AI value bets are published daily.</p>
          </div>
        )
      ) : (
        historyPredictions.length > 0 ? (
          historyPredictions.map(p => <PredictionCard key={p.id} prediction={p} />)
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <History size={40} style={{ opacity: 0.2, marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '0.4rem' }}>No Settled History Yet</h3>
            <p style={{ fontSize: '0.8rem' }}>Past results will appear here as matches complete.</p>
          </div>
        )
      )}

      {/* Referral Partner Registration Modal */}
      {showReferralModal && (
        <ReferralModal
          sites={referralSites}
          telegramId={telegramUser?.id}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
}

// Inline global declaration for Telegram WebApp SDK
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}
