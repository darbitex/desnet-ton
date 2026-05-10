# DeSNet TON — Deployment Guide

## Prerequisites

- **Node.js:** 18+ LTS
- **TON CLI:** `npm install -g ton-cli` (or use TypeScript SDK)
- **FunC compiler:** Included in ton-cli
- **TON wallet:** For testnet/mainnet deployments

## Testnet Deployment

### 1. Set Up Environment

```bash
# Clone and install
git clone https://github.com/darbitex/desnet-ton.git
cd desnet-ton

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env`:**
```env
# TON Network
NETWORK=testnet
RPC_URL=https://testnet.toncenter.com/api/v2/jsonRPC
API_KEY=your_toncenter_api_key

# Deployer Wallet
DEPLOYER_MNEMONIC="your 24-word mnemonic"
DEPLOYER_ADDRESS=EQD...

# Walrus Config
WALRUS_RPC=https://walrus-testnet-rpc.example.com
WALRUS_KEY=your_walrus_key

# Frontend
VITE_API_URL=http://localhost:3001
VITE_NETWORK=testnet

# Backend
BACKEND_PORT=3001
```

### 2. Compile FunC Contracts

```bash
cd contracts

# Compile all FunC contracts
ton-cli compile

# Or manually compile each
func -o profile.fif profile.fc stdlib.fc
func -o factory.fif factory.fc stdlib.fc
func -o dex.fif dex.fc stdlib.fc
# ... etc for all 18 contracts

cd ..
```

### 3. Deploy Bootstrap Contract (Factory)

```bash
# Create deployment script
cat > scripts/deploy.ts << 'EOF'
import { TonClient, Address, beginCell, Cell } from "@ton/ton";
import { mnemonicToWalletKeyPair } from "@ton/crypto";
import fs from "fs";

const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" });

async function deploy() {
  const mnemonic = process.env.DEPLOYER_MNEMONIC!.split(" ");
  const keyPair = await mnemonicToWalletKeyPair(mnemonic);
  
  // Load compiled contract
  const factoryCode = Cell.fromBoc(Buffer.from(fs.readFileSync("contracts/factory.boc", "hex"), "hex"))[0];
  
  // Create initial state
  const initData = beginCell()
    .storeUint(0, 1) // owner = deployer
    .storeRef(factoryCode)
    .endCell();
  
  console.log("Factory contract deployed at:", initData.hash());
  // ... deploy logic
}

deploy().catch(console.error);
EOF

# Run deployment
npx ts-node scripts/deploy.ts
```

### 4. Deploy Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Deploy Backend

```bash
cd backend
npm install
npm run build
npm run dev
```

Backend will be available at `http://localhost:3001`

### 6. Test Registration Flow

```bash
# Via CLI
ton-cli send <factory_address> register_handle '{"handle":"test","profile_meta":"..."}'

# Via frontend
# 1. Go to http://localhost:5173
# 2. Connect wallet (TonConnect)
# 3. Register handle "test"
# 4. Confirm transaction
# 5. Wait for PID NFT + $TEST token mint
```

## Mainnet Deployment

### 1. Update Environment

```bash
# Edit .env
NETWORK=mainnet
RPC_URL=https://toncenter.com/api/v2/jsonRPC
```

### 2. Security Audit

Before mainnet, conduct a security audit (recommended multi-LLM panel):

```bash
# Export contract code for audit
for contract in contracts/*.fc; do
  func -o "audit/$(basename $contract .fc).boc" $contract stdlib.fc
done
```

### 3. Deploy to Mainnet

```bash
# Update deployer wallet to mainnet account
export DEPLOYER_ADDRESS=your_mainnet_address

# Run deployment
npx ts-node scripts/deploy.ts
```

### 4. Initialize Protocol Tokens

```bash
# Register the "desnet" handle (protocol token)
curl -X POST http://localhost:3001/api/handles/register \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "desnet",
    "owner": "your_address",
    "profile_meta": {
      "bio": "DeSNet protocol governance token",
      "picture_hash": "walrus_blob_hash"
    }
  }'
```

### 5. Finalize Governance

```bash
# Transfer admin to DAO resource account
# (Future implementation)
```

## Contract Addresses Reference

**Testnet Example:**
```
Factory:          EQA...
Profile NFT:      EQB...
DEX (TON/$DESNET): EQC...
LP Staking:       EQD...
Handle Fee Vault: EQE...
```

**Mainnet (to be filled after deployment)**
```
Factory:          EQ...
Profile NFT:      EQ...
DEX:              EQ...
LP Staking:       EQ...
Handle Fee Vault: EQ...
```

## Verification

### Check Deployment Status

```bash
# Verify contract exists
curl -X POST https://testnet.toncenter.com/api/v2/getAccountState \
  -H "Content-Type: application/json" \
  -d '{"address": "EQA..."}'

# Expected response: account is "active"
```

### Test with Example Transactions

```bash
# Register a handle
curl -X POST http://localhost:3001/api/handles/register \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "alice",
    "owner": "EQD..."
  }'

# Query profile
curl http://localhost:3001/api/profiles/alice

# Swap on DEX
curl -X POST http://localhost:3001/api/dex/swap \
  -H "Content-Type: application/json" \
  -d '{
    "token_in": "TON",
    "amount_in": "1000000000",
    "token_out": "$ALICE",
    "min_out": "1000000"
  }'
```

## Troubleshooting

### Contract Code Too Large

If compiled FunC is >64KB, split into multiple contracts with cross-calls.

### Gas Estimation Failed

Ensure sufficient TON balance for deployment and gas fees (typically 0.5+ TON).

### Wallet Connection Issues

Verify TonConnect is properly configured in `frontend/src/config.ts`.

## Post-Deployment Checklist

- [ ] All 18 contracts deployed and verified
- [ ] Frontend connects to deployed contracts
- [ ] Backend indexing Walrus data
- [ ] Handle registration works end-to-end
- [ ] DEX swaps functional
- [ ] LP staking earning rewards
- [ ] Posts indexed and queryable
- [ ] Governance DAO initialized (future)

## Support

For deployment issues, open a GitHub issue or contact the dev team.
