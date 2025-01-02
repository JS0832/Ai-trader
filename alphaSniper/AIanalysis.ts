//version 1 using ternsoflow approach to possibly detect the right tokens
import * as tfjs from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';



const targetThreshold = 35000;
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

function readTokensFromNDJSON(filePath: string): TokenData[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => JSON.parse(line));
}

function readTokensFromFile(filePath: string): TokenData[] {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    };
    // If the file doesn't exist, return an empty array
    return [];
  };

function normalizeData2(data: number[][]): number[][] { //original method
return data.map(row => {
    const mean = tfjs.mean(row);
    const std = tfjs.moments(row).variance.sqrt();
    return row.map(val => (val - mean.dataSync()[0]) / std.dataSync()[0]);
});
}

function normalizeData0(data: number[][]): number[][] { //improved normalisation strategy to normalise all tokens in the same way to ensure consistency
  const flatData = data.flat();
  const mean = tfjs.mean(flatData);
  const std = tfjs.moments(flatData).variance.sqrt();
  return data.map(row => row.map(val => (val - mean.dataSync()[0]) / std.dataSync()[0]));
}

// Function to normalize training data and save mean/std to a file
function normalizeData(data: number[][]){ //new normilazation with saving the mean and std 
  const flatData = data.flat();
  const tensor = tfjs.tensor1d(flatData);
  const { mean, variance } = tfjs.moments(tensor);
  const std = variance.sqrt();

  const meanValue = mean.dataSync()[0];
  const stdValue = std.dataSync()[0];

  // Normalize the data using the computed mean and std
  const normalizedData = data.map(row => row.map(val => (val - meanValue) / stdValue));

  // Save the mean and std to a file for future use
  const stats = { mean: meanValue, std: stdValue };
  const statsFilePath = path.join(__dirname, 'normalization_stats.json');
  fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2)); // Save as a formatted JSON file

  console.log(`Mean and Std saved to ${statsFilePath}`);

  return normalizedData;
}


function extractFeatures(token: TokenData) {
    // We will create a feature array where:
    // - Buys are represented as positive `sol_amount`
    // - Sells are represented as negative `sol_amount`
  
    const tradeAmounts: number[] = [];
    const uniqueUsers: Set<string> = new Set();
  
    token.trades.forEach(trade => {
      // Add buy and sell amounts to tradeAmounts

        const tradeAmount = trade.is_buy ? trade.sol_amount : -trade.sol_amount;
        tradeAmounts.push(tradeAmount);

  
      // Add the user to the set, but only if it's not null
      if (trade.user) {
        uniqueUsers.add(trade.user);
      }
    });

    const cappedTradeAmounts = tradeAmounts.slice(0, 100);
    // Pad with 0s if fewer than 200 elements
    while (cappedTradeAmounts.length < 100) {
      cappedTradeAmounts.push(0);
    }

    //here i will apppd out the data with blanks or 0
    //if(tradeAmounts.length<150){
    //    while(tradeAmounts.length<150){
    //      tradeAmounts.push(0);
    //    }
    //};

    // Convert the set of unique users into an array
    const userFeatures = Array.from(uniqueUsers).map(() => 1); // You can represent each user with a 1
  
    // Social media presence as features
    const socialFeatures = [
      token.twitter ? 1 : 0,  // Whether Twitter is present
      token.telegram ? 1 : 0, // Whether Telegram is present
      token.website ? 1 : 0   // Whether Website is present
    ];
  
    // Combine all features: social features, trade amounts, and user presence
    const features = [...cappedTradeAmounts];//removed user features for now
  
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


// Step 2: Build the neural network model
function createModel() {
    const model = tfjs.sequential();
    // Input layer
    model.add(tfjs.layers.dense({ inputShape: [400], units: 128, activation: 'relu',kernelRegularizer: tfjs.regularizers.l2({ l2: 0.0001 })}));
    // Additional hidden layers
    model.add(tfjs.layers.dense({ units: 64, activation: 'relu',kernelRegularizer: tfjs.regularizers.l2({ l2: 0.0001 }) }));
    model.add(tfjs.layers.dropout({ rate: 0.4 }));
    
    model.add(tfjs.layers.dense({ units: 32, activation: 'relu',kernelRegularizer: tfjs.regularizers.l2({ l2: 0.0001 }) }));
    model.add(tfjs.layers.dropout({ rate: 0.3 }));
    model.add(tfjs.layers.dense({ units: 1, activation: 'sigmoid' })); 

    // Compile the model with optimizer and loss function
    model.compile({
      optimizer: tfjs.train.adam(0.0001),  // Adam optimizer
      loss: 'binaryCrossentropy',  // For binary classification
      metrics: ['accuracy']
    });
  
    return model;
  };

  function calculateClassWeights(labels: number[]): { [key: number]: number } {
    const total: number = labels.length;
    const pos: number = labels.filter(l => l === 1).length; // Above threshold (minority class)
    const neg: number = total - pos; // Below threshold (majority class)
  
    // We assign a higher weight to the minority class (pos) and lower weight to the majority class (neg)
    const weightForClass0: number = (1 / neg) * (total / 2.0); // Below threshold
    const weightForClass1: number = (1 / pos) * (total / 2.0); // Above threshold
  
    return {
      0: weightForClass0,
      1: weightForClass1
    };
  }

  function oversampleMinorityClass(features: number[][], labels: number[]): { features: number[][], labels: number[] } { //since minority is small i will add more to balance it out with the majority
    const posSamples: number[][] = [];
    const posLabels: number[] = [];
  
    // Collect all positive (class 1) samples
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === 1) {
        posSamples.push(features[i]);
        posLabels.push(labels[i]);
      }
    }
  
    // Oversample positive samples until the minority class reaches the majority size
    while (posSamples.length < labels.filter(l => l === 0).length) {
      const randomIndex = Math.floor(Math.random() * posSamples.length);
      posSamples.push(posSamples[randomIndex]);  // Randomly duplicate positive samples
      posLabels.push(1);  // Keep the label as 1
    }
  
    // Return a balanced dataset (original + oversampled)
    return { 
      features: [...features, ...posSamples], 
      labels: [...labels, ...posLabels] 
    };
  }
  

