export class SniperWalletManager {
    private wallets: { [address: string]: { initialTokens: number, currentTokens: number } };

    constructor() {
        this.wallets = {};
    };

    // add the wallets that sniped the token initially to track their balances
    addWallet(address: string, initialTokens: number): void {
        if (this.wallets[address]) {
            console.log(`Wallet ${address} already exists.`);
            console.log(this.wallets)
        } else {
            this.wallets[address] = {
                initialTokens: initialTokens,
                currentTokens: initialTokens
            };
        };
    };

    updateTokens(address: string, amountSold: number): void {
        if (this.wallets[address]) {
            this.wallets[address].currentTokens -= amountSold;
            if(this.wallets[address].currentTokens<0){//handle any floating point issues
                this.wallets[address].currentTokens = 0;
            };
            //console.log(`Updated: ${address} to: ${this.wallets[address].currentTokens}`);
        }; //if not in the present wallets then ignore it
    };

    // Function to get the status of all wallets
    getAllWalletStatuses(): number {
        let initial_tokens = 0;
        let current_tokens = 0;
        for (const address in this.wallets) { //cheap operation
            initial_tokens += this.wallets[address].initialTokens;
            current_tokens +=this.wallets[address].currentTokens;
        };
        return (current_tokens/initial_tokens)*100;//returns pecentage left
    };
};
