// Define the structure of the expected response for better type checking
import * as fs from 'fs';
import {fundingAccountConfirm} from './fundingCheck';
import {SniperWalletManager} from './bundleStatusTracker';
const myWalletAddress = 'FMQNv6LjvHt1goi5spTse2M9Ccaeak72buNM86nNuNQP';
const isRealTrading = false; //for either dry testing or for enalbing trading in real life
const simulateDelay = 3000;// in ms
var shutDownBot = false;
var current_session_token_txn_counts:number[] = [];
import { Connection, PublicKey,LAMPORTS_PER_SOL } from "@solana/web3.js";
const myWalletpublicKey = new PublicKey(myWalletAddress);
import dotenv from "dotenv";
dotenv.config();
const payerPrivateKey = '4cW1SKYi9QVVW2gfAEbzBR1cXrtkWqaUgnsu3WDbr1d7k4TR9PFjQyp1xJ1LknJyx7GZ8HJZyvtDsvGkNYxhNZp3';
const slippageDecimal = 1;
const priorityFeeInSol = 0.0004;//.0..1 or ...5 
var startingsol:number = 0;
const connection = new Connection('https://indulgent-frosty-ensemble.solana-mainnet.quiknode.pro/7dff9884bdba2cec4e09965cf0fc5e1feb278321');
//imports fo buy/sell
import { pumpFunBuy, pumpFunSell } from'./swap';
var starting_bal = 0;
var wins = 0; //for win rate
var losses = 0;
var winrate = 0;
let AverageTopPrice = 0;
//ai tensorflow
import * as tfjs from '@tensorflow/tfjs-node';
import * as path from 'path';
let model: tfjs.LayersModel;
async function loadModel() {
  const modelPath = path.resolve(__dirname, 'token_prediction_pump');
  model = await tfjs.loadLayersModel(`file://${modelPath}/model.json`);
  console.log('Ai Model loaded successfully.');
  //return model;
}

//I will add dca selling as that should increase profitablility alot
//I need to recalculate the entry price and adjust certain things after i dca sell ( i need to also see realised and unrealised sol)
//selling on raydium too

const tp_stages = [50,100] //exprressed in %
const tp_amount = [25,25] //means 25% at 50% pnl and 25% at 100% and rest will work as normal?

// ANSI escape codes for colors
const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const Dim = "\x1b[2m";
const Underscore = "\x1b[4m";
const Blink = "\x1b[5m";
const Reverse = "\x1b[7m";
const Hidden = "\x1b[8m";

// Foreground colors
const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

// Background colors
const BgBlack = "\x1b[40m";
const BgRed = "\x1b[41m";
const BgGreen = "\x1b[42m";
const BgYellow = "\x1b[43m";
const BgBlue = "\x1b[44m";
const BgMagenta = "\x1b[45m";
const BgCyan = "\x1b[46m";
const BgWhite = "\x1b[47m";


let globalNameEpochArray: NameEpoch[] = [];
let globalTickerEpochArray: TickerEpoch[] = [];
let globalSocialLinksArray: string[] = [];

//Data stuctures to help store names and tickers and their time of creation.
interface NameEpoch {
  name: string;
  epoch: number;
};
interface TickerEpoch {
  ticker: string;
  epoch: number;
};

let commonBotsList:string[] = ['orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8'];

// i need to store a custom proxy for data reading and the actuall trade trakcign so i dont encounter a timout ( not overloading the request threshold)
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

import { ProxyManager } from './proxyManager';
const proxyList = [
  "198.23.239.134:6540:vjeccopm:h2parktvjeq6",
  "207.244.217.165:6712:vjeccopm:h2parktvjeq6",
  "107.172.163.27:6543:vjeccopm:h2parktvjeq6",
  "64.137.42.112:5157:vjeccopm:h2parktvjeq6",
  "173.211.0.148:6641:vjeccopm:h2parktvjeq6",
  "161.123.152.115:6360:vjeccopm:h2parktvjeq6",
  "167.160.180.203:6754:vjeccopm:h2parktvjeq6",
  "154.36.110.199:6853:vjeccopm:h2parktvjeq6",
  "173.0.9.70:5653:vjeccopm:h2parktvjeq6",
  "173.0.9.209:5792:vjeccopm:h2parktvjeq6"
];

const proxyListForTrading = [
  "198.23.239.134:6540:vjeccopm:h2parktvjeq6",
  "207.244.217.165:6712:vjeccopm:h2parktvjeq6",
  "107.172.163.27:6543:vjeccopm:h2parktvjeq6",
  "64.137.42.112:5157:vjeccopm:h2parktvjeq6",
  "173.211.0.148:6641:vjeccopm:h2parktvjeq6",
  "161.123.152.115:6360:vjeccopm:h2parktvjeq6",
  "167.160.180.203:6754:vjeccopm:h2parktvjeq6",
  "154.36.110.199:6853:vjeccopm:h2parktvjeq6",
  "173.0.9.70:5653:vjeccopm:h2parktvjeq6",
  "173.0.9.209:5792:vjeccopm:h2parktvjeq6"
];

let blacklistedHost:string[] = []; //if error

function getRandomProxy() {
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  const proxy = proxyList[randomIndex];

  // Split the proxy string into parts
  const [host, port, username, password] = proxy.split(':');
  return { host, port, username, password };
}

async function fetchCoinDataUsingProxy(mint: string): Promise<CoinData> {
  const apiUrl = `https://frontend-api.pump.fun/coins/${mint}`;

  // Get a random proxy from the pool
  const { host, port, username, password } = getRandomProxy();

  // Create a proxy agent with the selected proxy
  const proxyAgent = new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);

  try {
    const response = await axios.get(apiUrl, {
      httpsAgent: proxyAgent,
    });

    return response.data; // Assuming response data contains the CoinData
  } catch (error) {
    throw new Error(`Error fetching data ${host}`);
  }
}

function getRandomProxy2() {
  const randomIndex = Math.floor(Math.random() * proxyListForTrading.length);
  const proxy = proxyListForTrading[randomIndex];

  // Split the proxy string into parts
  const [host, port, username, password] = proxy.split(':');
  return { host, port, username, password };
}

async function fetchCoinDataUsingProxyForTrading(mint: string): Promise<CoinData> {
  const apiUrl = `https://frontend-api.pump.fun/coins/${mint}`;

  // Get a random proxy from the pool
  const { host, port, username, password } = getRandomProxy2();

  // Create a proxy agent with the selected proxy
  const proxyAgent = new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);

  try {
    const response = await axios.get(apiUrl, {
      httpsAgent: proxyAgent,
    });

    return response.data; // Assuming response data contains the CoinData
  } catch (error) {
    throw new Error(`Error fetching data`);
  }
}


//i will use local for trades 

interface Coin {
    mint: string;
    name: string;
    symbol: string;
    description: string;
    image_uri: string;
    metadata_uri: string;
    twitter: string | null;
    telegram: string | null;
    bonding_curve: string;
    associated_bonding_curve: string;
    creator: string;
    created_timestamp: number;
    raydium_pool: string | null;
    complete: boolean;
    virtual_sol_reserves: number;
    virtual_token_reserves: number;
    hidden: boolean | null;
    total_supply: number;
    website: string | null;
    show_name: boolean;
    last_trade_timestamp: number;
    king_of_the_hill_timestamp: number | null;
    market_cap: number;
    reply_count: number;
    last_reply: number;
    nsfw: boolean;
    market_id: string | null;
    inverted: boolean | null;
    is_currently_live: boolean;
    username: string | null;
    profile_image: string | null;
    usd_market_cap: number;
}

interface CoinData {
      mint: string;
      name: string;
      symbol: string;
      description: string;
      image_uri: string;
      metadata_uri: string;
      twitter: string;
      telegram: string;
      bonding_curve: string;
      associated_bonding_curve: string;
      creator: string;
      created_timestamp: number;
      raydium_pool: string | null;
      complete: boolean;
      virtual_sol_reserves: number;
      virtual_token_reserves: number;
      total_supply: number;
      website: string | null;
      show_name: boolean;
      king_of_the_hill_timestamp: number | null;
      market_cap: number;
      reply_count: number;
      last_reply: number;
      nsfw: boolean;
      market_id: string | null;
      inverted: string | null;
      is_currently_live: boolean;
      username: string;
      profile_image: string;
      usd_market_cap: number;
}
  
async function fetchCoinData(mint: string): Promise<CoinData> {
const url = `https://frontend-api.pump.fun/coins/${mint}`;
const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
}
const data: CoinData = await response.json();
return data;
}

interface Trade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index: number;
  username: string | null;
  profile_image: string | null;
  slot: number;
}

interface Token {
  id: string;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  entryEpoch:number;
  previousHigh:number;
  entryRecalibrated:boolean;
  entryMarketCap:number; //approximation to keep the nice visul presentation but now im switching to price trackign in terms of solana
  realisedPnl:number;
  initialInvested:number;
  initialTokens:number; //as this will be not exact and needs to be calibrated
  trailingStopLoss:number; // added to be dynamic based on confidence
  positionSize:number; //added to be dynaminc based on confidence
  stopLossRatio:number;
  confidence:number;
};

type RiskParams = {
  confidence: number;  // BCE confidence level (0.6 to 1.0)
  defaultStopLoss: number;  // Default stop loss in percentage (e.g., 20)
  defaultTrailingStopLoss: number;  // Default trailing stop loss in percentage (e.g., 25)
  riskAdjustedStopLoss: number;  // Maximum stop loss adjusted by risk (e.g., 25)
  riskAdjustedTrailingStopLoss: number;  // Maximum trailing stop loss based on risk (e.g., 30)
};