// Step 3: Train the neural network
async function trainModel(model:tfjs.Sequential, trainingData:number[][], labels:number[]) {
    const normalizedTrainingData = normalizeData(trainingData);
    const xs = tfjs.tensor2d(normalizedTrainingData);
    const ys = tfjs.tensor2d(labels, [labels.length, 1]);

    const classWeights = calculateClassWeights(labels);
  
    return await model.fit(xs, ys, {
      epochs: 50,               // Adjust epochs based on performance
      batchSize: 32,             // Batch size
      validationSplit: 0.2,      // Reserve some data for validation
      classWeight: classWeights, // Apply class weights,
      callbacks: tfjs.callbacks.earlyStopping({ monitor: 'val_loss', patience: 4 })  // Early stopping
      //callbacks:tfjs.callbacks.earlyStopping({ monitor: 'val_accuracy', patience: 7 }) //val accuracy and longer patience 

    });
}
let meanGlobal = 0;
let stdGlobal = 0;
function loadNormalizationStats(){
  const statsFilePath = path.join(__dirname, 'normalization_stats.json');
  
  if (!fs.existsSync(statsFilePath)) {
      throw new Error(`Normalization stats file not found at ${statsFilePath}`);
  };

  const fileContent = fs.readFileSync(statsFilePath, 'utf-8');
  const { mean, std } = JSON.parse(fileContent);

  console.log(`Loaded mean: ${mean}, std: ${std}`);
  meanGlobal = mean;
  stdGlobal = std;
}

function normalizeNewToken(data: number[]): number[] {
  return data.map(val => (val - meanGlobal) / stdGlobal);
}
  
async function predictNewToken(
  model: tfjs.Sequential, 
  newToken: TokenData
): Promise<number> {
  const features: number[] = normalizeNewToken(extractFeatures2(newToken));//need to nomralised and use the saved std and mean
  const input: tfjs.Tensor2D = tfjs.tensor2d([features]);

  // Cast the prediction result as Tensor
  const prediction: tfjs.Tensor = model.predict(input) as tfjs.Tensor;

  // Wait for the prediction result array
  const predictionValue = prediction.dataSync();
  //console.log(predictionValue)
  // Return 1 if the prediction is >= 0.5, otherwise return 0
  return predictionValue[0] >= 0.5 ? 1 : 0;
}
  
async function main(){//now it will only read tokens younger than one week old 

  // Example: Read tokens from file, extract features, train model, and make predictions
  const tokens = readTokensFromNDJSON('collected_data.ndjson');
  let timestamp_now = Date.now()/1000;
  const one_week_seconds = 60*60*24*7;
  const tokens_under_one_week_old = tokens.filter(token=>token.creation_time/1000>timestamp_now-one_week_seconds);
  const features = tokens_under_one_week_old.map(extractFeatures2);
  const labels = tokens_under_one_week_old.map(token => token.Marketcap_at_checkpoint>=targetThreshold ? 1 : 0);
  
  // Create and train model
  const model = createModel();
  const { features: balancedFeatures, labels: balancedLabels } = oversampleMinorityClass(features, labels);
  await trainModel(model, balancedFeatures, balancedLabels);
  //await trainModel(model, features, labels); (this one doesnt use oversampling technique)
  let correct = 0;
  let incorrect = 0;
  let total_passing = 0;

  const saveDir = path.resolve(__dirname, 'token_prediction_pump');
  // Ensure the directory exists
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }
  // Save the model to the local file system
  const savePath = `file://${saveDir.replace(/\\/g, '/')}`;

  try {
    await model.save(savePath);
    console.log(`Model saved successfully at ${savePath}`);
  } catch (error) {
    console.error('Error saving model:', error);
  }
  loadNormalizationStats();
  for (const token of tokens) {
    const prediction = await predictNewToken(model, token);
    //console.log(`Prediction: ${prediction === 1 ? "Above Threshold" : "Below Threshold"} ${token.token_mint}`);
    if(prediction===1&&token.above_threshold_mc){
          //console.log(`Prediction: ${prediction === 1 ? "Above Threshold" : "Below Threshold"} ${token.token_mint}`);
          correct+=1;
    }else if(prediction===1 && !token.above_threshold_mc){
        //console.log(`Prediction: ${prediction === 1 ? "Above Threshold" : "Below Threshold"} ${token.token_mint}`);
        incorrect+=1;
    };
    if(token.above_threshold_mc){
        total_passing+=1
    };
  }
  console.log(`total tokens above threshold:`,total_passing)
  console.log(`percentage guessed right:`,(correct*100/total_passing).toFixed(1));
  console.log(correct,incorrect)
  console.log(`total tokens: ${tokens.length}`);

};

main().catch(console.error);



