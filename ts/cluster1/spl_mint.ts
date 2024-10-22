import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_0000_000n;

// Mint address
const mint = new PublicKey("J89Etzg3UhjWjcaGr1bKiPdcFbwhGSqVJQGo41itBDZc");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(connection,keypair,mint,keypair.publicKey);
        console.log(`Your ata is: ${ata.address.toBase58()}`);

        // // Mint to ATA
        const mintTx = await mintTo(connection,keypair,mint,ata.address,keypair.publicKey, 1n * token_decimals);
        console.log(`Your mint txid: ${mintTx}`);
        const info = await connection.getTokenAccountBalance(keypair.publicKey);
        if (info.value.uiAmount == null) throw new Error('No balance found');
        console.log('Balance (using Solana-Web3.js): ', info.value.uiAmount);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
