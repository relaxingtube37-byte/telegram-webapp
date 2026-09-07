/**
 * Vercel Serverless Function: Edge/Node SEO Prerender for Match Pages.
 * Injects route-specific <title>, <meta description>, Open Graph, Twitter Cards,
 * Schema.org JSON-LD, and semantic pre-rendered HTML for crawlers and social preview bots.
 */

const BACKEND_BASE = process.env.VITE_API_BASE 
  ? process.env.VITE_API_BASE.replace(/\/+$/, '') 
  : 'https://telegram-backend-2yck.onrender.com/api/webapp';

export default async function handler(req, res) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'ptin-ai.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    // 1. Resolve match parameter from query or path
    let matchParam = req.query?.match || req.query?.slug;
    if (!matchParam && req.url) {
      const url = new URL(req.url, baseUrl);
      matchParam = url.searchParams.get('match') || url.pathname.match(/^\/match\/([^/?#]+)/i)?.[1];
    }

    if (!matchParam) {
      return res.redirect(302, '/');
    }

    // 2. Fetch active match predictions from backend
    const apiRes = await fetch(`${BACKEND_BASE}/predictions`, { headers: { 'Accept': 'application/json' } });
    if (!apiRes.ok) {
      return res.redirect(302, '/');
    }

    const predictions = await apiRes.json();
    if (!Array.isArray(predictions)) {
      return res.redirect(302, '/');
    }

    // 3. Find matching prediction
    const pStr = String(matchParam).toLowerCase().trim();
    let match = predictions.find(p => String(p.fixture_id) === pStr || String(p.id) === pStr);

    if (!match) {
      const trailing = pStr.match(/-(\d+)$/);
      if (trailing) {
        match = predictions.find(p => String(p.fixture_id) === trailing[1] || String(p.id) === trailing[1]);
      }
    }

    if (!match) {
      match = predictions.find(p => {
        const slug = `${p.home_name}-vs-${p.away_name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return pStr.includes(slug) || slug.includes(pStr);
      });
    }

    if (!match) {
      return res.status(404).send(`<!DOCTYPE html><html><head><title>Match Not Found | Ptin AI</title></head><body><h1>Match Not Found</h1><p><a href="/">Return to Matches</a></p></body></html>`);
    }

    // 4. Construct metadata
    const home = match.home_name || 'Player 1';
    const away = match.away_name || 'Player 2';
    const matchTitle = `${home} vs ${away}`;
    const tournament = match.tournament_name || 'ATP/WTA Tour';
    const surface = match.surface || 'Hard';
    const round = match.round_name || '';
    const winProb = match.win_probability || 60;
    const predictedWinner = match.predicted_winner || home;

    const homeSlug = home.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const awaySlug = away.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const idPart = match.fixture_id || match.id;
    const resolvedSlug = `${homeSlug}-vs-${awaySlug}-${idPart}`;

    const title = `${matchTitle} Prediction, Odds & AI Tactical Preview | Ptin AI`;
    const description = match.ai_summary
      ? match.ai_summary.slice(0, 160).replace(/[\n\r]+/g, ' ').trim()
      : `Complete tactical match analysis for ${matchTitle} at ${tournament}. Surface: ${surface}. AI Predicted Winner: ${predictedWinner} (${winProb}%). Full preview on Ptin AI.`;

    const canonicalUrl = `${baseUrl}/match/${resolvedSlug}`;
    const ogImageUrl = `${baseUrl}/og-tennis-banner.jpg`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SportsEvent',
          'name': matchTitle,
          'sport': 'Tennis',
          'startDate': match.match_date || new Date().toISOString(),
          'location': {
            '@type': 'Place',
            'name': tournament,
          },
          'competitor': [
            { '@type': 'Person', 'name': home },
            { '@type': 'Person', 'name': away },
          ],
        },
        {
          '@type': 'NewsArticle',
          'headline': `${matchTitle} Tactical Match Analysis & AI Win Probability`,
          'description': description,
          'datePublished': match.published_at || new Date().toISOString(),
          'mainEntityOfPage': canonicalUrl,
          'publisher': {
            '@type': 'Organization',
            'name': 'Ptin AI',
            'url': baseUrl,
          },
          'author': {
            '@type': 'Organization',
            'name': 'Ptin AI Tennis Analytics Team',
          },
        },
      ],
    };

    // 5. Generate raw HTML with semantic pre-rendered container and client hydration script
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph Tags -->
    <meta property="og:site_name" content="Ptin AI" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ptin_ai" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <!-- Schema.org JSON-LD Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg-dark: #0a0f1d;
        --card-bg: #121a2c;
        --accent-cyan: #38bdf8;
        --accent-green: #22c55e;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: var(--bg-dark);
        color: var(--text-primary);
        font-family: 'Outfit', sans-serif;
      }
      .prerender-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1.5rem;
        background: var(--card-bg);
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 16px;
      }
      .prerender-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--accent-cyan);
        background: rgba(56, 189, 248, 0.1);
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        margin-bottom: 0.8rem;
      }
      .prerender-title {
        font-size: 1.6rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
      }
      .prerender-meta {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 1.2rem;
      }
      .prerender-meter {
        background: rgba(15, 23, 42, 0.8);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1.2rem;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .prerender-meter-text {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--accent-green);
      }
      .prerender-summary {
        font-size: 0.9rem;
        line-height: 1.6;
        color: #cbd5e1;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <main class="prerender-container">
        <div class="prerender-badge">${escapeHtml(tournament)} • ${escapeHtml(surface)} ${round ? '• ' + escapeHtml(round) : ''}</div>
        <h1 class="prerender-title">${escapeHtml(home)} vs ${escapeHtml(away)}</h1>
        <div class="prerender-meta">🎾 Professional Tennis Match Analysis & Tactical Dossier</div>
        
        <div class="prerender-meter">
          <div class="prerender-meter-text">AI Predicted Winner: ${escapeHtml(predictedWinner)} (${winProb}% Confidence)</div>
        </div>

        <article class="prerender-summary">
          <h2>Tactical Dossier & Preview</h2>
          <p>${escapeHtml(match.ai_summary || 'Tactical match breakdown and predictive modeling available on Ptin AI.')}</p>
        </article>
      </main>
    </div>

    <!-- Client Hydration State -->
    <script>
      window.__INITIAL_PREDICTION__ = ${JSON.stringify(match)};
      window.__INITIAL_MATCH__ = ${JSON.stringify(match)};
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (err) {
    return res.redirect(302, '/');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
