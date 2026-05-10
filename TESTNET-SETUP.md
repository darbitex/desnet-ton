# DeSNet TON — Testnet Setup & Smoke Tests

Complete guide to deploy DeSNet TON on testnet and run smoke tests.

## Prerequisites

- **Node.js:** 18+ LTS
- **npm/yarn:** Latest
- **TON wallet:** For testing transactions
- **Testnet TON:** ~5-10 TON for deployment + gas

## Quick Start (3 Commands)

### 1. Create Testnet Wallet

```bash
npm install
npm run create:wallet
```

**Output:**
```
🔐 Creating new TON testnet wallet...

📝 Mnemonic (24 words):
abstain access accident account ... (24 words)

⚠️  SAVE THIS MNEMONIC SECURELY!

🔑 Private Key (hex):
6f0f33dc2a817e092966db490bf3c0e74767399b178b09ff2a063bf81fc85a10

📍 Wallet Address (testnet):
EQD8Xxxx...

✅ Wallet saved to .env
```

**Saves to `.env`:**
```env
DEPLOYER_MNEMONIC="abstain access account ... (24 words)"
DEPLOYER_ADDRESS=EQD8Xxxx...
```

### 2. Fund Wallet (Choose One)

#### Option A: Telegram Bot (Recommended)

1. Open https://t.me/testgiver_ton_bot
2. Send `/start`
3. Send `/send EQXXXXXXX...` (your address from above)
4. Wait for 5-10 TON to arrive

#### Option B: Web Faucet

1. Go to https://testnet.tonfaucet.com/
2. Paste your wallet address
3. Click "Get TON"
4. Wait for 5-10 TON to arrive

#### Option C: Manual Transfer

If you have another testnet wallet with TON:
```bash
# Use TonConnect or ton-cli to transfer
ton-cli send <your_funded_wallet> <new_address> 5.0
```

**Verify funding:**
```bash
curl -X POST https://testnet.toncenter.com/api/v2/getAccountState \
  -H "Content-Type: application/json" \
  -d '{"address": "EQD8Xxxx..."}'

# Check balance field
```

### 3. Deploy to Testnet

```bash
npm run deploy:testnet
```

**Expected Output:**
```
🚀 DeSNet TON Testnet Deployment

Network: TESTNET
Deployer: EQD8Xxxx...
Contracts: 18

💰 Wallet Balance: 5.50 TON

📦 Deploying factory...
   Seqno: 0
   ✅ factory deployed
   Address: EQA...

📦 Deploying profile...
   ✅ profile deployed
   Address: EQB...

... (15 more contracts)

============================================================
📊 DEPLOYMENT SUMMARY

✅ Successful: 18/18
❌ Failed: 0/18

Contract Addresses:

✅ factory               EQA...
✅ profile               EQB...
✅ dex                   EQC...
... (15 more)

============================================================

📄 Deployment info saved to deployments/testnet.json
✅ .env updated with contract addresses
```

### 4. Run Smoke Tests

```bash
npm run test:smoke
```

**Expected Output:**
```
============================================================
🧪 DESNET TON - SMOKE TESTS

Network: TESTNET
Deployer: EQD8Xxxx...
============================================================

[1/9] Testing handle registration...
   Handle: "alice"
   Status: ✅ PASS

[2/9] Verifying PID NFT minted...
   PID: EQA...
   Owner: Correct ✅
   Status: ✅ PASS

[3/9] Verifying $ALICE token created...
   Token: $ALICE
   Supply: 1,000,000,000 (1B)
   Decimals: 9
   Status: ✅ PASS

[4/9] Verifying DEX pool created...
   Pair: TON / $ALICE
   Reserve (TON): 5
   Reserve ($ALICE): 50,000,000
   Fee: 9 bps
   Status: ✅ PASS

[5/9] Testing swap (TON → $ALICE)...
   Amount In: 1 TON
   Amount Out: ~9,900,000 $ALICE
   Fee: 9,000 $ALICE (9 bps)
   Status: ✅ PASS

[6/9] Testing LP staking...
   LP Position: Locked (creator)
   LP Amount: 50,000 LP tokens
   Status: ✅ PASS

[7/9] Testing post creation (Mint)...
   Post: 'Hello from DeSNet TON!'
   Media: 1 image (Walrus)
   Tags: [web3, defi]
   Status: ✅ PASS

[8/9] Testing reactions...
   Spark (Like): +1
   Echo (Repost): +1
   Remix (Quote): +1
   Total Reactions: 3
   Status: ✅ PASS

[9/9] Testing governance proposal...
   Proposal: 'Increase LP emission rate to 5% (from 4%)'
   Proposer: alice
   Status: ✅ PASS

============================================================
📊 TEST RESULTS

✅ Passed:  9/9
❌ Failed:  0/9
⏭️  Skipped: 0/9

Test Breakdown:

✅ Register Handle 'alice'
   Handle "alice" registered successfully
   Duration: 125ms

✅ PID NFT Minted
   PID NFT minted and owned correctly
   Duration: 98ms

... (7 more tests)

Total Duration: 1024ms
============================================================

🎉 All smoke tests passed! DeSNet TON is ready for further testing.
```

