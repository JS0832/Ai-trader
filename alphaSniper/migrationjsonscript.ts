//will use to mirgate old format to new format for better efficicnecy 
import * as fs from 'fs'
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

  const oldFile = 'collected_data.json';
  const newFile = 'collected_data.ndjson';


  function readTokensFromFile(filePath: string): TokenData[] {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    };
    // If the file doesn't exist, return an empty array
    return [];
  };
  

  function appendNewTokenToJSONLines(filePath: string, newToken: TokenData): void {
    const jsonLine = JSON.stringify(newToken);
    fs.appendFileSync(filePath, jsonLine + '\n', 'utf8');
  };

  function process(): void {
    // Read the existing tokens from the file
    const existingTokens: TokenData[] = readTokensFromFile(oldFile);
    for(const token of existingTokens){
        appendNewTokenToJSONLines(newFile,token);
    };  
};


process();