function loosenStopLossAndRisk(params: RiskParams) {
  const { confidence, defaultStopLoss, defaultTrailingStopLoss, riskAdjustedStopLoss, riskAdjustedTrailingStopLoss } = params;

  // Validate confidence to be within 0.6 and 1.0
  if (confidence < 0.6 || confidence > 1.0) {
    throw new Error("Confidence must be between 0.6 and 1.0");
  }

  // Reverse logistic curve for loosening stop loss
  const loosenStopLoss = (confidence: number) => {
    const L = defaultStopLoss;  // Start at default stop loss
    const k = 10;  // Steepness of the curve
    const x0 = 0.8;  // Midpoint of confidence range (more loosening above 0.8 confidence)
    const adjustedStopLoss = riskAdjustedStopLoss + (L - riskAdjustedStopLoss) / (1 + Math.exp(-k * (confidence - x0)));
    
    return adjustedStopLoss;
  };

  // Reverse logistic curve for loosening trailing stop loss
  const loosenTrailingStopLoss = (confidence: number) => {
    const L = defaultTrailingStopLoss;  // Start at default trailing stop loss
    const k = 10;  // Steepness of the curve
    const x0 = 0.8;  // Midpoint of confidence range
    const adjustedTrailingStopLoss = riskAdjustedTrailingStopLoss + (L - riskAdjustedTrailingStopLoss) / (1 + Math.exp(-k * (confidence - x0)));
    
    return adjustedTrailingStopLoss;
  };

  // Exponential function for adjusting position risk (optional)
  const exponentialPositionRisk = (confidence: number) => {
    const baseRisk = 0.04;  // Starting position risk as a decimal (0.05 = 5%)
    const growthRate = 1.5;  // Growth rate of risk
    const adjustedRisk = baseRisk * Math.exp(growthRate * (confidence - 0.6));
    
    return adjustedRisk;
  };

  const stopLoss = loosenStopLoss(confidence);
  const trailingStopLoss = loosenTrailingStopLoss(confidence);
  const positionRisk = exponentialPositionRisk(confidence);

  return {
    stopLoss,  // Numerical value in decimal (e.g., 0.18 for 18%)
    trailingStopLoss,  // Numerical value in decimal (e.g., 0.22 for 22%)
    positionRisk  // Numerical value in decimal (e.g., 0.07 for 7%)
  };
}

// Array to store all tracked tokens
let tokens: Token[] = [];

// Function to add a token to tracking
let portAllocationPercent = .05;//5% each time (raised to 5%)
let trailingStopLossPercent = .25;//20% for now (trying 15% now) (25% now as we are using ai)
async function addToken(id: string, entryPrice: number,entryMarketCap:number,confidenceValue:number) {
  if(tokens.length>0){ //not allow two tokens added into one trading session (simple fix)
    console.log(`Unable to place trade as we already have one token that is currently in a trade!`)
    return;
  };

  // this will help adjust the trade based on confidence levels
  const params: RiskParams = {
    confidence: confidenceValue,  // BCE confidence level
    defaultStopLoss: 0.35,  // Default stop loss 20% (as decimal 0.20)
    defaultTrailingStopLoss: 0.30,  // Default trailing stop loss 25% (as decimal 0.25)
    riskAdjustedStopLoss: 0.20,  // Minimum stop loss 15% (as decimal 0.15)
    riskAdjustedTrailingStopLoss: 0.15  // Minimum trailing stop loss 20% (as decimal 0.20)
  };
  //the paramaters can also be saved to evaluate hoe the trade erpformed under those paramaters and prehaps tune them a little 

  const result = loosenStopLossAndRisk(params);//i also need to add the trailign stop and position as a positions paramater of the object

  portAllocationPercent = result.positionRisk;
  trailingStopLossPercent = result.trailingStopLoss;
  let stopLossRatio = 1-result.stopLoss
  let stopLoss = entryPrice * (1-result.stopLoss);   // 25% stop loss
  let takeProfit = entryPrice * 8;
  let entryEpoch = Date.now()/1000; //in seconds
  let previousHigh = entryPrice;//FOR A Trailing stop loss ( its the entry mc initially)
  let entryRecalibrated = false; //this will be used to recalibrate the entry prices to real life values as there is disparity between the buys and sell prices to get as accurate entry p and selling procie as possible ( this disparity would gow even more if we introduce many buys and sells)
  let realisedPnl = 0;
  let initialInvested = 0;//will get updated when the true entry price is updated.
  let initialTokens = 0;//will get updated when the true entry price is updated.
  let trailingStopLoss = result.trailingStopLoss;
  let positionSize = result.positionRisk;
  let confidence = confidenceValue;
  if (!isRealTrading){
    tokens.push({
        id,
        entryPrice,
        currentPrice: entryPrice,
        stopLoss,
        takeProfit,
        entryEpoch,
        previousHigh,
        entryRecalibrated,
        entryMarketCap,
        realisedPnl,
        initialInvested,
        initialTokens,
        trailingStopLoss,
        positionSize,
        stopLossRatio,
        confidence
      });
      //buy here (determine the position size by checking wallet balance then /20 for 5% per trade or max of .25)
      console.log(`Started tracking ${id} with entry Price of ${entryPrice}`);
  }else{//is in real trading mode.
    //need to confirm it bought if failed then move on
    var buy_start = Date.now();
    var buy_result = await buy_token(id);
    var buy_end = Date.now();
    var data = await fetchCoinDataUsingProxyForTrading(id);//(might skip this as i am cheecking the real buy prices in the trades)
    var entryMarketCapreal = data.market_cap/10**9;
    stopLoss = entryMarketCapreal * (1-result.stopLoss);   // 25% stop loss
    takeProfit = entryMarketCapreal * 8;
    entryEpoch = buy_end/1000; //in seconds
    previousHigh = entryMarketCapreal;
    entryPrice = entryMarketCapreal;
    let entryRecalibrated = false;
    if(buy_result){
        tokens.push({
            id,
            entryPrice,
            currentPrice: entryPrice,
            stopLoss,
            takeProfit,
            entryEpoch,
            previousHigh,
            entryRecalibrated,
            entryMarketCap,
            realisedPnl,
            initialInvested,
            initialTokens,
            trailingStopLoss,
            positionSize,
            stopLossRatio,
            confidence
          });
          console.log(`Bought and Started tracking ${id} with entry Price of ${entryPrice} time taken: ${buy_end-buy_start}ms`);
    }else{
        console.log(`failed to buy token ${id} skipping....`);
    };//if it fails then we just skip the token and it move on
  };
};
//i will add dyamic timout so even tho total timout is 80s it will have dynamic timeout of like 20s more or less whaoch will be triggered if there i no rise in price within that amount of time.
class MarketCapTracker {
  private lastMarketCap: number | null;
  private lastEpoch: number | null;

  constructor() {
      this.lastMarketCap = null;
      this.lastEpoch = null;
  };

  submit(marketCap: number, epochTime: number): boolean {
      if (this.lastMarketCap === null && this.lastEpoch === null) {
          this.lastMarketCap = marketCap;
          this.lastEpoch = epochTime;
          return false;
      };

      const timeDifference = epochTime - (this.lastEpoch as number);

      if (marketCap > (this.lastMarketCap as number)*1.05) { //prehaps ignore small chnaged in rise (5%+ only)
          //console.log(`updated new dynamic timeout Epoch: ${marketCap}`);
          this.lastMarketCap = marketCap;
          this.lastEpoch = epochTime;
          return false;
      };

      if (timeDifference > 40) {//20 seconds dyanmic timout (raising to 40 seconds as we are using ai now)
          return true; // Exit condition
      };

      return false; // Continue holding
  };
};

const fetchRealTimeTrades = async (mint: string, limit: number = 1000, offset: number = 0): Promise<Trade[]> => {
  const apiUrl = `https://frontend-api.pump.fun/trades/all/${mint}?limit=${limit}&offset=${offset}&minimumSize=0`;
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
        };
    
        // Parse the JSON response
        const data: Trade[] = await response.json();
        //consider what happens when it switches pages of trades (200 per page) because you want to uppdate the bundle status up to date
        // Return the parsed data
        return data;
    }catch (error) {
        console.error('Error fetching trades:', error);
        return [];
    };
  };


async function removeToken(id: string, result: string,profit_value:number,token: Token) {
    tokens = tokens.filter(token => token.id !== id);
    console.log(`Token ${id} has been closed: ${result}`);
    if(isRealTrading){
      startingsol = parseFloat(((await connection.getBalance(myWalletpublicKey))/LAMPORTS_PER_SOL).toFixed(5));
      console.log(`synced real wallet balance to: ${startingsol} SOL`);
    };
    fs.appendFileSync('market_results.txt', `${new Date().toISOString()} Token ${id},${result} (${(token.stopLossRatio).toFixed(3)},${(token.trailingStopLoss).toFixed(3)},${(token.positionSize).toFixed(3)}) Confidence Value: ${(token.confidence).toFixed(2)}\n`);
    fs.appendFileSync('market_results_csv.txt', `${token.entryEpoch},${id},${profit_value},${(token.stopLossRatio).toFixed(3)},${(token.trailingStopLoss).toFixed(3)},${(token.positionSize).toFixed(3)},${(token.confidence).toFixed(2)}\n`);//for automated analysis
    dev_sniped_wallets.length = 0;//clear the list to prepare for new token to trade. 
};

