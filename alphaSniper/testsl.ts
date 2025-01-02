type RiskParams = {
    confidence: number;  // BCE confidence level (0.6 to 1.0)
    defaultStopLoss: number;  // Default stop loss in decimal (e.g., 0.20 for 20%)
    defaultTrailingStopLoss: number;  // Default trailing stop loss in decimal (e.g., 0.25 for 25%)
    riskAdjustedStopLoss: number;  // Minimum stop loss in decimal (e.g., 0.15 for 15%)
    riskAdjustedTrailingStopLoss: number;  // Minimum trailing stop loss in decimal (e.g., 0.20 for 20%)
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
  

  const params: RiskParams = {
    confidence: 0.6,  // BCE confidence level
    defaultStopLoss: 0.35,  // Default stop loss 20% (as decimal 0.20)
    defaultTrailingStopLoss: 0.30,  // Default trailing stop loss 25% (as decimal 0.25)
    riskAdjustedStopLoss: 0.20,  // Minimum stop loss 15% (as decimal 0.15)
    riskAdjustedTrailingStopLoss: 0.15  // Minimum trailing stop loss 20% (as decimal 0.20)
  };
  import * as fs from 'fs';
  //const result = loosenStopLossAndRisk(params);
  //console.log(result);  // { stopLoss: 0.185, trailingStopLoss: 0.223, positionRisk: 0.074 }
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

function epochToTimeOfDay(epoch: number): number {
  const date = new Date(epoch);

  // Get the hours, minutes, and seconds
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Determine AM/PM and adjust hours
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format, making "0" as "12"

  // Get day of the week and adjust to make Monday = 1, Sunday = 7
  const dayOfWeek = (date.getDay() + 6) % 7 + 1;

  // Return the formatted time with day of the week
  return dayOfWeek;
}

function mostCommonValue(list: number[]): number | null {
  if (list.length === 0) return null; // Return null for an empty list

  const frequencyMap: { [key: number]: number } = {};
  let maxFrequency = 0;
  let mostCommon: number | null = null;

  for (const item of list) {
      frequencyMap[item] = (frequencyMap[item] || 0) + 1;

      // Update most common item if this item's frequency is the highest we've seen
      if (frequencyMap[item] > maxFrequency) {
          maxFrequency = frequencyMap[item];
          mostCommon = item;
      }
  }

  return mostCommon;
}

function createHourHistogram(hours: number[]): void {
  // Initialize an array of 24 elements for each hour from 0 to 23
  const hourFrequency = new Array(24).fill(0);

  // Count each occurrence of an hour in the list
  hours.forEach(hour => {
      if (hour >= 0 && hour <= 23) { // Ensure the hour is valid
          hourFrequency[hour]++;
      }
  });

  // Display the histogram in the console
  console.log("Hour of the Day Histogram:");
  hourFrequency.forEach((count, hour) => {
      const bar = '#'.repeat(count); // Create a bar with `#` symbols
      console.log(`${hour.toString().padStart(2, '0')}:00 | ${bar} (${count})`);
  });
}

  async function main(){//now it will only read tokens younger than one week old 

    // Example: Read tokens from file, extract features, train model, and make predictions
    const tokens = readTokensFromNDJSON('collected_data.ndjson');
    let timesArray:number[] = []
    for (const token of tokens) {
        if(token.above_threshold_mc){
          timesArray.push(epochToTimeOfDay(token.creation_time*1000));
        }
    }
    console.log(mostCommonValue(timesArray));
    createHourHistogram(timesArray);

  }


  
  main().catch(console.error);
  