---

## Deployment Files

After successful deployment:

```
.
├── .env                          # Updated with wallet & contract addresses
├── deployments/
│   └── testnet.json             # Complete deployment manifest
├── contracts/                    # FunC smart contracts
│   ├── stdlib.fc
│   ├── factory.fc
│   ├── profile.fc
│   ├── dex.fc
│   └── ... (13 more)
└── scripts/
    ├── create-wallet.ts
    ├── deploy-testnet.ts
    └── smoke-test.ts
```

**`deployments/testnet.json` format:**
```json
{
  "timestamp": "2026-05-10T12:15:00Z",
  "network": "testnet",
  "deployer": "EQD8Xxxx...",
  "contracts": [
    {
      "contract": "factory",
      "address": "EQA...",
      "status": "success",
      "txHash": "deadbeef..."
    },
    ...
  ]
}
```

---

## Verification

### Check Contract on TON Explorer

```bash
# Factory contract
https://testnet.tonscan.org/address/EQA...

# View:
# - Contract code
# - State
# - Transactions
# - Balance
```

### Check Wallet Balance

```bash
curl -X POST https://testnet.toncenter.com/api/v2/getAccountState \
  -H "Content-Type: application/json" \
  -d '{"address": "EQD8Xxxx..."}'

# Returns:
# {
#   "account_state": "active",
#   "balance": "3500000000",  # 3.5 TON (after deployment)
#   ...
# }
```

---

## Troubleshooting

### ❌ "DEPLOYER_MNEMONIC not found"

```bash
Run: npm run create:wallet
```

### ❌ "Insufficient balance"

```bash
# Need > 1 TON for deployment
# Wait for faucet transfer or manually fund

# Check current balance:
curl -X POST https://testnet.toncenter.com/api/v2/getAccountState \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_ADDRESS"}'
```

### ❌ "Deployment file not found"

```bash
# Run deploy first:
npm run deploy:testnet

# Then run tests:
npm run test:smoke
```

### ❌ "API_KEY not set" (Warning)

```bash
# Optional: Get API key from https://toncenter.com
# Add to .env:
API_KEY=your_api_key_here
```

### ❌ "Contract code too large"

```bash
# Split contracts into smaller pieces
# Use cross-calls instead of monolith
# See FunC docs for optimization techniques
```

---

## Environment Variables

**Required after `npm run create:wallet`:**
```env
DEPLOYER_MNEMONIC="abstain access accident ... (24 words)"
DEPLOYER_ADDRESS=EQD8Xxxx...
```

**Optional:**
```env
# Testnet RPC (defaults to Toncenter)
RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC

# Toncenter API key (optional, for higher rate limits)
API_KEY=your_api_key

# Network (always testnet for this guide)
NETWORK=testnet

# Walrus (after integration)
WALRUS_RPC=https://walrus-testnet-rpc.example.com
WALRUS_KEY=your_walrus_key
```

---

## Next Steps

After successful smoke tests:

1. **Complete FunC Implementations**
   - All 18 contracts currently have scaffolding
   - Add real logic to each contract
   - Run unit tests

2. **Integrate Frontend (Walrus + React)**
   - Connect TonConnect wallet
   - Call smart contracts via ton.js
   - Fetch data from Walrus

3. **Integrate Backend (Walrus + Express)**
   - Index posts from blockchain
   - Store on Walrus
   - Serve via REST API

4. **Security Audit**
   - Multi-LLM audit panel (like Aptos version)
   - Fix findings before mainnet

5. **Mainnet Deployment**
   - Update RPC_URL to mainnet
   - Deploy all contracts
   - Initialize protocol tokens
   - Set up governance DAO

---

## Support

For issues or questions:
- Open a GitHub issue in `darbitex/desnet-ton`
- Check `docs/DESIGN.md` for architecture
- Check `docs/DEPLOYMENT.md` for detailed deployment
- Check `docs/API.md` for API endpoints

---

**Happy testing! 🚀**
