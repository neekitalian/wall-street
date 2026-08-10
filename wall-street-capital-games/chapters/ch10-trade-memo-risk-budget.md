# Chapter 10: Trade Memo and Risk Budget

**Primary sources:** *The Big Short*; *More Money Than God*; *When Genius Failed*

## Core Idea

A trade is a bundle of thesis, instrument, financing, timing, counterparty, and exit assumptions. Writing them before entry exposes hidden dependencies and makes later updating more honest.

## Frameworks Introduced

- **One-page trade memo**
  - When to use: Before approving a meaningful position.
  - How: State thesis, market-implied view, instrument, catalyst, horizon, carry, liquidity, financing, counterparty, sizing, invalidation, and exit.
- **Risk-budget allocation**
  - When to use: Compare positions with different volatility and tail behavior.
  - How: Allocate loss capacity across normal volatility, gap loss, liquidity, basis, and correlation rather than using notional alone.
- **Pre-mortem**
  - When to use: Confidence is high or consensus on the team is strong.
  - How: Assume the trade caused a major loss and list plausible paths, signals, and mitigations.

## Key Concepts

- **Invalidation:** Evidence that breaks the causal thesis, distinct from adverse price movement alone.
- **Carry:** Expected cost or income from holding a position over time.
- **Gap risk:** Price movement that occurs without an opportunity to exit near prior levels.
- **Liquidity horizon:** Time required to reduce a position without unacceptable impact.
- **Concentration:** Exposure to one issuer, thesis, factor, counterparty, or funding source.

## Mental Models

- Use notional to understand contracts, but use loss scenarios to allocate risk.
- A stop-loss manages price path; it does not replace thesis invalidation.
- Write the counter-case strongly enough that a skeptical decision-maker would accept it.

## Anti-patterns

- **Thesis drift:** Replacing the original reason after it fails.
- **Liquidity assumed from normal markets:** Exit capacity can vanish exactly when needed.
- **Independent-position fiction:** Different trades can share one macro or funding factor.

## Worked Example

Write a mortgage-credit short memo: market implies low defaults; thesis expects underwriting deterioration and reset-driven losses; instrument is CDS; catalyst is delinquency seasoning; cost is annual premium; key risks are continued refinancing, contract basis, and dealer exposure. Predefine evidence that disproves borrower stress and the maximum premium budget before entry.

## Key Takeaways

1. Make every dependency inspectable before entry.
2. Size from stressed loss and liquidity, not expected return.
3. Distinguish price pain from thesis failure.
4. Aggregate exposures by common driver.
5. Record changes so successful outcomes do not erase weak process.

## Connects To

- **Ch 9:** Converts a contrarian insight into an investable structure.
- **Ch 15:** Supplies the integrated case-study artifact.
