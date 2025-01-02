import fetch from 'node-fetch';
import {
  ParsedAccountData,
  Keypair,
  PublicKey,
  SystemProgram,
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();
const RPC = 'https://indulgent-frosty-ensemble.solana-mainnet.quiknode.pro/7dff9884bdba2cec4e09965cf0fc5e1feb278321';
const jito_Validators = [
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
];

const endpoints = [
  "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles"
];

const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
const FEE_RECIPIENT = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
const TOKEN_PROGRAM_ID1 = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOC_TOKEN_ACC_PROG = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const PUMP_FUN_ACCOUNT = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");

function bufferFromUInt64(value: number | string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer;
}

async function getCoinData(mintStr: string) {//this can be removed as we already have the function so maybe might shave few ms from the buying
  try {
    const url = `https://frontend-api.pump.fun/coins/${mintStr}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to retrieve coin data:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching coin data:', error);
    return null;
  }
}

async function getKeyPairFromPrivateKey(base58Key: string) {
  const decodedKey = bs58.decode(base58Key);
  return Keypair.fromSecretKey(decodedKey);
}

async function createTransaction(connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  priorityFeeInSol = 0) {
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 60000000 });//larger compute limit better
  const transaction = new Transaction().add(modifyComputeUnits);

  if (priorityFeeInSol > 0) {
    //priorityFeeInSol = 0.0001;//hard coding this one as he messed up with jito tip vs compute unit price
    const microLamports =  0.000060 * LAMPORTS_PER_SOL; //100k units basicially hardcoded here (trying 60k limit) try to have different for sell and buy as selling consumed less CU'S 
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ microLamports });
    transaction.add(addPriorityFee);
  };

  transaction.add(...instructions);
  transaction.feePayer = payer;

  // Adding Jito fee transfer instruction
  const jito_validator_wallet = await getRandomValidator();
  const fee = priorityFeeInSol * LAMPORTS_PER_SOL;
  const jitoFeeInstruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: jito_validator_wallet,
    lamports: fee,
  });
  transaction.add(jitoFeeInstruction);

  const recentBlockhash = await connection.getRecentBlockhash();
  transaction.recentBlockhash = recentBlockhash.blockhash;

  return transaction;
}

async function jito_executeAndConfirm( transaction: Transaction,
  connection: Connection) {
  try {
    const serializedTransaction = bs58.encode(transaction.serialize());

    const requests = endpoints.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sendBundle",
          params: [[serializedTransaction]],
        })
      })
    );

    const res = await Promise.all(requests.map((p) => p.catch((e) => e)));

    const success_res = res.filter((r) => !(r instanceof Error));
    if (success_res.length > 0) {
      const signature = transaction.signature;
      const latestBlockhash = await connection.getLatestBlockhash();
      return await jito_confirm(bs58.encode(signature as Uint8Array), latestBlockhash, connection);
    } else {
      console.error('Failed to send transaction to any Jito endpoint');
      return { confirmed: false, signature: null };
    }
  } catch (e) {
    console.error('Error in jito_executeAndConfirm:', e);
    return { confirmed: false, signature: null };
  }
}

async function jito_confirm(signature: string,
  latestBlockhash: any,
  connection: Connection) {//i will use pump fun api first
  try {
    const start = Date.now();
    let confirmed = false;
    let pollAttempts = 0;

    while (!confirmed && (Date.now() - start) < 30000) { // Poll for a maximum of 30 seconds
      const response = await connection.getSignatureStatus(signature);

      if (response && response.value && response.value.confirmationStatus === "confirmed") {
        confirmed = true;
      } else {
        pollAttempts += 1;
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 1 second before next poll (changed to .5)
      }
    }

    if (!confirmed) {
      console.error('Transaction confirmation timed out.');
    }

    return { confirmed, signature };
  } catch (e) {
    console.error('Error confirming transaction:', e);
    return { confirmed: false, signature };
  }
}

async function getRandomValidator() {
  const res = jito_Validators[Math.floor(Math.random() * jito_Validators.length)];
  return new PublicKey(res);
}

export async function pumpFunBuy(payerPrivateKey: string,
  mintStr: string,
  solIn: number,
  priorityFeeInSol: number,
  slippageDecimal: number):Promise<boolean>{
  try {
    const connection = new Connection(RPC, 'confirmed');

    // Fetch coin data
    const coinData = await getCoinData(mintStr);
    if (!coinData) {
      return false;
    }

    const payer = await getKeyPairFromPrivateKey(payerPrivateKey);
    const owner = payer.publicKey;
    const mint = new PublicKey(mintStr);

    // Fetch associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(mint, owner, false);
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);

    const instructions: TransactionInstruction[] = [];
    
    // If token account does not exist, create it
    if (!tokenAccountInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenAccountAddress,
          payer.publicKey,
          mint
        )
      );
    }

    // Calculate the number of tokens out and maximum SOL cost with slippage
    const solInLamports = solIn * LAMPORTS_PER_SOL;
    const tokenOut = Math.floor(solInLamports * coinData["virtual_token_reserves"] / coinData["virtual_sol_reserves"]);
    const solInWithSlippage = solIn * (1 + slippageDecimal);
    const maxSolCost = Math.floor(solInWithSlippage * LAMPORTS_PER_SOL);

    // Define keys for the instruction
    const keys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(coinData['bonding_curve']), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(coinData['associated_bonding_curve']), isSigner: false, isWritable: true },
      { pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID1, isSigner: false, isWritable: false },
      { pubkey: RENT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false }
    ];

    // Create the instruction data buffer
    const data = Buffer.concat([
      bufferFromUInt64("16927863322537952870"),
      bufferFromUInt64(tokenOut),
      bufferFromUInt64(maxSolCost)
    ]);

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: keys,
      programId: PUMP_FUN_PROGRAM,
      data: data
    });
    instructions.push(instruction);

    // Create and sign the transaction with all instructions
    const transaction = await createTransaction(connection, instructions, payer.publicKey, priorityFeeInSol);
    transaction.sign(payer);

    // Execute and confirm the transaction
    const { confirmed, signature } = await jito_executeAndConfirm(transaction, connection);
    if (confirmed) {
      console.log(`\x1b[32mBuy transaction confirmed: https://solscan.io/tx/${signature}\x1b[0m`);
      return true;
    } else {
      console.error(`\x1b[31mTransaction failed to confirm\x1b[0m`);
      return false;
    }
  } catch (error) {
    console.error(`\x1b[31mError in pumpFunBuy: ${error}\x1b[0m`);
    return false;
  }
  return false;
};

export async function pumpFunSell(payerPrivateKey: string,
  mintStr: string,
  percentageToSell: number,
  priorityFeeInSol: number,
  slippageDecimal: number):Promise<boolean>{
  try {
    const connection = new Connection(RPC as string, 'confirmed');

    // Fetch coin data
    const coinData = await getCoinData(mintStr);
    if (!coinData) {
      return false;
    };

    const payer = await getKeyPairFromPrivateKey(payerPrivateKey);
    const owner = payer.publicKey;
    const mint = new PublicKey(mintStr);

    // Fetch associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(mint, owner, false);
    const tokenAccountInfo = await connection.getParsedAccountInfo(tokenAccountAddress);

    if (!tokenAccountInfo.value) {
      return false;
    }

        // Type narrowing for ParsedAccountData
    const accountData = tokenAccountInfo.value.data;
    const parsedData = accountData as ParsedAccountData;
    var tokenAmount:any;
    var tokenAmountInDecimal:any;
    if ('parsed' in accountData) {
      tokenAmount = parsedData.parsed.info.tokenAmount.amount;
      tokenAmountInDecimal = parsedData.parsed.info.tokenAmount.uiAmount;

      if (tokenAmount == 0) {
        console.log('No tokens available to sell.');
        return false;
      };

      // Continue with the rest of your logic...
    } else {
      console.log('Token account data is not parsed.');
      return false;
    }

    if (tokenAmount == 0) {
      console.log('No tokens available to sell.');
      return false;
    }

    // Calculate the amount of tokens to sell based on the entered percentage
    if (percentageToSell < 0 || percentageToSell > 100) {
      console.log('Invalid percentage. Please enter a value between 0 and 100.');
      return false;
    }

    const amountToSell = Math.floor(tokenAmount * (percentageToSell / 100));

    if (amountToSell == 0) {
      console.log('The calculated token amount to sell is zero. Adjust your percentage.');
      return false;
    }

    // Calculate the minimum SOL output with slippage
    const minSolOutput = Math.floor(
      (amountToSell / tokenAmount) * tokenAmountInDecimal * (1 - slippageDecimal) * coinData["virtual_sol_reserves"] / coinData["virtual_token_reserves"]
    );

    // Define keys for the instruction
    const keys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(coinData['bonding_curve']), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(coinData['associated_bonding_curve']), isSigner: false, isWritable: true },
      { pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID1, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false }
    ];

    // Create the instruction data buffer
    const data = Buffer.concat([
      bufferFromUInt64("12502976635542562355"),
      bufferFromUInt64(amountToSell),
      bufferFromUInt64(minSolOutput)
    ]);

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: keys,
      programId: PUMP_FUN_PROGRAM,
      data: data
    });
    const instructions = [instruction];

    // Create and sign the transaction with all instructions
    const transaction = await createTransaction(connection, instructions, payer.publicKey, priorityFeeInSol);
    transaction.sign(payer);

    // Execute and confirm the transaction
    const { confirmed, signature } = await jito_executeAndConfirm(transaction, connection);
    if (confirmed) {
      console.log(`\x1b[32mSell transaction confirmed: https://solscan.io/tx/${signature}\x1b[0m`);
      return true;
    } else {
      console.error(`\x1b[31mTransaction failed to confirm\x1b[0m`);
      return false;
    }
  } catch (error) {
    console.error(`\x1b[31mError in pumpFunSell: ${error}\x1b[0m`);
    return false;
  };
};

