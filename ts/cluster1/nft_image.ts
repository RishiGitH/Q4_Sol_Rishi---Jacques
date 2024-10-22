import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import path from 'path'


// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        const imagePath = path.join(__dirname, '..', 'orbis_ai.png');
        const image = await readFile(imagePath);
        //2. Convert image to generic file.
        const genImage =  createGenericFile(image,"rug",{contentType:"image/png"});
        //3. Upload image
        const [myUri] = await umi.uploader.upload([genImage]); 
        
        console.log("Your image URI: ", myUri);
        //https://arweave.net/5xJDpSugEbYhrBmTohtXkQ6qYoQJv6dB2Zb5B1i1AoP7
        const updatedUrl = myUri.replace("https://arweave.net", "https://devnet.irys.xyz");
        console.log("Your updated image URI: ", updatedUrl);
        //https://devnet.irys.xyz/5xJDpSugEbYhrBmTohtXkQ6qYoQJv6dB2Zb5B1i1AoP7
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