//maybe adjust stop loss based on entry mc ( downd=side risk and also the consifdence level of the neural network)

let tracker = new MarketCapTracker();//to help exit a coin if its nothin goign up within certain time period
let devWalletManager = new SniperWalletManager();
const timeout = 300;//1.5 minutes max (will be removed soon manybe) (5 minutes as we are using ai now)
let dev_sniped_wallets:string[] = [];//store wallets sniped to track
let past_trade_tx:string[] = [];//stroe past transaction hashes to not revesit them again
const tp1_pnl_percent = 1.5; //so above 50% we will tp 1 sale then recalculate entry risk , realised ect
const multiTp = false;//enable/disable multiple tp fucntion (atm disabled as i need to make the trades be as fast as possible for this to be worhty of doing)
async function trackTokens() {//have a try block so u dont lose the trade if api has a timeout (//TODO)
    while (true) {
      if(shutDownBot==true){
        //shut down the loop
        break;
      };
      for (const token of tokens){//i will be now tracking price not market cap for managing the trade but i will still display it in marketcap for nice visuals
          try{
              let data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
              let currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
              let currentPrice = data.market_cap/10**9;
              token.currentPrice = currentPrice;
              let currentEpochTime = Math.floor(Date.now() / 1000);
              let shouldExit = tracker.submit(currentPrice, currentEpochTime);//set to 20s of no price appricietion to exit
              let sell_count = 0;
              let rug_exit:boolean = false;
              let tradeTx = '';
              let volume = 0; //we will display volume in last 20s
              //in this i can also track the current trades and see and new trades that have occured in order to update the sniper wallet statusses possibly
              if(currentEpochTime>token.entryEpoch+20){//only start chekcing after 20s of being in the trade
                  //console.log('20 seconds have passed,checking for a potential rugpull');
                  let current_trades:Trade[] = await fetchRealTimeTrades(token.id);
                  for(const trade of current_trades){
                    // we should be able to find our recent trade here too
                    if(token.entryRecalibrated==false && isRealTrading){
                      if (trade.user == myWalletAddress){
                        let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
                        token.currentPrice = trade_price;
                        token.initialInvested = trade.sol_amount/10**9; //in SOL
                        token.initialTokens = trade.token_amount;
                        token.entryRecalibrated=true;
                        console.log('token entry price has been recalibrated');
                      };
                    };
                    tradeTx = trade.signature.toString();
                    if(!past_trade_tx.includes(tradeTx) && dev_sniped_wallets.includes(trade.user)){//wea re only interested in trades invloving the sniped wallets
                      if(trade.is_buy==false){
                        let tokensSold = trade.token_amount;
                        devWalletManager.updateTokens(trade.user,tokensSold);
                      };
                      past_trade_tx.push(tradeTx);
                    };
                    //check if the trades tx hash was already submitted
                    if(trade.timestamp>currentEpochTime-20){//last 20s of trades
                      //trades within the last 20s
                      if(trade.is_buy==false){
                        sell_count++;
                      };
                    };
                  };
                  //console.log(`sell count within last 20s: ${sell_count}`);
                  if (sell_count<=2){
                    rug_exit = true;
                    //console.log(`lack of sells within 20s exiting to avoid rug pull.`)
                  };
              }else{
                //we still want to immidiately track dev moves ( dev bundle selll offs tracking )
                let current_trades:Trade[] = await fetchRealTimeTrades(token.id);//should be ok now but needs to consider the case when it enters a token and the trades are about to move to next page so it downt miss the whole page of trades in one go
                for(const trade of current_trades){
                  // we should be able to find our recent trade here too
                  if(token.entryRecalibrated==false && isRealTrading){
                    if (trade.user == myWalletAddress){
                      let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
                      token.currentPrice = trade_price;
                      token.initialInvested = trade.sol_amount/10**9; //in SOL
                      token.initialTokens = trade.token_amount;
                      token.entryRecalibrated=true;
                      console.log('token entry price has been recalibrated');
                    };
                  };
                  tradeTx = trade.signature.toString();
                  if(!past_trade_tx.includes(tradeTx) && dev_sniped_wallets.includes(trade.user)){//wea re only interested in trades invloving the sniped wallets
                    if(trade.is_buy==false){
                      let tokensSold = trade.token_amount;
                      devWalletManager.updateTokens(trade.user,tokensSold);
                    };
                    past_trade_tx.push(tradeTx);
                  };
                  if(trade.timestamp>currentEpochTime-10){//last 10s of trades (measuring 10s volume)
                    let trade_amount = Math.abs(trade.sol_amount/10**9);
                    volume+=trade_amount;
                  }; 
                };
              };
              if(token.entryRecalibrated==false && isRealTrading){
                console.log(`performaing price calibration using page 2 of the trade section`);
                let current_trades:Trade[] = await fetchRealTimeTrades(token.id,1000,200);
                for(const trade of current_trades){
                    if (trade.user == myWalletAddress){
                      let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
                      token.currentPrice = trade_price;
                      token.initialInvested = trade.sol_amount/10**9; //in SOL
                      token.initialTokens = trade.token_amount;
                      token.entryRecalibrated=true;
                      console.log('token entry price has been recalibrated');
                    };
                };
                //here we will give it once more time to fetch real time trades again with offset 200 incase it enteres on page 2 ( page 3 is super unlikely)
                //if fails too then it failed and just have to work with 
                if(token.entryRecalibrated==false){
                  console.log(`failed to recalibrate entry prices! please review this incident`)
                  rug_exit = true; //we will just exit the trade if the price was not calibrated 
                };
              };
              if(devWalletManager.getAllWalletStatuses()<=70 && dev_sniped_wallets.length>1){//exits when dev sells 25% of the bundle (We will adjut it later) /TODO
                //also needs to be meaningful amount (supply wise)
                rug_exit = true;
              };
              if(rug_exit){
                var position_used = 0;
                if(!isRealTrading){//more realistic
                    delay(simulateDelay);//for simulating delay
                    data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                    currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                    currentPrice = data.market_cap/10**9;
                    token.currentPrice = currentPrice;
                    currentEpochTime = Math.floor(Date.now() / 1000);
                    position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                    if (position_used>.25){
                      position_used = .25
                    };
                }else{
                    position_used = token.initialInvested;
                };
                var closing_position = position_used*(currentPrice/token.entryPrice);
                startingsol = startingsol-position_used+closing_position;
                if(!isRealTrading){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} likely scam detected`,currentPrice/token.entryPrice,token);
                }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                      await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} likely scam detected`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                };
                tracker = new MarketCapTracker();//resets it to a new object again
                devWalletManager = new SniperWalletManager();
                console.log(`current portfolio size: ${startingsol} SOL`);
              }else if (shouldExit){
                var position_used = 0;
                if(!isRealTrading){
                    await new Promise(resolve => setTimeout(resolve, simulateDelay));
                    data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                    currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                    currentPrice = data.market_cap/10**9;
                    token.currentPrice = currentPrice;
                    currentEpochTime = Math.floor(Date.now() / 1000);
                    position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                    if (position_used>.25){
                      position_used = .25
                    };
                }else{
                    position_used = token.initialInvested;
                };
                var closing_position = position_used*(currentPrice/token.entryPrice);
                startingsol = startingsol-position_used+closing_position;
                if(!isRealTrading){
                  await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} dynamic timeout!`,currentPrice/token.entryPrice,token);
                }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                        await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} dynamic timeout!`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                };
                tracker = new MarketCapTracker();//resets it to a new object again
                devWalletManager = new SniperWalletManager();
                console.log(`current portfolio size: ${startingsol} SOL`);
              }else if(currentPrice <= token.stopLoss){
                var position_used = 0;
                if(!isRealTrading){
                    await new Promise(resolve => setTimeout(resolve, simulateDelay));
                    data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                    currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                    currentPrice = data.market_cap/10**9;
                    token.currentPrice = currentPrice;
                    currentEpochTime = Math.floor(Date.now() / 1000);
                    position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                    if (position_used>.25){
                      position_used = .25
                    };
                }else{
                    position_used = token.initialInvested;
                };
                var closing_position = position_used*(currentPrice/token.entryPrice);
                startingsol = startingsol-position_used+closing_position;
                if(!isRealTrading){
                  await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} sl hit!`,currentPrice/token.entryPrice,token);
                }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                      await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} sl hit!`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                };
                console.log(`current portfolio size: ${startingsol} SOL`);
                tracker = new MarketCapTracker();//resets it to a new object again
                devWalletManager = new SniperWalletManager();
              }else if (currentPrice >= token.takeProfit) {//use previousLow for trailing stop loss take profits
                var position_used = 0;
                if(!isRealTrading){
                    await new Promise(resolve => setTimeout(resolve, simulateDelay));
                    data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                    currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                    currentPrice = data.market_cap/10**9;
                    token.currentPrice = currentPrice;
                    currentEpochTime = Math.floor(Date.now() / 1000);
                    position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                    if (position_used>.25){
                      position_used = .25
                    };
                }else{
                    position_used = token.initialInvested;
                };
                var closing_position = position_used*(currentPrice/token.entryPrice);
                startingsol = startingsol-position_used+closing_position;
                if(!isRealTrading){
                  await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} max tp hit!`,currentPrice/token.entryPrice,token);
                }else{
                  var sell_start = Date.now();
                  var sell_result = await sell_token(token.id);
                  var sell_end = Date.now();
                  if(sell_result){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} max tp hit!`,currentPrice/token.entryPrice,token);
                      console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                  }else{
                      shutDownBot = true;
                      console.log(`something went wrong with selling shutting down the bot!`);
                      break;
                  };
                };
                console.log(`current portfolio size: ${startingsol} SOL`);
                devWalletManager = new SniperWalletManager();
                tracker = new MarketCapTracker();//resets it to a new object again
              }else if((Date.now()/1000)-token.entryEpoch>timeout){
                var position_used = 0;
                if(!isRealTrading){
                    await new Promise(resolve => setTimeout(resolve, simulateDelay));
                    data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                    currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                    currentPrice = data.market_cap/10**9;
                    token.currentPrice = currentPrice;
                    currentEpochTime = Math.floor(Date.now() / 1000);
                    position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                    if (position_used>.25){
                      position_used = .25
                    };
                }else{
                    position_used = token.initialInvested;
                };
                var closing_position = position_used*(currentPrice/token.entryPrice);
                startingsol = startingsol-position_used+closing_position;
                if(!isRealTrading){
                  await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} timeout!`,currentPrice/token.entryPrice,token);
                }else{
                  var sell_start = Date.now();
                  var sell_result = await sell_token(token.id);
                  var sell_end = Date.now();
                  if(sell_result){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} timeout!`,currentPrice/token.entryPrice,token);
                      console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                  }else{
                      shutDownBot = true;
                      console.log(`something went wrong with selling shutting down the bot!`);
                      break;
                  };
                };
                console.log(`current portfolio size: ${startingsol} SOL`);
                devWalletManager = new SniperWalletManager();
                tracker = new MarketCapTracker();//resets it to a new object again
              }else if((currentPrice<=token.previousHigh*(1-trailingStopLossPercent) && token.previousHigh>=token.entryPrice*(1+(trailingStopLossPercent*1.05))) && ((currentPrice/token.entryPrice)<3)){//this is for strailing stop loss (now added a dynamic one where its more looser if the floating PNL is above 2.5X to make trailing top loss to be not 15% but 25%)
                  var position_used = 0;
                  if(!isRealTrading){
                      await new Promise(resolve => setTimeout(resolve, simulateDelay));
                      data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                      currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                      currentPrice = data.market_cap/10**9;
                      token.currentPrice = currentPrice;
                      currentEpochTime = Math.floor(Date.now() / 1000);
                      position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                      if (position_used>.25){
                        position_used = .25
                      };
                  }else{
                      position_used = token.initialInvested;
                  };
                  var closing_position = position_used*(currentPrice/token.entryPrice);
                  startingsol = startingsol-position_used+closing_position;
                  if(!isRealTrading){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} trailing stop loss triggered!`,currentPrice/token.entryPrice,token);
                  }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                      await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} trailing stop loss triggered!`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                  };
                  console.log(`current portfolio size: ${startingsol} SOL`);
                  devWalletManager = new SniperWalletManager();
                  tracker = new MarketCapTracker();//resets it to a new object again
              }else if(currentPrice<=token.previousHigh*(1-(trailingStopLossPercent*1.5)) && ((currentPrice/token.entryPrice)>=3)){//50% looser trailing stop loss as high floating PNL > 2.5x
                  var position_used = 0;
                  if(!isRealTrading){
                      await new Promise(resolve => setTimeout(resolve, simulateDelay));
                      data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                      currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                      currentPrice = data.market_cap/10**9;
                      token.currentPrice = currentPrice;
                      currentEpochTime = Math.floor(Date.now() / 1000);
                      position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                      if (position_used>.25){
                        position_used = .25
                      };
                  }else{
                      position_used = token.initialInvested;
                  };
                  var closing_position = position_used*(currentPrice/token.entryPrice);
                  startingsol = startingsol-position_used+closing_position;
                  if(!isRealTrading){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} trailing stop loss triggered!`,currentPrice/token.entryPrice,token);
                  }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                      await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} trailing stop loss triggered!`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                  };
                  console.log(`current portfolio size: ${startingsol} SOL`);
                  devWalletManager = new SniperWalletManager();
                  tracker = new MarketCapTracker();//resets it to a new object again
              }else if(currentMarketCap>40000){
                  var position_used = 0;
                  if(!isRealTrading){
                      await new Promise(resolve => setTimeout(resolve, simulateDelay));
                      data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                      currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                      currentPrice = data.market_cap/10**9;
                      token.currentPrice = currentPrice;
                      currentEpochTime = Math.floor(Date.now() / 1000);
                      position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                      if (position_used>.25){
                        position_used = .25
                      };
                  }else{
                      position_used = token.initialInvested;
                  };
                  var closing_position = position_used*(currentPrice/token.entryPrice);
                  startingsol = startingsol-position_used+closing_position;
                  if(!isRealTrading){
                    await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} max marketcap reached!`,currentPrice/token.entryPrice,token);
                  }else{
                    var sell_start = Date.now();
                    var sell_result = await sell_token(token.id);
                    var sell_end = Date.now();
                    if(sell_result){
                      await removeToken(token.id, `${(-100+(currentPrice/token.entryPrice)*100).toFixed(2)}% Entry: ${token.entryMarketCap} Exit: ${currentMarketCap} Entry: ${token.entryPrice} Exit: ${currentPrice} Portfolio size: ${startingsol.toFixed(2)} max marketcap reached!`,currentPrice/token.entryPrice,token);
                        console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                    }else{
                        shutDownBot = true;
                        console.log(`something went wrong with selling shutting down the bot!`);
                        break;
                    };
                  };
                  console.log(`current portfolio size: ${startingsol} SOL`);
                  devWalletManager = new SniperWalletManager();
                  tracker = new MarketCapTracker();//resets it to a new object again
              }else if(currentPrice>=token.entryPrice*tp1_pnl_percent && multiTp){//for nwo i will have one take profit point then rest will be sold as normally ( i will add more tp points and double check everythign as well as add total and in position pnl values )
                  console.log('TP-1 has been hit selling 50% of position...');//need to add for simulation too 
                  if(isRealTrading){
                      var sell_start = Date.now();
                      var sell_result = await sell_token(token.id,50);//50% Of the tokens
                      var sell_end = Date.now();
                      if(sell_result){
                          console.log(`Sold,time taken to sell: ${sell_end-sell_start}ms`);
                      }else{
                          shutDownBot = true;
                          console.log(`something went wrong with selling shutting down the bot!`);
                          break;
                      };
                      let current_trades:Trade[] = await fetchRealTimeTrades(token.id);//should be ok now but needs to consider the case when it enters a token and the trades are about to move to next page so it downt miss the whole page of trades in one go
                      for(const trade of current_trades){
                          if (trade.user == myWalletAddress && trade.is_buy==false){//we want to see the sell
                            let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
                            token.currentPrice = trade_price;
                            token.realisedPnl = trade.sol_amount/10**9; //in SOL
                            let value_of_sold_position = (trade.token_amount/10**6)*(token.currentPrice);
                            if(token.initialInvested-value_of_sold_position>0){
                              token.entryPrice = ((token.initialInvested-value_of_sold_position)/(trade_price*trade.token_amount/10**6))*trade_price;
                            }else{
                              token.entryPrice = 0;//zero risk is we happened to sell more than initial invested
                            };
                            console.log(`Sold Sucesfully realised PNL for tp1: ${token.realisedPnl} current total Pnl: ${(token.realisedPnl+(currentPrice)*((token.initialTokens-trade.token_amount)/10**6)).toFixed(2)} SOL`);
                            break;
                          };
                      };
                  }else{
                    var position_used = 0;
                    if(!isRealTrading){
                      await new Promise(resolve => setTimeout(resolve, simulateDelay));
                      data = await fetchCoinDataUsingProxyForTrading(token.id);//this will be my own function
                      currentMarketCap = parseFloat(data.usd_market_cap.toFixed(2));
                      currentPrice = data.market_cap/10**9;
                      token.currentPrice = currentPrice;
                      currentEpochTime = Math.floor(Date.now() / 1000);
                        position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                        if (position_used>.25){
                          position_used = .25
                        };
                    }else{
                        position_used = token.initialInvested;
                    };
                    token.realisedPnl = 0.5*position_used*parseFloat((currentPrice/token.entryPrice).toFixed(2)); //in SOL
                    let value_of_sold_position = (0.5)*(token.currentPrice/token.entryPrice)*position_used;
                    if(position_used-value_of_sold_position>0){
                      token.entryPrice = ((position_used-value_of_sold_position)/(token.initialInvested-token.realisedPnl)*currentPrice);
                    }else{
                      token.entryPrice = 0;//zero risk is we happened to sell more than initial invested
                    };
                    console.log(`Sold Sucesfully realised PNL for tp1: ${token.realisedPnl} current total Pnl: ${(token.realisedPnl+(currentPrice)*((token.initialTokens/2)/10**6)).toFixed(2)} SOL`);
                  };
              }else{
                  var position_used = 0;
                  if(!isRealTrading){
                      position_used = startingsol*portAllocationPercent;//position used will also need to be recalibrated simply by checking amount of sol used in the purchase fo the token
                      if (position_used>.25){
                        position_used = .25
                      };
                  }else{
                      position_used = token.initialInvested;//because it will be reclibrate to true position that is used when it was purchased so thats why we are using this
                  };
                  console.log(`${token.id} is being tracked. Dev has: ${devWalletManager.getAllWalletStatuses().toFixed(2)}% of his postion, Current Mc: ${currentMarketCap}, 20s VOL: ${volume.toFixed(2)} SOL, fPNL: ${(((currentPrice/token.entryPrice)*100)-100).toFixed(2)}% Pos Size: ${position_used.toFixed(2)}SOL , Duration ${((Date.now()/1000)-token.entryEpoch).toFixed(2)}s Price: ${currentPrice} SOL/token`);
                  if (currentPrice>token.previousHigh){
                    token.previousHigh = currentPrice;//set new high if there is one to manage the trailing stop loss
                    console.log(`New ATH: ${currentMarketCap}$`);//still will display mc for nice visual presentation
                  };
              };
              if(startingsol<starting_bal*.7){
                //if we lost over 30% of port the shut down bot!
                shutDownBot = true;
              };
        }catch (error) { //helps to prevent the program shutting down during an open trade and shows the error that occoured 
          console.error('Error during an open trade:', error);
        };
      };
      // Wait for a few milliseconds before checking again
      await new Promise(resolve => setTimeout(resolve, 150)); // (Trying 0.3s now) (lower is better ofc) (trying 0.150 since i have proxies )
    };
  };

function delay(ms: number) {
    //console.log(`simulating a ${ms/1000}s delay of a transaction`);
    return new Promise(resolve => setTimeout(resolve, ms));
};
  
// Fetch trades by passing the mint as an argument
const fetchTradesByMint = async (mint: string, limit: number = 20, offset: number = 0): Promise<Trade[]> => {
  const apiUrl = `https://frontend-api.pump.fun/trades/all/${mint}?limit=${limit}&offset=${offset}&minimumSize=0`;
  try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
      throw new Error('Failed to fetch data from the API');
      }

      // Parse the JSON response
      const data: Trade[] = await response.json();

      // Return the parsed data
      return data;
  } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
  };
};

