# Capital Machine

An interactive, bilingual strategy game about how institutional wealth compounds through ownership, cash flow, leverage, liquidity and control.

The interface uses an original retro trading-game style inspired by early PC financial simulators: pixel typography, CRT color, broker dialogue and a deal console.

Open `index.html` in a browser to play. No build step or dependencies are required.

The built-in event deck works offline. With the optional Replicate backend, Ralph's deal-desk dialogue is generated from the completed turn while every financial calculation remains deterministic.

## The simulation

You choose an origin, starting capital and liquidity reserve, then make twenty quarterly decisions beginning in 2027. Each deal also lets you change the capital at risk and debt multiplier. Opportunities draw on the repository's Wall Street knowledge base:

- leveraged buyouts and control rights;
- distressed debt and claim priority;
- mispricing, catalysts and funding survival;
- quantitative convergence trades and liquidity spirals;
- private-company access, valuation and governance.

The objective is not simply to maximize terminal net worth. A successful capital machine must preserve liquidity, reputation and control while keeping fragility manageable.

## Run locally

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## AI deal desk with Replicate

The API token is server-side only. Copy `.env.example` to `.env.local`, add the token locally, and never commit that file. Run the full application with:

```bash
npx vercel dev
```

For a deployment, configure `REPLICATE_API_TOKEN` in Vercel Project Settings → Environment Variables. `REPLICATE_MODEL` is optional. If the API is unconfigured or unavailable, the game automatically uses its offline event deck.

Replicate narration never changes returns, cash, debt or control and must not be interpreted as an investment prediction.

## Multiplayer capital table

The online mode uses anonymous six-character rooms with five unique roles: Founder, PE Fund, Bank, Hedge Fund and Creditor. Every action is authenticated and validated by a Vercel Function. Shared financial state is resolved in a Postgres transaction; clients never submit balance-sheet values.

To enable multiplayer:

1. Add Supabase from the Vercel Marketplace.
2. Run [`supabase/migrations/001_multiplayer.sql`](supabase/migrations/001_multiplayer.sql) in the Supabase SQL editor.
3. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server-side Vercel environment variables.
4. Redeploy.

The service-role key must never be exposed in frontend JavaScript or committed to Git. Room sessions are random bearer tokens stored on each player's device; only SHA-256 hashes are stored in Postgres.

The first multiplayer release synchronizes every two seconds and resumes automatically after a temporary disconnect. The database remains authoritative, so reconnecting clients reload the canonical room state.

## Knowledge base

The supporting agent skill lives in [`wall-street-capital-games/`](wall-street-capital-games/).

This project is educational and is not investment, legal or tax advice.
