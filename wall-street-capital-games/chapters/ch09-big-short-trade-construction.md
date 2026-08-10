# Chapter 9: Constructing the Big Short

**Primary source:** *The Big Short* by Michael Lewis

## Core Idea

Discovering mispricing is only the first step. A successful contrarian trade requires an instrument that pays when the thesis is right, a counterparty, tolerable carry, sufficient duration, controlled sizing, and an exit or settlement mechanism.

## Frameworks Introduced

- **Thesis-to-instrument chain**
  - When to use: A market view cannot be expressed by simply buying or selling the underlying.
  - How: Define mispricing -> causal thesis -> observable deterioration -> instrument payoff -> counterparty -> carry -> catalyst -> settlement.
- **Reference-entity inspection**
  - When to use: Trade a derivative or structured product.
  - How: Read definitions, referenced collateral, triggers, waterfall, documentation, counterparty terms, and basis between the contract and real-world thesis.
- **Path-survival budget**
  - When to use: A thesis may take years.
  - How: Estimate premium/carry, mark-to-market volatility, collateral, investor patience, and maximum position that survives delay.

## Key Concepts

- **Credit default swap:** Contract exchanging premium for protection against defined credit events or losses.
- **Subprime mortgage:** Mortgage to borrowers with weaker credit characteristics, often sensitive to underwriting and payment resets.
- **CDO:** Vehicle that repackages credit exposures into claims with different priority.
- **Waterfall:** Rules allocating cash and losses across tranches.
- **Counterparty:** Entity obligated to perform on the other side of a contract.

## Mental Models

- Separate "being right" from "getting paid."
- Read the contract as carefully as the asset thesis.
- Ask why the counterparty accepts the opposite side and whether incentives obscure risk.

## Anti-patterns

- **Macro thesis without payoff mapping:** Housing weakness does not guarantee every short instrument profits.
- **Ignoring negative carry:** Premium and financing can exhaust capital before the catalyst.
- **Mark-to-model passivity:** Dealer marks can affect collateral and investor confidence even before cash losses appear.

## Worked Example

An analyst finds deteriorating mortgage pools but cannot efficiently short individual loans. CDS protection on selected mortgage bonds creates a defined premium and contingent payoff. The analyst must verify pool composition, attachment point, credit-event terms, dealer solvency, and annual carry. Position size is capped by the cost of waiting through continued house-price strength.

## Key Takeaways

1. Build a causal and contractual payoff chain.
2. Budget carry and mark-to-market adversity.
3. Analyze the counterparty and documentation.
4. Verify that the chosen reference exposure matches the thesis.
5. A crowded consensus can persist because institutions are paid to maintain it.

## Connects To

- **Ch 5:** Information advantage must remain lawful.
- **Ch 10:** A trade memo makes construction and invalidation explicit.
