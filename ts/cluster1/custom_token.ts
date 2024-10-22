import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { 
    createMetadataAccountV3,
    DataV2Args,
    CreateMetadataAccountV3InstructionAccounts
} from '@metaplex-foundation/mpl-token-metadata';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import wallet from "../wba-wallet.json"

// Initialize Solana connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Import the wallet from the JSON file
const secretKey = new Uint8Array(wallet);
const keypair = Keypair.fromSecretKey(secretKey);
const payer = keypair;

// Define token metadata
const metadataUri = "https://devnet.irys.xyz/9StYiqqQPhBtya5tdJbbSTiPaDTSVUBxjZaEv5XuFidD"; // Replace with your actual metadata link

(async () => {
    try {
        // Create a new token mint
        const mint = await Token.createMint(
            connection,
            payer,
            payer.publicKey,
            null,
            9,  // Decimals
            TOKEN_PROGRAM_ID
        );

        console.log(`Token Mint Address: ${mint.publicKey.toBase58()}`);

        // Get associated token account for the mint
        const associatedTokenAccount = await mint.getOrCreateAssociatedAccountInfo(payer.publicKey);
        console.log(`Associated Token Account: ${associatedTokenAccount.address.toBase58()}`);

        // Mint tokens to the associated token account
        await mint.mintTo(
            associatedTokenAccount.address,
            payer.publicKey,
            [],
            1000000 // Number of tokens (1 token = 10^9 for 9 decimals)
        );

        console.log("Tokens minted successfully");

        // Create a UMI connection
        const umi = createUmi('https://api.devnet.solana.com');
        const signer = createSignerFromKeypair(umi, keypair);
        umi.use(signerIdentity(signer));

        // Metadata accounts
        const metadataPDA = (await PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
                mint.publicKey.toBuffer()
            ],
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
        ))[0];

        // Define metadata for the token
        const metadata: DataV2Args = {
            name: "My Token",
            symbol: "MTK",
            uri: metadataUri,
            sellerFeeBasisPoints: 500, // 5% royalties
            creators: null // Set creators if needed
        };

        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: metadataPDA,
            mint: mint.publicKey,
            mintAuthority: signer.publicKey,
            payer: signer.publicKey,
            updateAuthority: signer.publicKey
        };

        // Create metadata account transaction
        let tx = createMetadataAccountV3(umi, { ...accounts, data: metadata, isMutable: true });

        // Send and confirm the transaction
        let result = await tx.sendAndConfirm(umi);
        console.log(`Metadata account created: ${result.signature}`);

    } catch (error) {
        console.error(`Error: ${error}`);
    }
})();
