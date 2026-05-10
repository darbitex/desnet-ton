# DeSNet TON — Architecture & Design

## Overview

DeSNet TON is a decentralized social network on TON blockchain, adapted from the Aptos version. It combines identity (NFT profiles), tokenomics (per-profile Jettons), and social verbs (on-chain primitives) into a single cohesive protocol.

## Core Concepts

### 1. Profile Identity (PID)

Every profile is a non-fungible token (TEP-62/66 NFT):
- **Minted at:** Handle registration
- **Owner:** The registrant's wallet
- **Transferable:** Yes (profile can be sold)
- **Address:** Deterministic, derived from owner + handle hash
- **Content:** Handle name, bio, profile picture (stored via Walrus)

### 2. Per-Profile Tokens (Jettons)

Each profile spawns a Jetton token (TEP-74):
- **Supply:** 1 billion tokens
- **Decimals:** 9
- **Allocation:**
  - 5% (50M) seeded into AMM pool
  - 5% (50M) in reaction emission reserve
  - 90% (900M) in LP emission reserve
  - Creator: 0% (locked LP position is the stake)

### 3. Automated Market Maker (DEX)

A constant-product AMM (x*y=k) for each profile's token:
- **Pair:** TON / $TOKEN
- **Fee:** 9 basis points (9 bps), 100% to LP
- **Seeding:** 5 TON + 50M $TOKEN
- **Liquidity Pool:** LP positions as NFTs (TEP-62/66)

### 4. Handle Registry

Scarce, ownable names on the protocol:
- **Format:** 1-64 characters, alphanumeric + underscore
- **Pricing:**
  - 1-char: 10 TON
  - 2-char: 5 TON
  - 3-char: 2 TON
  - 4-5 char: 1 TON
  - 6+ char: 0.1 TON
- **Fee Split:** 10% deployer, 90% buyback-burn DESNET
- **Renewal:** One-time, no renewal required

## Smart Contracts

### profile.fc
Manages profile NFT minting and handle registry.

**Key Functions:**
- `register_handle(owner_addr, handle, profile_data)` — Mint PID NFT
- `transfer_handle(new_owner)` — Transfer profile ownership
- `get_handle_by_address(addr)` — Lookup handle
- `get_address_by_handle(handle)` — Reverse lookup

**State:**
- `handle_to_address` — Map of handle → PID address
- `address_to_handle` — Map of PID address → handle
- `profile_data` — On-chain metadata (bio, picture hash)

### factory.fc
Orchestrates atomic handle registration:
- Mints profile NFT
- Deploys Jetton token
- Creates DEX pool
- Initializes LP staking
- Distributes fees

**Key Functions:**
- `register_handle_atomic(owner, handle, profile_meta)` — One-transaction setup

### dex.fc
Constant-product DEX implementation.

**Key Functions:**
- `swap_ton_to_token(amount_in)` — Buy $TOKEN with TON
- `swap_token_to_ton(amount_in)` — Sell $TOKEN for TON
- `add_liquidity(ton_amount, token_amount)` — Deposit LP
- `remove_liquidity(lp_tokens)` — Withdraw LP
- `get_price(token_in, amount_in)` — Price quote

**Fee Structure:**
- 9 bps fee on each swap
- 100% to liquidity providers

### lp_staking.fc
Manages liquidity provider rewards.

**Stake Types:**
- **Locked:** Atomic at registration, never withdrawable, creator's seed LP
- **Free:** Anyone can add/withdraw

**Rewards:**
- Drained from `lp_emission` reserve
- Proportional to LP position size
- Claimable anytime

### mint.fc, pulse.fc, press.fc, link.fc
Implement the seven verbs:
- **Mint:** Create original post
- **Spark:** Like/react to post
- **Voice:** Reply to post
- **Echo:** Repost/amplify
- **Remix:** Quote-post
- **Press:** Mint post as collectible NFT
- **Sync:** Subscribe to profile

### history.fc
Per-profile post history (append-only log).

**Storage:**
- Cells optimized for sequential reads
- Pagination by timestamp

### assets.fc
On-chain media storage via Walrus.