class DelayedQueue {
  private queue: Set<string> = new Set();

  constructor(private delay: number, private processFn: (key: string) => Promise<void>) {}

  // Enqueue a unique key
  enqueue(key: string) {
    if (this.queue.has(key)) {
      throw new Error(`Key "${key}" already exists in the queue`);
    }
    
    this.queue.add(key);

    // Set a timeout to process the key independently after the delay
    setTimeout(async () => {
      if (this.queue.has(key)) {
        this.queue.delete(key); // Remove key from queue

        try {
          await this.processFn(key); // Process the key
        } catch (error) {
          console.error(`Error processing key "${key}":`, error);
        }
      }
    }, this.delay); // Delay for the provided amount of time
  }
}



async function fetchUserData(userAddress: string,tokenOfInterest:string): Promise<number> {//returns -1 if token doesnt exist in the wallet or a number of tokens if it does
  const url = `https://frontend-api.pump.fun/balances/${userAddress}?limit=1000&offset=0&minBalance=-1`;
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
  }
  const data: Asset[] = await response.json();
  for(const token of data){
      if(token.mint==tokenOfInterest){
          return token.balance;
      };
  };
  return -1;
};

async function devCheck(dev_address:string): Promise<boolean>{ //return true if the dev only has one previo token (which si the token they currently made obv)
//filter for specific things for example dev never made previous tokens ect
const url = `https://frontend-api.pump.fun/balances/${dev_address}?limit=10&offset=0&minBalance=-1`;
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
  };
  const data: Asset[] = await response.json();
  //console.log(data)
  let token_count = 0;
  for(const token of data){
    token_count++;
  };
  if (token_count==0){
    return true;
  };
  return false;
};

