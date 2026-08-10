# Chapter 8: LTCM, Leverage, and Liquidity Spirals

**Primary sources:** *When Genius Failed* by Roger Lowenstein; LTCM case deck

## Core Idea

Small relative-value discrepancies can produce attractive returns only with large positions. That makes funding, collateral, crowding, and liquidation capacity part of the trade—not operational details outside the model.

## Frameworks Introduced

- **Convergence-trade anatomy**
  - When to use: Two related instruments appear mispriced.
  - How: Identify economic relationship, long and short legs, expected convergence, carry, hedge error, catalyst, financing, and exit liquidity.
- **Leverage-loss translation**
  - When to use: Evaluate apparently low-volatility portfolios.
  - How: Translate a percentage asset loss into equity loss after leverage; add margin and haircut changes.
- **Liquidity spiral**
  - When to use: Prices fall while funding tightens.
  - How: Price loss -> collateral call -> forced sale -> market impact -> correlation increase -> further price loss.

## Key Concepts

- **On-the-run/off-the-run:** Newer liquid government bond versus an older related issue.
- **Haircut:** Collateral value discount that determines required equity funding.
- **Value at Risk:** Model-based loss estimate over a horizon and confidence level.
- **Basis risk:** Risk that a hedge and exposure stop moving together.
- **Crowded trade:** Similar positions held by investors likely to react together.

## Mental Models

- Model the path to convergence, not only the terminal relationship.
- Assume correlations rise when common funding constraints bind.
- Liquidity is the ability to transact size under stress, not normal-day volume.

## Anti-patterns

- **Historical-volatility leverage:** Quiet data can justify the most leverage just before a regime break.
- **Diversification by labels:** Trades across countries may share the same liquidity and funding factor.
- **Counterparties in isolation:** Each lender may underestimate aggregate positions and correlated collateral calls.

## Worked Example

Go long an older Treasury and short a newer, more liquid Treasury expecting their yields to converge. The price gap is tiny, so leverage is used. A flight to liquidity makes the newer bond richer and the older one cheaper. The economic relationship may still hold at maturity, but widening haircuts and margin calls can force liquidation first. The correct terminal thesis cannot save an insolvent path.

## Key Takeaways

1. Treat leverage, collateral, and exit depth as primary trade variables.
2. Stress correlation and haircut changes together.
3. Compare liquidation horizon with funding horizon.
4. Low observed volatility does not imply low tail loss.
5. Systemic importance can emerge from counterparty networks, not fund size alone.

## Connects To

- **Ch 2:** Relative-value bond logic supplies the trade foundation.
- **Ch 11:** Quantitative models require explicit regime and implementation controls.
