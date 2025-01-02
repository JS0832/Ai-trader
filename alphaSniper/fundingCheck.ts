import { Connection, clusterApiUrl, PublicKey,LAMPORTS_PER_SOL } from '@solana/web3.js';
const connection = new Connection('https://indulgent-frosty-ensemble.solana-mainnet.quiknode.pro/7dff9884bdba2cec4e09965cf0fc5e1feb278321', 'confirmed');

//whitelisted wallets (for future upgrade) for deciding other things like holding more greedy ect......
const walletWhiteListSpecial:string[] = ['G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t',
                                         'AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy'] //ect....

const walletWhiteListCex:string[] = ['2AQdpHJ2JpcEgPiATUXjQxA8QmafFegfQwSLWSprPicm',
                                    'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS',
                                    '6FEVkH17P9y8Q9aCkDdPcMDjvj7SVxrTETaYEm8f51Jy',
                                    'AobVSwdW9BbpMdJvTqeCN4hPAmh4rHm7vwLnQ5ATSyrS',
                                    '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S',
                                    '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
                                    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'] //ect....

async function getTransactionSender(txSignature: string) {
    try {
    // Try to fetch the transaction
    const txInfo = await connection.getTransaction(txSignature);

    if (!txInfo) {
        console.log('Transaction not found');
        return;
    };

    // Return the sender's account address
    const senderAccount = txInfo.transaction.message.accountKeys[0].toBase58();
    return senderAccount;

    } catch (error: any) {
    // Check if the error is related to unsupported transaction versions
        if (error.message.includes('Transaction version (0) is not supported')) {
            //console.log(`Skipping unsupported transaction version for signature: ${txSignature}`);
            return;  // Return nothing if the transaction version is unsupported
        } else {
            // Log any other errors that occur
            console.error('An unexpected error occurred:', error);
            return;
        }
    }
}
                                      

export async function fundingAccountConfirm(walletAddress: string) {

    const publicKey = new PublicKey(walletAddress);

    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 25 });

    if (signatures.length === 0) {
        console.log('No transactions found for this wallet.');
        return false;
    };

    if(signatures.length==25){//meaning we have more than 50 probably so we just pass this one
        return false;
    };

    const oldestSignature = signatures[signatures.length - 1].signature;
    const sender = await getTransactionSender(oldestSignature);
    let bal = 0;
    let sender_string = '';
    //check sender balance
    if(sender!=undefined){
        sender_string = sender;
        const senderPublicKeyObject = new PublicKey(sender);
        bal = parseFloat(((await connection.getBalance(senderPublicKeyObject))/LAMPORTS_PER_SOL).toFixed(5));
    };
    //console.log(`Funding wallet Balance: ${bal} SOL`);
    if(bal>150 || walletWhiteListCex.includes(sender_string) || walletWhiteListSpecial.includes(sender_string)){
        return true;
    }
    return false;
};

//prehaps also allow other wallets idk 

//i also dont want the wallet to be actively trading...

//const wallet = 'A1ws3hxATx1qy1uj7gT4v7ywqn91spuUf9RVJ1Y1JZFL';

//async function main(){
//   let check = await fundingAccountConfirm(wallet);
//   console.log(check);
//};

//main().catch(console.error);

//check the walet that funded the devs wallet
//to pass the wallet has have over 250 SOL (for now)
//this will mean the wallet is a cex most likely
//later on i might just white list the wallets im lookign for (all cexes)


//preperly document each token that it entered and have a csv file to record trades so it can be more better analysed


//store twitter,website and telegram links too and they cannot be rrepeated