async function calculateATHPrice(token:string): Promise<number>{//only works for short period of time since token creation due to the need to check for offset
  var trades_data = await fetchTradesByMint(token,250,0);
  let highestPrice = 0;
  for (const trade of trades_data){ 
      let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
      if(trade_price>highestPrice){
        highestPrice = trade_price;
      };
  };
  return highestPrice;
};

//finding copycat ticker and names
function findEpochByName(name: string): number | null {
  const entry = globalNameEpochArray.find(item => item.name === name);
  return entry ? entry.epoch : null;
};

function findEpochByTicker(ticker: string): number | null {
  const entry = globalTickerEpochArray.find(item => item.ticker === ticker);
  return entry ? entry.epoch : null;
};

async function checkSniper(sniperWallet:string):Promise<string[]>{
  const url = `https://frontend-api.pump.fun/balances/${sniperWallet}?limit=20&offset=0&minBalance=-1`;//if it display in chronological order i think
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
  };
  const data: Asset[] = await response.json();
  //console.log(data)
  let token_list:string[] = []
  for(const token of data){
    token_list.push(token.mint);
  };
  return token_list;
};

let blacklistedwallets:string[] = [];

async function sniperWalletAnalysis(sniperWallets:string[]){//TODO (Get some coffee first)
    let check = true;
    if(sniperWallets.length>=5){
      const promises = sniperWallets.map((sniperWallet) => checkSniper(sniperWallet));
      const results:string[][] = await Promise.all(promises); // Wait for all promises to complete
      const minLength = 5;
      const allArraysAboveLength = results.every((subArray) => subArray.length >= minLength);
      let check = false;
      if(allArraysAboveLength){
        const firstArray = results[0];
          check  = !(results.every((subArray) => 
          subArray.length === firstArray.length && 
          subArray.every((item, index) => item === firstArray[index])));
          //check for similarities (needs t0 be 1:1 match)
      };
    };
    if(!check){
      console.log(`Serial rugger detected!`);
      blacklistedwallets.concat(sniperWallets);
      fs.appendFileSync('blacklisted.txt',sniperWallets.join('\n') + '\n');
      //also here add the wallets to the balcklist
    };
    return check;//false = rug ,true = ok
};

interface TokenData { //interface to collect the token data to determine what to buy
  token_mint:string;
  creation_time :number;
  twitter: boolean;
  telegram: boolean;
  website: boolean;
  trades: Trade[];
  above_threshold_mc:boolean;
  Marketcap_at_checkpoint:number;
};

function normalizeData(data: number[]): number[] {
  const tensor = tfjs.tensor1d(data);
  const mean = tensor.mean();
  const std = tensor.sub(mean).pow(2).mean().sqrt();
  return data.map(val => (val - mean.dataSync()[0]) / std.dataSync()[0]);
}

let meanGlobal = 0;
let stdGlobal = 0;
function loadNormalizationStats(){
  const statsFilePath = path.join(__dirname, 'normalization_stats.json');
  
  if (!fs.existsSync(statsFilePath)) {
      throw new Error(`Normalization stats file not found at ${statsFilePath}`);
  }

  const fileContent = fs.readFileSync(statsFilePath, 'utf-8');
  const { mean, std } = JSON.parse(fileContent);

  console.log(`Loaded mean: ${mean}, std: ${std}`);
  meanGlobal = mean;
  stdGlobal = std;
};

function normalizeNewToken(data: number[]): number[] {
  return data.map(val => (val - meanGlobal) / stdGlobal);
};

function extractFeatures(token: TokenData) { //for ai preprocessing to prepare the new token to be checked by the loaded model

  const tradeAmounts: number[] = [];
  const uniqueUsers: Set<string> = new Set();

  token.trades.forEach(trade => {
    const tradeAmount = trade.is_buy ? trade.sol_amount : -trade.sol_amount;
    tradeAmounts.push(tradeAmount);

  });

  const cappedTradeAmounts = tradeAmounts.slice(0, 150);
  // Pad with 0s if fewer than 200 elements
  while (cappedTradeAmounts.length < 150) {
    cappedTradeAmounts.push(0);
  }

  const features = [...cappedTradeAmounts];

  return features;
};

function extractFeatures2(token: TokenData) { //more expanded version
  const tradeAmounts: number[] = [];
  const uniqueUsers: Set<string> = new Set();
  let buyTimeIntervals: number[] = [];
  let sellTimeIntervals: number[] = [];
  let buyAmounts: number[] = [];
  let sellAmounts: number[] = [];

  //let record the time time delta between each trade looking atht he first time stamp as 0 time.
  //migth be an intersting addition.
  //maybe seperate buys and sells int seperate feature columns.

  const first_transaction_epoch:number = token.trades[0].timestamp;
  //deonted in milliseconds i think


  token.trades.forEach(trade => {
    if (trade.is_buy) {
      const buyAmount = trade.sol_amount / 10 ** 9;  // Adjust scale for buys
      buyAmounts.push(buyAmount);
      buyTimeIntervals.push(trade.timestamp - first_transaction_epoch);
    } else {
      const sellAmount = trade.sol_amount / 10 ** 9;  // Adjust scale for sells
      sellAmounts.push(sellAmount);
      sellTimeIntervals.push(trade.timestamp - first_transaction_epoch);
    }

    // Track unique users
    if (trade.user) {
      uniqueUsers.add(trade.user);
    };


  });

  // Cap the size of tradeAmounts and timeIntervals to 200 elements
   buyAmounts = buyAmounts.slice(0, 100);
   sellAmounts =sellAmounts.slice(0,100);
  const cappedSellTimeIntervals = sellTimeIntervals.slice(0, 100);
  const cappedBuyTimeIntervals = buyTimeIntervals.slice(0, 100);
  // Pad with 0s if fewer than 200 elements
  while (buyAmounts.length < 100) {
    buyAmounts.push(0);
  };
  while (sellAmounts.length < 100) {
    sellAmounts.push(0);
  };
  while (cappedSellTimeIntervals.length < 100) {
    cappedSellTimeIntervals.push(0);
  };
  while (cappedBuyTimeIntervals.length < 100) {
    cappedBuyTimeIntervals.push(0);
  };

  // Calculate the number of unique users
  const uniqueUserCount = uniqueUsers.size; //not including this at the moment

  // Final feature vector: Trade amounts, time intervals, and unique user count
  const features = [
    ...buyAmounts,
    ...sellAmounts,
    ...cappedBuyTimeIntervals,
    ...cappedSellTimeIntervals
  ];

  return features;
}

