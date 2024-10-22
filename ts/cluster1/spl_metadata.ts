import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";

// Define our Mint address
const mint = publicKey("J89Etzg3UhjWjcaGr1bKiPdcFbwhGSqVJQGo41itBDZc")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
      let accounts: CreateMetadataAccountV3InstructionAccounts = {
        mint: mint,
        mintAuthority: signer,
      };
  
      let data: DataV2Args = {
        name: "ORBIS AI",
        symbol: "ORBIS",
        uri: "https://devnet.irys.xyz/9StYiqqQPhBtya5tdJbbSTiPaDTSVUBxjZaEv5XuFidD",
        sellerFeeBasisPoints: 500,
        creators: [{ address: keypair.publicKey, verified: true, share: 100 }],
        collection: null,
        uses: null,
      };
  
      let args: CreateMetadataAccountV3InstructionArgs = {
        data: data,
        isMutable: true,
        collectionDetails: null,
      };
  
      let tx = createMetadataAccountV3(umi, {
        ...accounts,
        ...args,
      });
  
      let result = await tx.sendAndConfirm(umi);
  
      console.log(bs58.encode(result.signature));
    } catch (e) {
      console.error(`Oops, something went wrong: ${e}`);
    }
  })();