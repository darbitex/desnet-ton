import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";
import * as fs from "fs";
import * as path from "path";

/**
 * Creates a new TON testnet wallet for deployment
 * Usage: npx ts-node scripts/create-wallet.ts
 */

async function createWallet() {
  console.log("🔐 Creating new TON testnet wallet...\n");

  // Generate new mnemonic
  const mnemonic = await mnemonicNew(24);
  console.log("📝 Mnemonic (24 words):");
  console.log(mnemonic.join(" "));
  console.log("\n⚠️  SAVE THIS MNEMONIC SECURELY! This is for testnet only.\n");

  // Derive private key
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  console.log("🔑 Private Key (hex):");
  console.log(keyPair.secretKey.toString("hex"));
  console.log();

  // Create wallet contract
  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0,
  });

  const address = wallet.address;
  console.log("📍 Wallet Address (testnet):");
  console.log(address.toString({ testOnly: true }));
  console.log("\n📍 Wallet Address (friendly):");
  console.log(address.toString({ testOnly: true, bounceable: true }));
  console.log();

  // Save to .env
  const envPath = path.join(process.cwd(), ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  // Update or add wallet variables
  envContent = envContent.replace(
    /DEPLOYER_MNEMONIC=.*/,
    `DEPLOYER_MNEMONIC="${mnemonic.join(" ")}"`
  );
  if (!envContent.includes("DEPLOYER_MNEMONIC")) {
    envContent += `\nDEPLOYER_MNEMONIC="${mnemonic.join(" ")}"\n`;
  }

  envContent = envContent.replace(
    /DEPLOYER_ADDRESS=.*/,
    `DEPLOYER_ADDRESS=${address.toString({ testOnly: true, bounceable: true })}`
  );
  if (!envContent.includes("DEPLOYER_ADDRESS")) {
    envContent += `\nDEPLOYER_ADDRESS=${address.toString({ testOnly: true, bounceable: true })}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Wallet saved to .env\n");

  // Instructions
  console.log("\n📋 NEXT STEPS:\n");
  console.log(
    "1. Fund your testnet wallet with TON from the faucet:\n"
  );
  console.log("   https://t.me/testgiver_ton_bot\n");
  console.log("   Send: /start");
  console.log(
    `   Then: /send ${address.toString({ testOnly: true, bounceable: true })}\n`
  );
  console.log("2. Or use https://testnet.tonfaucet.com/\n");
  console.log("3. Once funded, run: npm run deploy:testnet\n");
}

createWallet().catch(console.error);