let list_of_data_collected_for_tokens: TokenData[] = [];
const datacollectiononlymode = false; //collection or collection + trading
const timefromcreation = 15;//in seconds (7 seconds usually but testing 1) (5 was alright) what im worried about is gettgin trapped in the quick PND'S ( we will see) set to 0 now
const processKey = async(key: string) => {//also are we processing old tokens in the queue if it enters a trade?
    if (tokens.length==0){
        try{
        var data:any;
        let check_delay1 = Date.now()/1000;
        devWalletManager = new SniperWalletManager();//resets it each time it checks the token for new token (this is per token so if we run the function in parallel then this is messed up //TODO
        past_trade_tx.length = 0;
        dev_sniped_wallets.length = 0;
        var trades_data = await fetchTradesByMint(key);
        var trades_count = 0;
        var danger = false;
        var minbuy = 0.1;
        var sells_count = 0;
        let dev_tokens = 0;
        let volume = 0;//this will be the total volume recorded in the first x seconds of trading data
        const max_allowable_team_wallet_amount = 15;//set to 10 but set higher to see if we can get some good token with big bundles (wanna keep it at 10-12 but in the future i wanna use gmgn team wallets checker then i can maybe even remove this check or use it for other reason)
        dev_tokens = trades_data[trades_data.length-1].token_amount/10**6;//first buyer basically (we assume dev for now as this is the case most of the time) (gonna add a try catch block to prevent shutdowns for now)
        let dev_account = trades_data[trades_data.length-1].user;
        let multiple_buys_from_same_wallet_count = 0;//used to predict team wallet scam. (could be but its not a 100% confirmation)
        let nonDevBuys = 0;//approximation
        let initialTimeStamp = trades_data[trades_data.length-1].timestamp//in seconds
        let ignore = false;
        for (const trade of trades_data){ //gonna implement a simple check for potential team wallets to avoid common rug ( will do this better next time)
            let trade_amount = Math.abs(trade.sol_amount/10**9);
            volume+=trade_amount;
            if (trade.is_buy == true){
                if(initialTimeStamp == trade.timestamp && trade.user!=dev_account && !commonBotsList.includes(trade.user)){ //we dont want to observe the dev wallet for selling. (we allow the dev to sell) we dont want to count orca bot as dev wallets too
                  multiple_buys_from_same_wallet_count++;
                  //add the wallet as part of the team wallets
                  dev_sniped_wallets.push(trade.user);
                  devWalletManager.addWallet(trade.user,trade.token_amount);
                  past_trade_tx.push(trade.signature);
                  //console.log(`${trade.user} ${trade.timestamp}`)
                };
                if(commonBotsList.includes(trade.user)){
                  //ignore = true; //we will not enter a token that has orca in it
                };
                if((trade.sol_amount/10**9)>=10){//someone holds too much even if its the bundle is bad (tbd) (was 7 before)
                    //console.log(trade.sol_amount)
                    danger = true;
                };
            }else{
              if((trade.sol_amount/10**9)>=minbuy){
                sells_count++;
              };
            };
        };
        nonDevBuys = trades_count-multiple_buys_from_same_wallet_count;//we ofc ingore tiny buyers
        current_session_token_txn_counts.push(trades_count);//add trades coun for this token so we can use this array to find 70% 80% and 90% percentile counts to help tweak the bot (in future it will dynmaiclaly adjust every 2-4h)
        data = await fetchCoinData(key);
        //append the data of the new token to the data colection json structure
        let tele = false;
        let web = false;
        let tw = false;
        if (data.telegram!=null){
          if(data.telegram.startsWith("https://")){
            if(globalSocialLinksArray.includes(data.telegram)){
              tele = true;
            };
          };
        };
        if (data.website!=null){
          if(data.website.startsWith("https://")){
            if(globalSocialLinksArray.includes(data.website)){
              web = true;
            };
          };
        };
        if (data.twitter!=null){
          if(data.twitter.startsWith("https://")){
            if(globalSocialLinksArray.includes(data.twitter)){
              tw = true;
            };
          };
        };
        const ct = data.created_timestamp;
        const newToken: TokenData = {
          token_mint:key,
          creation_time :ct,
          twitter: tw,
          telegram: tele,
          website: web,
          trades: trades_data,
          above_threshold_mc:false,
          Marketcap_at_checkpoint: 0
        };
        const features: number[] = normalizeNewToken(extractFeatures2(newToken));//need to nomralised and use the saved std and mean
        //console.log(features)
        const input: tfjs.Tensor2D = tfjs.tensor2d([features],[1, features.length]);
        // Cast the prediction result as Tensor
        const prediction: tfjs.Tensor = model.predict(input) as tfjs.Tensor;
        // Wait for the prediction result array
        const predictionValue = prediction.dataSync()[0]; //could place it into a function
        const decision =  predictionValue >= 0.6 ? true : false; //decision made by the tensorflow model
        list_of_data_collected_for_tokens.push(newToken);
        //list_of_data_collected_for_tokens.push(newToken);
        const pass_devCheck = true; //this will buypass devs that have many tokens in their history 
        if (!danger && multiple_buys_from_same_wallet_count<=max_allowable_team_wallet_amount && !datacollectiononlymode && decision){ //!dev_sniped_wallets.some(item => blacklistedwallets.includes(item)) (adding the ai check in here)
            var mc = parseFloat(data.usd_market_cap.toFixed(2));//the startign mc
            var dev_addy = data.creator;//fetching the creator account
            let dev_pass = false;
            if((dev_tokens<=61000000 && mc>=4000 && mc<=14500) || (predictionValue>=0.95 && mc>=4000 && mc<=17500)){
                const [result1, result2]: [boolean, boolean] = await Promise.all([
                devCheck(dev_addy),
                fundingAccountConfirm(dev_addy)
              ]);
              //sniperWalletAnalysis(dev_sniped_wallets)  //removing thsi check for now
              if((result1 || pass_devCheck) && result2){
                dev_pass = true;
              };
            };
            if(dev_pass){
                if (tokens.length==0){
                    console.log(`${key} Dev Passed,holdings: ${(dev_tokens/10**6).toFixed(2)}M VOL:${volume.toFixed(2)} SOL`);
                    //check if the token already retraced hard
                    let athPrice = await calculateATHPrice(key);
                    var data_2 = await fetchCoinDataUsingProxy(key);
                    let currentPrice = data_2.market_cap/10**9;
                    let creation_time = data_2.created_timestamp/1000;
                    let timenow = Date.now()/1000;
                    console.log(`Current price: ${currentPrice}, ATH price : ${athPrice} Retracement: -${(100-((currentPrice/athPrice)*100)).toFixed(2)}%  Potential Upside: ${(AverageTopPrice/currentPrice).toFixed(2)}X Creation Time Elpased: ${(timenow-creation_time).toFixed(2)}s`);
                    if(currentPrice>=0.6*athPrice){
                      console.log(`performing Originiality checks....`);
                      let name = data.name.toString()
                      let ticker = data.symbol.toString();
                      let ticker_check = findEpochByTicker(ticker);
                      let name_check = findEpochByName(name);
                      const twentyFourHours = 3600*24;
                      let socials_check = true;
                      if (data.telegram!=null){
                        if(data.telegram.startsWith("https://")){
                            if(globalSocialLinksArray.includes(data.telegram)){
                              socials_check = false;
                            };
                        };
                      };
                      if (data.website!=null){
                        if(data.website.startsWith("https://")){
                          if(globalSocialLinksArray.includes(data.website)){
                            socials_check = false;
                          };
                        };
                      }
                      if (data.twitter!=null){
                        if(data.twitter.startsWith("https://")){
                          if(globalSocialLinksArray.includes(data.twitter)){
                            socials_check = false;
                          };
                        };
                      };
                      if(socials_check){
                          if(ticker_check == null && name_check == null){
                            console.log(`Originiality check positive.`);
                            if(!isRealTrading){
                              await new Promise(resolve => setTimeout(resolve, simulateDelay));
                            };
                            await addToken(key,currentPrice,mc,predictionValue);//not mc mc but price mc 
                          }else if(ticker_check!=null && name_check!=null){
                            if(timenow-ticker_check>twentyFourHours && timenow-name_check>twentyFourHours){
                                console.log(`Originiality check positive.`);
                                if(!isRealTrading){
                                  await new Promise(resolve => setTimeout(resolve, simulateDelay));
                                };
                                await addToken(key,currentPrice,mc,predictionValue);
                            }else{
                              console.log(`Originiality check Failed, Token rejected!`);
                            };
                          }else if(ticker_check!=null && name_check==null){
                            if(timenow-ticker_check>twentyFourHours){
                              console.log(`Originiality check positive. Ticker already exists but it was made over 24h ago.`);
                              if(!isRealTrading){
                                await new Promise(resolve => setTimeout(resolve, simulateDelay));
                              };
                              await addToken(key,currentPrice,mc,predictionValue);
                            }else{
                              console.log(`Originiality check Failed, Token rejected!`);
                            };
                          }else if(ticker_check==null && name_check!=null){
                            if(timenow-name_check>twentyFourHours){
                              console.log(`Originiality check positive. Name already exists but it was made over 24h ago.`);
                              if(!isRealTrading){
                                await new Promise(resolve => setTimeout(resolve, simulateDelay));
                              };
                              await addToken(key,currentPrice,mc,predictionValue);
                            }else{
                              console.log(`Originiality check Failed, Token rejected!`);
                            };
                          }else{
                            console.log(`Originiality check Failed, Token rejected!`);
                          };
                      }else{
                        console.log('Scam copy of social link detected!')
                      };
                    }else{
                      console.log('Token already retraced too much.');
                    };
                }else{
                    console.log(`skipping token: ${key} as there is already a token in the trade`);
                };
            }else{
                //console.log(`${key} invalid constraints, Mc: ${mc} BS: ${buy_sell_ratio.toFixed(2)} VPT: ${vpt} VOL: ${volume.toFixed(2)} SOL DEV: ${(dev_tokens/10**6).toFixed(2)}M ,Team Buys: ${multiple_buys_from_same_wallet_count}, DEV passed?: ${dev_pass}`);
            };
        };
        let epoch = Date.now()/1000;
        let name = data.name;
        let ticker = data.symbol;
        data_queue.push(['token_names.txt',`${data.name} ${epoch}\n`]);
        data_queue.push(['token_tickers.tx',`${data.symbol} ${epoch}\n`]);
        if(data.twitter!=null){
          data_queue.push(['social_links_dump.txt',`${data.twitter}\n`]);
          globalSocialLinksArray.push(data.twitter);
        };
        if(data.telegram!=null){
          data_queue.push(['social_links_dump.txt',`${data.telegram}\n`]);
          globalSocialLinksArray.push(data.telegram);
        };
        if(data.website!=null){
          data_queue.push(['social_links_dump.txt',`${data.website}\n`]);
          globalSocialLinksArray.push(data.website);
        };
        globalNameEpochArray.push({ name, epoch });
        globalTickerEpochArray.push({ticker,epoch});
        let check_delay2 = Date.now()/1000;
        if(predictionValue>=0.6){
          console.log(`${FgGreen}%s${Reset}`, `checked token: ${(check_delay2-check_delay1).toFixed(2)}s prediction value: ${predictionValue.toFixed(2)} ca: ${key} Quicklink: https://gmgn.ai/sol/token/${key}`);
        }else{
          console.log(`checked token: ${(check_delay2-check_delay1).toFixed(2)}s prediction value: ${predictionValue.toFixed(2)} ca: ${key}`);
        }
        //console.log(`checked token: ${(check_delay2-check_delay1).toFixed(2)}s prediction value: ${predictionValue.toFixed(2)} ca: ${key}`);
      }catch (error){
        if (error instanceof ReferenceError) {
          console.error("Caught an undefined reference:", error.message);
        } else {
            console.error("An unknown error occurred:", error);
        };
      };
    };
};

