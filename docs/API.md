# DeSNet TON — REST API Documentation

## Base URL

```
Production: https://api.desnet-ton.app/api
Testnet:    http://localhost:3001/api
```

## Authentication

All endpoints support optional Bearer token auth:

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Handles

#### Register Handle

```
POST /handles/register
Content-Type: application/json

{
  "handle": "alice",
  "owner": "EQD...",
  "profile_meta": {
    "bio": "Just a person",
    "picture_hash": "walrus_blob_hash",
    "link": "https://example.com"
  }
}

Response: 200 OK
{
  "status": "success",
  "pid": "EQA...",
  "token": "EQZZ...",
  "token_symbol": "$ALICE",
  "dex": "EQB...",
  "tx_hash": "deadbeef..."
}
```

#### Get Handle

```
GET /handles/:handle

Response: 200 OK
{
  "handle": "alice",
  "owner": "EQD...",
  "pid": "EQA...",
  "token_symbol": "$ALICE",
  "token_address": "EQZZ...",
  "created_at": "2026-05-10T12:00:00Z",
  "profile_meta": {
    "bio": "Just a person",
    "picture_hash": "walrus_blob_hash"
  }
}
```

#### List Handles

```
GET /handles?page=1&limit=20&sort=created_at&order=desc

Response: 200 OK
{
  "data": [
    { "handle": "alice", ... },
    { "handle": "bob", ... }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Profiles

#### Get Profile

```
GET /profiles/:handle

Response: 200 OK
{
  "handle": "alice",
  "pid": "EQA...",
  "owner": "EQD...",
  "token_symbol": "$ALICE",
  "token_address": "EQZZ...",
  "token_supply": "1000000000000000000",
  "token_price_usd": "0.025",
  "followers": 1523,
  "following": 342,
  "posts_count": 187,
  "bio": "Just a person",
  "picture_hash": "walrus_blob_hash",
  "created_at": "2026-05-10T12:00:00Z"
}
```

#### Update Profile

```
PUT /profiles/:handle
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "bio": "Updated bio",
  "picture_hash": "new_walrus_hash"
}

Response: 200 OK
{ "status": "success" }
```

### Posts

#### Create Post (Mint)

```
POST /posts/mint
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "alice",
  "text": "Just posted from DeSNet!",
  "media": [
    {
      "type": "image",
      "walrus_hash": "blob_hash_1"
    }
  ],
  "tags": ["social", "web3"],
  "mentions": ["bob"],
  "tip_token": "TON",
  "tip_amount": "1000000"
}

Response: 201 Created
{
  "status": "success",
  "post_id": "post_1234567",
  "tx_hash": "deadbeef...",
  "created_at": "2026-05-10T12:00:00Z"
}
```

#### Get Post

```
GET /posts/:post_id

Response: 200 OK
{
  "post_id": "post_1234567",
  "author": "alice",
  "text": "Just posted from DeSNet!",
  "media": [...],
  "tags": ["social", "web3"],
  "mentions": ["bob"],
  "sparks": 45,
  "echoes": 12,
  "remixes": 3,
  "created_at": "2026-05-10T12:00:00Z",
  "reactions": [
    { "author": "bob", "type": "spark", "at": "2026-05-10T12:01:00Z" }
  ]
}
```

#### Get Feed

```
GET /posts/feed/:handle?page=1&limit=20

Response: 200 OK
{
  "data": [
    { "post_id": "post_1234567", ... },
    { "post_id": "post_1234568", ... }
  ],
  "total": 187,
  "page": 1,
  "limit": 20
}
```

#### Reply to Post (Voice)

```
POST /posts/:post_id/voice
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "bob",
  "text": "Great post!",
  "media": []
}

Response: 201 Created
{ "status": "success", "reply_id": "post_1234569" }
```

#### Like Post (Spark)

```
POST /posts/:post_id/spark
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "bob"
}

