import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://devnet.irys.xyz/H7Ctv2johowq2dLMFmF7tJ8NhmD9277yzG47u4w8yn9B";
        const metadata = {
            name: "Sherlock_Andre_nft",
            symbol: "A0",
            description: "This is sherlock andre holmes !! ",
            image: image,
            attributes: [
                {trait_type: 'color', value: 'blue'},
                {trait_type: 'design', value: 'magestic'},
                {trait_type: 'rarity', value: 1},
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: [keypair.publicKey]
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
        const updatedUrl = myUri.replace("https://arweave.net", "https://devnet.irys.xyz");
        console.log("Your updated image URI: ", updatedUrl);
        //https://devnet.irys.xyz/5xJDpSugEbYhrBmTohtXkQ6qYoQJv6dB2Zb5B1i1AoP7
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