let data_queue:string[][] = [];

async function append_to_files(){ //this will fetch a list of lists and append the data to right file (should reduce the delay to process each token hopefully)
  while(true){
    if(data_queue.length>1){
      let item = data_queue.shift();
      if(item != undefined){
        let destination_file = item[0];
        let data_to_save = item[1];
        fs.appendFileSync(destination_file,data_to_save);
      };
    };
    await delay(100);
  };
};
  
const queue = new DelayedQueue(timefromcreation*1000, processKey);

//data collection of each token to hopefully find profitable inneficiencies


function readTokensFromFile(filePath: string): TokenData[] {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  };
  // If the file doesn't exist, return an empty array
  return [];
};

function saveTokensToFile(filePath: string, tokens: TokenData[]): void {
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
};

function appendNewTokenToFile(filePath: string, newToken: TokenData): void {
  // Read the existing tokens from the file
  //const existingTokens: TokenData[] = readTokensFromFile(filePath);

  // Add the new token to the array of existing tokens
  //existingTokens.push(newToken);

  // Save the updated tokens back to the file
  //saveTokensToFile(filePath, existingTokens);
  const newFile = 'collected_data.ndjson';
  appendNewTokenToJSONLines(newFile,newToken);
};

function appendNewTokenToJSONLines(filePath: string, newToken: TokenData): void {
  const jsonLine = JSON.stringify(newToken);
  fs.appendFileSync(filePath, jsonLine + '\n', 'utf8');
};

function readTokensFromJSONLines(filePath: string): TokenData[] {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim() !== '');
  return lines.map(line => JSON.parse(line));
};

const processTokenJSON = async(key: string) => {
   const data = await fetchCoinDataUsingProxy(key);
   const mc:number = data.usd_market_cap;
   let passed = false;
   if(mc>20000){
    passed = true;
   };
   //console.log(list_of_data_collected_for_tokens);
   let token_to_append_to_file  = list_of_data_collected_for_tokens.find(t => t.token_mint === key);
   //console.log(token_to_append_to_file);
   if(token_to_append_to_file == undefined){
      console.log('error when processing token for JSON');
   }else{
    token_to_append_to_file.Marketcap_at_checkpoint = mc;
    token_to_append_to_file.above_threshold_mc = passed;
    let epoch = Date.now()/1000;
    console.log(`added a new token to the json file , time taken ${(epoch - data.created_timestamp/1000).toFixed(2)}s`);
    appendNewTokenToFile('collected_data.json', token_to_append_to_file);
   };
};

//maybe have a queue for 3 min , 5 min ( maybe above 35k) and 10 min to recheck the tokens (above bonded?) (so we will have 4 models)

//also we can have a meta model that doesnt care about price but how the token is seup so socials , comments?,fudning? idk

const fetchTradesByMintProxy = async (mint: string, limit: number = 20, offset: number = 0): Promise<Trade[]> => { //ideally use different proxy 
  const apiUrl = `https://frontend-api.pump.fun/trades/all/${mint}?limit=${limit}&offset=${offset}&minimumSize=0`;
  try {
      // Get a random proxy from the pool
      const { host, port, username, password } = getRandomProxy2();
      // Create a proxy agent with the selected proxy
      const proxyAgent = new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);
      try {
            const response = await axios.get(apiUrl, {
              httpsAgent: proxyAgent,
            });
            return response.data; // Assuming response data contains the CoinData
      } catch (error) {
        throw new Error(`Error fetching data`);
      }
  } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
  };
};


const processTokenATHPriceJSON = async(key: string) => {
  //check ath + check if it bonded
  //save this in another file (token ca,ath pice,bonded?(boolean)
  const offsetConstant = 200;
  let offset = 0;
  let highestPrice = 0;
  let epochofHighestPrice = 0;
  while(true){
      var trades_data = await fetchTradesByMintProxy(key,200,offset); // needs to be also a proxy as it will timeout
      if(trades_data.length==0){
        break;
      }
      for (const trade of trades_data){ 
          let trade_price = 1/((trade.token_amount/10**6)/(trade.sol_amount/10**9));
          if(trade_price>highestPrice){
            highestPrice = trade_price;
            epochofHighestPrice = trade.timestamp;
          };
      };
      offset+=offsetConstant;//increment by 200
      await new Promise(resolve => setTimeout(resolve, 50)); //small delay 
  };
  fs.appendFileSync('ATHPrices.txt', `${key},${highestPrice},${epochofHighestPrice}\n`);
  console.log('added Ath info for: ',key);
};


const CollectPriceQueue = new DelayedQueue((60*3)*1000, processTokenJSON); //it will check the price of the token after 3 minutes and set a boolean value if its above certain market cap lets say 25k (if bonded then it will also be set to true)
const CollectAthQueue = new DelayedQueue((60*30)*1000, processTokenATHPriceJSON); //collects the ath price (also if it bonded within 30 mintutes)
// Store seen mints in a Set for quick lookup
const seenMints = new Set<string>();
  
// Function to fetch the data from the API
async function fetchCoins(): Promise<Coin[]> { //gotta use proxy here too now 
    const apiUrl = 'https://frontend-api.pump.fun/coins?offset=0&limit=5&sort=created_timestamp&order=DESC&includeNsfw=true';

    // Get a random proxy from the pool
    const { host, port, username, password } = getRandomProxy2();

    // Create a proxy agent with the selected proxy
    const proxyAgent = new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);

    try {
        const response = await axios.get(apiUrl, {
          httpsAgent: proxyAgent,
        });

        const data: Coin[] = await response.data; // Parse the JSON response into an array of Coins

        // Filter out coins that have already been seen based on the mint key
        const unseenCoins = data.filter(coin => {
        if (!seenMints.has(coin.mint)) {
            seenMints.add(coin.mint);  // Add new mint to the Set
            return true;               // Keep unseen coins
        }
        return false;                // Filter out seen coins
        });

        return unseenCoins;  // Return only unseen coins
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return [];
    };
};
  
  // Function to loop and check for unseen coins every second
async function startCoinChecker() {
await fetchCoins();//to ingore the initial list(add them to seen coins)
var id = setInterval(async () => {
    if (shutDownBot==true){
        clearInterval(id!);
    };
    //console.log('checking...')
    if(tokens.length==0){//otherwise we will try to not overload the api calls as the trade is whats most important
      const unseenCoins = await fetchCoins();
      if (unseenCoins.length > 0) {
          //console.log('New unseen coins:', unseenCoins);  // Logs only unseen coins
          for(const token of unseenCoins){
              var mint = token.mint
              //here we place the token on a expirinng ququ and when it expired we get its transactions and then we calcaulate the trnsactions per given time frame
              var timenow = Date.now();
              if(timenow-token.created_timestamp<3000){//if we get the token under 2.5s we analyse it otherwise too late
                queue.enqueue(mint.toString());
                CollectPriceQueue.enqueue(mint.toString());//this one will expire later and we then check the tokens marketcap at expiry
                //CollectAthQueue.enqueue(mint.toString()); //(will add but need more proxies to use this imho)
              };
              //queue.enqueue(mint.toString());
              //console.log(timenow-token.created_timestamp)
          };
      };
    };
},2750);  
};