Response: 200 OK
{ "status": "success", "spark_count": 46 }
```

#### Repost (Echo)

```
POST /posts/:post_id/echo
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "bob"
}

Response: 200 OK
{ "status": "success" }
```

#### Quote Post (Remix)

```
POST /posts/:post_id/remix
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "bob",
  "text": "My thoughts on this...",
  "media": []
}

Response: 201 Created
{ "status": "success", "remix_id": "post_1234570" }
```

#### Mint Post as NFT (Press)

```
POST /posts/:post_id/press
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handle": "bob"
}

Response: 201 Created
{
  "status": "success",
  "nft_address": "EQNFT...",
  "tx_hash": "deadbeef..."
}
```

### Tokens

#### Get Token Info

```
GET /tokens/:symbol

Response: 200 OK
{
  "symbol": "$ALICE",
  "address": "EQZZ...",
  "owner": "alice",
  "supply": "1000000000000000000",
  "decimals": 9,
  "price_usd": "0.025",
  "holders": 342,
  "created_at": "2026-05-10T12:00:00Z"
}
```

#### Get Token Holders

```
GET /tokens/:symbol/holders?page=1&limit=20

Response: 200 OK
{
  "data": [
    { "holder": "EQD...", "balance": "500000000000000000" },
    { "holder": "EQE...", "balance": "250000000000000000" }
  ],
  "total": 342,
  "page": 1
}
```

### DEX / Swaps

#### Get DEX Pair

```
GET /dex/:symbol

Response: 200 OK
{
  "pair": "TON/$ALICE",
  "token_symbol": "$ALICE",
  "dex_address": "EQB...",
  "ton_reserve": "5000000000",
  "token_reserve": "50000000000000000",
  "fee_bps": 9,
  "lp_supply": "15811388",
  "price_ton_per_token": "0.0001",
  "created_at": "2026-05-10T12:00:00Z"
}
```

#### Get Swap Quote

```
GET /dex/:symbol/quote?token_in=TON&amount_in=1000000000

Response: 200 OK
{
  "token_in": "TON",
  "amount_in": "1000000000",
  "token_out": "$ALICE",
  "amount_out": "9900000000",
  "fee": "9000000",
  "price_impact": "0.1%"
}
```

#### Execute Swap

```
POST /dex/:symbol/swap
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "owner": "bob",
  "token_in": "TON",
  "amount_in": "1000000000",
  "token_out": "$ALICE",
  "min_out": "9800000000"
}

Response: 200 OK
{
  "status": "success",
  "amount_out": "9900000000",
  "tx_hash": "deadbeef..."
}
```

### Governance

#### Submit Proposal

```
POST /governance/proposals
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "proposer": "alice",
  "title": "Increase LP rewards",
  "description": "Propose increasing LP emission rate...",
  "action_type": "update_parameter",
  "action_data": { "parameter": "lp_emission_rate", "value": "0.05" }
}

Response: 201 Created
{ "status": "success", "proposal_id": 1 }
```

#### Vote on Proposal

```
POST /governance/proposals/:proposal_id/vote
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "voter": "bob",
  "option": "for"
}

Response: 200 OK
{ "status": "success" }
```

## Error Responses

### 400 Bad Request

```json
{
  "status": "error",
  "message": "Invalid handle format",
  "code": "INVALID_HANDLE"
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Handle not found",
  "code": "HANDLE_NOT_FOUND"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

- **Public endpoints:** 100 req/min per IP
- **Authenticated endpoints:** 1000 req/min per user

## SDK & Libraries

- **TypeScript:** `@desnet-ton/sdk`
- **Python:** `desnet-ton` (PyPI)
- **JavaScript:** `npm install desnet-ton-sdk`

## WebSocket (Real-time Updates)

```javascript
const ws = new WebSocket("wss://api.desnet-ton.app/ws");

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: "subscribe",
    channel: "posts:alice"
  }));
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log("New post:", update);
};
```

## Support

For API issues or feature requests, open a GitHub issue.