**Supported:**
- Images: PNG, JPEG, WebP, GIF, SVG
- Max size: 5 MB per asset
- Stored as Walrus blob references

## Tokenomics

### DESNET (Protocol Token)
- **Ticker:** desnet (itself a profile)
- **Supply:** 1B tokens (same as any profile)
- **Revenue Stream:** 90% of handle registration fees
- **Mechanism:** Commit-reveal buyback-burn
  1. Handle fee → TON vault
  2. 10% stays in deployer vault
  3. 90% triggers buyback: TON → $DESNET swap
  4. Swapped tokens burned permanently

### Per-Profile Token Economics
- **LP Incentives:** 90% of emission reserve (900M tokens)
- **Reaction Rewards:** 5% of emission reserve (50M tokens)
- **Creator Lock:** Eternal LP position lock (no extraction)
- **Voting:** Holder voting power isolated per-token

## Data Flow

### Registration Flow (Atomic Tx)
```
User → factory.register_handle_atomic(handle, profile_meta)
  ↓
  1. profile.mint_nft(owner, handle)
  2. Deploy Jetton token contract
  3. dex.init_pool(TON, TOKEN, 5 TON + 50M TOKEN)
  4. lp_staking.lock_creator_lp(creator_lp_nft)
  5. handle_fee_vault.deposit(fee, split=10/90)
  ↓
Profile + Token + DEX + LP Staking live in one tx
```

### Post Flow
```
User → mint.create_post(pid, text, media, tags, mentions)
  ↓
  history.append_post(post_id, post_data)
  ↓
Post indexed on frontend via Walrus
```

### Swap Flow
```
User → dex.swap_ton_to_token(amount_in)
  ↓
  Calc: amount_out = (amount_in * 991 * token_reserve) / (ton_reserve * 1000 + amount_in * 991)
  ↓
  1. Transfer TON to DEX
  2. Transfer TOKEN to user
  3. Accrue 9 bps fee to LP reserve
  ↓
Swap complete
```

## Security Considerations

### MEV Protection
- **Slippage checks:** User specifies min_out, reverts if unmet
- **Commit-reveal settle:** 60s delay for handle fees (prevents sandwich attacks)
- **Atomic registration:** All operations in one tx, no intermediate state

### Access Control
- **Friend visibility (FunC):** Verb contracts can only write to history via factory
- **Signer hierarchy:** Only handle owner can register posts under that handle
- **LP lock:** Creator's LP position locked via sealed state

### Overflow/Underflow
- Safe math library (`stdlib.fc`) with checked arithmetic
- All multiplication before division
- Explicit revert on underflow

## Walrus Integration

### Frontend
- Post content (text, media) → Walrus blob
- Profile metadata → Walrus
- UI state → Walrus (optional, for decentralization)

### Backend
- Post indexing → Walrus
- User feed aggregation → Walrus
- Analytics data → Walrus

**Advantage:** Censorship-resistant, decentralized storage layer.

## Governance (Future)

- Single DAO contract
- Voting power = DESNET-denominated LP rewards
- Multisig for sensitive operations (admin functions)
- Gradual transition from deployer to DAO

## Differences from Aptos Version

| Aspect | Aptos | TON |
|--------|-------|-----|
| **Language** | Move | FunC |
| **Token Standard** | FA | Jetton (TEP-74) |
| **NFT Standard** | Object | TEP-62/66 |
| **Gas Model** | APT per tx | TON per tx |
| **Messaging** | Function calls | TON messages |
| **Storage** | Struct-based | Cell-based |
| **Decimals** | 8 | 9 |
| **Handle Fee** | 1-100 APT | 0.1-10 TON |
| **AMM Fee** | 10 bps | 9 bps |
| **Data Layer** | On-chain | On-chain + Walrus |

## Next Steps

1. **Complete FunC implementations** — All 18 contracts fully functional
2. **Write tests** — Unit + integration tests for each contract
3. **Frontend integration** — Connect React to smart contracts via ton.js
4. **Backend indexing** — Walrus-based indexing of posts
5. **Testnet deployment** — Deploy to TON testnet
6. **Security audit** — Multi-LLM audit panel
7. **Mainnet launch** — Deploy to TON mainnet
