# DeSNet TON

A decentralized social network protocol on TON blockchain. Every profile is an NFT, every profile spawns its own token, and every social action — posts, likes, replies, quotes, presses, syncs — is an on-chain primitive.

**Status:** v0.1.0 development. FunC smart contracts + Walrus frontend/backend.

**License:** [The Unlicense](LICENSE) — public domain.

---

## What it is

A profile (PID) on DeSNet TON is a transferable NFT with a deterministic address derived from its owner wallet. Registering a handle (`alice`, `bob`, `desnet`, …) atomically:

1. Mints the PID NFT to the registrant
2. Spawns a per-profile fungible token `$ALICE` (1B supply, 9 decimals)
3. Creates a TON/`$ALICE` AMM pool seeded with 5 TON + 50M tokens (FDV ≈ 100 TON)
4. Locks the creator's LP position permanently into the staking pool
5. Splits the handle fee 10% to the deployer / 90% into TON → DESNET buyback-burn

Handle pricing scales by length: 1-char = 10 TON, 6+ chars = 0.1 TON. One-time, immutable, no renewal.

The PID itself is the unit of identity, the token is the unit of speech-economy, and the AMM pool is the price discovery surface — all bound together at registration in a single transaction.

## The seven verbs

Every social action on DeSNet TON is one of seven on-chain primitives:

| Verb   | Contract | Meaning                              |
|--------|----------|--------------------------------------|
| Mint   | `mint`   | Original post (text + media)         |
| Spark  | `pulse`  | Like / positive reaction             |
| Voice  | `mint`   | Reply (parent set)                   |
| Echo   | `pulse`  | Repost / amplify                     |
| Remix  | `mint`   | Quote-post (quote set)               |
| Press  | `press`  | Mint an NFT as a collectible         |
| Sync   | `link`   | Subscribe to a PID's mints           |

Posts can carry tags (ownerless folksonomy), tickers (factory-spawned `$X` only), mentions (any TON address), and tips (any Jetton token).

## Architecture

```
                    governance (DAO + multisig)
                              │
        ┌──────────┬──────────┬──────────┬────────────┬─────────────┐
        │          │          │          │            │             │
    profile     factory      dex    lp_staking   ton_vault   handle_fee
    (PID NFT)  (atomic    (TON/$T  (LP NFT      (50/50      _vault
               spawn)    9bps)    positions    buyback-    (10/90
                                 + emission)   burn)       deployer/
                                                           buyback-
                                                           burn)
        │
        ├── reference_gate (balance + LP-stake gating)
        ├── link / pulse / mint / press   (verb contracts)
        ├── history       (per-PID post log)
        ├── assets        (on-chain media)
        ├── giveaway      (token/NFT giveaways)
        └── lp_emission / reaction_emission (sealed reserves)
```

## Smart Contracts (FunC)

```
contracts/
  stdlib.fc              Common utilities, safe math, error codes
  profile.fc             PID NFT + handle registry + signer hierarchy
  factory.fc             Atomic register_handle pipeline
  dex.fc                 TON/$TOKEN constant-product pool, 9 bps to LP
  lp_staking.fc          LP positions + emission + fee claims
  lp_emission.fc         Sealed 900M reserve drained by claims
  reaction_emission.fc   Sealed 50M reserve drained by Press actors
  ton_vault.fc           Per-token vault + embedded burns
  handle_fee_vault.fc    10/90 split + two-phase MEV-safe settle
  voter_history.fc       Per-token voting power
  reference_gate.fc      Balance + LP-stake gating primitive
  mint.fc                Mint / Voice / Remix verbs
  pulse.fc               Spark / Echo verbs
  press.fc               Press collectible NFT
  link.fc                Sync verb + PidSyncSet state
  history.fc             Per-PID post log
  assets.fc              On-chain media storage
  giveaway.fc            Token / NFT giveaway primitive
```

## Frontend & Backend (Walrus)

Both frontend and backend use **Walrus** for decentralized data storage and retrieval:

### Frontend (Walrus + React)
- `frontend/src/` — React components + TypeScript
- Walrus SDK for IPFS-like storage
- TON wallet integration (TonConnect)
- Real-time post feed, profile views, composer

### Backend (Walrus + Express)
- `backend/src/` — Express API server + TypeScript
- Walrus for indexing & off-chain data
- REST API for posts, profiles, tokens, governance
- Database: Walrus + optional Redis cache

## Design philosophy

- **One PID, one token, one pool, one tx.** Identity, currency, and market are inseparable.
- **No protocol fees on swaps.** DEX fee 9 bps, 100% to LP. Protocol revenue only from handle registration.
- **No centralized backend for core flows.** Posts, media, history — on-chain. Frontend is a renderer.
- **Tickers are scarce by design.** Every `$X` ticker resolves to a PID. No anonymous launchpads.
- **Tags are ownerless.** Folksonomy permanently — no namespace landgrab.
- **Forever-lock the creator LP.** No rug surface. Creator earns from emissions and fees, not extraction.
- **MEV-safe settle.** Commit-reveal with delay and slippage cap.

## Building

### Smart Contracts (FunC)
```bash
cd contracts
func -o contracts.fif *.fc
# Deploy with ton-cli or TypeScript via ton.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Versions

- **v0.1.0** — current development. FunC contracts scaffolding, Walrus integration.
- Planned: testnet deployment, audit, mainnet launch

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

[The Unlicense](LICENSE) — public domain.
