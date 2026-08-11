# Capital Machine

**A retro strategy game about how capital becomes power.**

Capital Machine puts the player inside the decisions that shape institutional wealth: buying control, borrowing against cash flow, protecting liquidity, negotiating with creditors and surviving long enough for a thesis to work.

This is not a stock-picking simulator. It is a game about ownership, incentives and the capital structure.

## The idea

Wealth does not grow from returns alone. It grows through a system:

> **Ownership × Cash Flow × Time**

Leverage can accelerate that system, but it also increases fragility. Liquidity buys time. Control determines who can act. Reputation and relationships affect which deals become available. Debt decides who has power when the optimistic case fails.

The game is built around five principles:

1. **Control is different from ownership.** A smaller economic stake can still carry decisive voting, board or covenant rights.
2. **Liquidity is strategic.** Cash is not idle when it preserves optionality and prevents forced selling.
3. **Leverage magnifies both directions.** It can concentrate gains, but it transfers power to lenders when cash flow weakens.
4. **Every asset is someone else's liability or claim.** The same company looks different to its founder, owner, bank and creditors.
5. **Survival precedes compounding.** A strong thesis has no value if its financing cannot survive the path to realization.

## How the game works

### Solo mandate

Start with a fixed **$1M mandate** and choose a capital origin. Over twenty quarterly turns, evaluate opportunities involving:

- leveraged buyouts and operating control;
- distressed debt and claim priority;
- market mispricing, catalysts and funding risk;
- quantitative convergence and liquidity spirals;
- private-company valuation, access and governance.

Each decision changes more than net worth. The player must manage cash, debt, control, reputation, relationships and fragility. The objective is to build a capital machine that can keep operating—not simply to produce the highest final number.

### Online capital table

Players occupy different sides of the same transaction:

- **Founder** — operates the company and protects strategic control.
- **PE Fund** — acquires, governs and improves the asset.
- **Bank** — sets credit availability, pricing and covenants.
- **Hedge Fund** — trades the structure, catalysts and downside.
- **Creditor** — controls maturity, enforcement and restructuring leverage.

Two modes are available:

| Mode | Starting balance sheet | Seats |
| --- | --- | --- |
| **2 players** | $10M cash · $50M enterprise value · $15M debt | Two human roles and three conservative AI desks |
| **5 players** | $20M cash · $100M enterprise value · $40M debt | Five human-controlled roles |

Starting funds are determined by the mode and cannot be edited by players. Rooms use anonymous six-character codes, timed turns, server-side validation and reconnectable sessions.

## Rules before narration

All financial outcomes are deterministic and resolved by the game engine. Clients submit decisions, never balance-sheet values.

Replicate can generate Ralph's deal-desk commentary after a turn, but AI narration cannot change cash, debt, returns or control. Generated scenarios are fictional educational material—not market forecasts or investment recommendations.

## Visual direction

Capital Machine uses an original late-1980s PC finance-game aesthetic: VGA pixel art, CRT colors, character portraits, Manhattan deal rooms and broker dialogue. The interface treats financial structure as a game board rather than a spreadsheet tutorial.

## Play locally

The offline solo game requires no build step:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

To run the Vercel Functions locally:

```bash
npx vercel dev
```

## Enable online features

### Multiplayer

1. Connect a Supabase database through the Vercel Marketplace.
2. Run [`001_multiplayer.sql`](supabase/migrations/001_multiplayer.sql) and then [`002_two_player_mode.sql`](supabase/migrations/002_two_player_mode.sql) in the Supabase SQL Editor.
3. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
4. Mark the service-role value as Sensitive and redeploy.

The multiplayer state is authoritative in Postgres and synchronizes every two seconds. Session tokens are stored on the player's device; only SHA-256 hashes are stored in the database.

### AI deal desk

Configure these server-side Vercel environment variables:

```text
REPLICATE_API_TOKEN
REPLICATE_MODEL=qwen/qwen3-235b-a22b-instruct-2507
```

Mark `REPLICATE_API_TOKEN` as Sensitive. Never expose either secret in frontend JavaScript or commit it to Git.

If Replicate is unavailable, the game falls back to its offline event deck.

## Intellectual foundation

The scenarios draw on the histories of Wall Street trading desks, LBOs, hedge funds, quantitative strategies, merger arbitrage and distressed restructurings. The structured supporting knowledge lives in [`wall-street-capital-games/`](wall-street-capital-games/).

Capital Machine is an educational game. It is not investment, legal or tax advice.