//make a simple refresh balance function that will sync up the solana wallet balance every 5 min
async function syncRealTradingBlance(){
  while(true){
    startingsol = parseFloat(((await connection.getBalance(myWalletpublicKey))/LAMPORTS_PER_SOL).toFixed(5));
    await delay(600000);
    console.log(`synced real wallet balance to: ${startingsol} SOL`);
  };
}

function readFileToGlobalArray(filePath: string): void {
  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Populate the global array
  globalNameEpochArray = fileContent.split('\n')
      .map(line => line.trim()) // Remove extra whitespace
      .filter(line => line.length > 0) // Ignore empty lines
      .map(line => {
          // Find the last space in the line, which separates the name and epoch
          const lastSpaceIndex = line.lastIndexOf(' ');
          
          // Everything before the last space is the name
          const name = line.substring(0, lastSpaceIndex).trim();
          
          // The part after the last space is the epoch value
          const epochString = line.substring(lastSpaceIndex + 1);
          const epoch = parseInt(epochString, 10); // Convert epoch to a number
          
          return { name, epoch }; // Return an object for each line
      });
};

function readFileToGlobalArray2(filePath: string): void {
  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Populate the global array
  globalTickerEpochArray = fileContent.split('\n')
      .map(line => line.trim()) // Remove extra whitespace
      .filter(line => line.length > 0) // Ignore empty lines
      .map(line => {
          // Find the last space in the line, which separates the name and epoch
          const lastSpaceIndex = line.lastIndexOf(' ');
          
          // Everything before the last space is the name
          const ticker = line.substring(0, lastSpaceIndex).trim();
          
          // The part after the last space is the epoch value
          const epochString = line.substring(lastSpaceIndex + 1);
          const epoch = parseInt(epochString, 10); // Convert epoch to a number
          
          return { ticker, epoch }; // Return an object for each line
      });
};

function readFileToGlobalArray3(filePath: string): void {
  // Read the file asynchronously
  const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Update the global array with the split lines
  globalSocialLinksArray = fileContent.split('\n');

}

function readFileToGlobalArray4(filePath: string): void {
  // Read the file asynchronously
  const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Update the global array with the split lines
  blacklistedwallets = fileContent.split('\n');

}

function readTokensFromNDJSON(filePath: string): TokenData[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => JSON.parse(line));
}

interface TokenATHData {
  tokenAddress: string;
  price: number;
  epochTime: number;
}

function readATHPriceFile(filePath:string) : TokenATHData[] {
  // Read the file contents as a single string
  const fileContents = fs.readFileSync(filePath, 'utf-8');
    
  // Split the contents into lines
  const lines = fileContents.trim().split('\n');

  // Map each line to the TokenData interface
  const tokenDataList: TokenATHData[] = lines.map(line => {
      const [tokenAddress, price, epochTime] = line.split(',');

      // Parse the price and epochTime to the correct types
      return {
          tokenAddress: tokenAddress.trim(),
          price: parseFloat(price),
          epochTime: parseInt(epochTime, 10)
      };
  });

  return tokenDataList;
}

async function approxAVGrecentATH(){
  //will have a 2hour moving window to approximate the avergae ath to help predict tops (exiting at better price thean a stop loss price)
  // read recent two hours of tokens and check the tokens that met the blloean check then check theri ath price 
  //average them 
  //recalculate every 2h as market changes
  const twoHoursSeconds = 60*60*24;
  const tokens = readTokensFromNDJSON('collected_data.ndjson');
  const AthPriceList:TokenATHData[] = readATHPriceFile('ATHPrices.txt');
  let timestamp_now = Date.now()/1000;
  const tokens_under_2h_old = tokens.filter(token=>token.creation_time/1000>=timestamp_now-twoHoursSeconds);
  const tokens_under_2h_old_that_passed = tokens_under_2h_old.filter(token=>token.above_threshold_mc==true);
  const tokenAddressSet = new Set(AthPriceList.map(item => item.tokenAddress));
  const filteredList2 = tokens_under_2h_old_that_passed.filter(item => tokenAddressSet.has(item.token_mint));
  const filteredList1 = AthPriceList.filter(item => filteredList2.some(otherItem => otherItem.token_mint === item.tokenAddress));
  console.log(`Average top Price calculated from: ${filteredList1.length} tokens`);
  return calculateAveragePrice(filteredList1);
};

function calculateAveragePrice(filteredList1: TokenATHData[]): number {
  if (filteredList1.length === 0) {
      return 0; // Avoid division by zero if the list is empty
  }
  // Sum the prices of the filtered tokens
  const totalPrice = filteredList1.reduce((sum, item) => sum + item.price, 0);
  // Calculate the average price
  return totalPrice / filteredList1.length;
}
  

async function main(){
    if(isRealTrading){
      console.log('Real trading is enabled!');
    }else{
      console.log('Real trading is disabled!');
    };
    if(datacollectiononlymode){
      console.log(`data collection mode enabled!`)
    }
    if(!isRealTrading){
      startingsol = 2;//used for simulating wallet amounts
      console.log(`Virtual wallet balance: ${startingsol} SOL`);
    }else{
      startingsol = parseFloat(((await connection.getBalance(myWalletpublicKey))/LAMPORTS_PER_SOL).toFixed(5));
      starting_bal = starting_bal;
      console.log(`Trading wallet balance: ${startingsol} SOL`);
    };
    console.log('Reading past name & ticker database');
    readFileToGlobalArray('token_names.txt');
    readFileToGlobalArray2('token_tickers.txt');
    readFileToGlobalArray3('social_links_dump.txt');
    loadNormalizationStats(); //mean and std for the normalissed data
    //readFileToGlobalArray4('blacklisted.txt');
    console.log(`Read past names and tickers successfully: (${globalNameEpochArray.length}) names & tickers`);
    AverageTopPrice = await approxAVGrecentATH();
    console.log(`Estimated Average top price: ${AverageTopPrice}`);
    //const proxyManager = new ProxyManager('alphaSniper/proxy_list.txt', 'https://frontend-api.pump.fun/coins?offset=0&limit=5&sort=created_timestamp&order=DESC&includeNsfw=true');
    //await proxyManager.loadAndTestProxies();
    await loadModel();//for ai 
    if(isRealTrading){
      await Promise.all([startCoinChecker(),trackTokens(),append_to_files()]);//with real balance syncing ,syncRealTradingBlance() (DEPRACATED AS it will update every time it closes trade)
    }else{
      await Promise.all([startCoinChecker(),trackTokens(),append_to_files()]);
    };
    //await Promise.all([startCoinChecker(),trackTokens(),syncRealTradingBlance()]);
};

main().catch(console.error);

interface Asset {
    address: string;
    mint: string;
    balance: number;
    image_uri: string;
    symbol: string;
    name: string;
    market_cap: number;
    value: number;
};


async function buy_token(token:string): Promise<boolean>{
    //var walletBalance = (await connection.getBalance(myWalletpublicKey)/10**9);
    var amount = parseFloat((startingsol*portAllocationPercent).toFixed(5));
    if(amount>.25){
      amount = .25;//keeping .25 limit for now when it makes profit we can raise it for fun
    };
    var result = await pumpFunBuy(payerPrivateKey, token, amount, priorityFeeInSol, slippageDecimal);
    if(result){return true};
    return false;
};

async function sell_token(token:string,percentageToSell:number = 100): Promise<boolean>{ //returns true if the token was sold 3 or under 3 retrys othersie returns false which shiuts down the bot so more problems dont happen
    //buy the token and check if its bought with the other fucntion to fetch users token holdings
    var maxRetrys = 3;
    var retryCount = 0;
    //const percentageToSell = 100;
    while(true){
        if(retryCount>maxRetrys){
            break;
        };
        var result = await pumpFunSell(payerPrivateKey, token, percentageToSell, priorityFeeInSol, slippageDecimal);
        if(result){
            return true;
        };
        retryCount++;
    };
    return false;
};


//there is a disparity between true entry and virtual entry and also exit so improve that plea
//also maybe add rejected token to file to evaluate wha good tokens we are discarding to refine the bot algortihm
//i dont want the dev to keep buying if he is then reject (NEW CONSTRAINT!)
//selling in two pieces so for now 50% then 100% so it will be like 50% of tekns on tp 1 and 50% on tp2
//prehaps tp1 will be 50% gain? then tp2 is any where else where the sell is triggered (if its tiggered before tp1 then sell 100% at once)
//add a name chacker, if it already exists then do not enter
//to by synced up with real balance check it after closing each trade ( for real trading) cuz slippage and fees

//expand the model to predict if the tokens with be above certain mc after 3m , 5m ,10m ect bond? ect...
//u can also use the mc measured to predicts for toher thresholds after the existiing 3m sampling you are doing.

//I want to add another model to make another prediction for with prehaphs different feature exctraction method and then do a weighted sum as the final probability

//use th ath price data to trainanhtier model to esitmaite the ath price when enterine a token 
//sell wthin 30% of ATH prediction.

//maybe use the chained predictions to predic price momement? (future upgrade)
//maybe data too rougth to do so?

