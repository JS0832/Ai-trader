class MarketCapTracker {
    private lastMarketCap: number | null;
    private lastEpoch: number | null;

    constructor() {
        this.lastMarketCap = null;
        this.lastEpoch = null;
    }

    submit(marketCap: number, epochTime: number): boolean {
        if (this.lastMarketCap === null && this.lastEpoch === null) {
            this.lastMarketCap = marketCap;
            this.lastEpoch = epochTime;
            return false;
        }

        const timeDifference = epochTime - (this.lastEpoch as number);

        if (marketCap > (this.lastMarketCap as number)) {
            console.log(`updated mc to :${marketCap}`)
            this.lastMarketCap = marketCap;
            this.lastEpoch = epochTime;
            return false;
        }

        if (timeDifference > 20) {
            return true; // Exit condition
        }

        return false; // Continue holding
    }
};

// Instantiate the tracker
const tracker = new MarketCapTracker();

// Simulate polling for market cap every 1.5 seconds
const pollingInterval = 1500;  // 1.5 seconds

const mockMarketCapData = [1000, 1000, 1000, 1000, 1000, 1200]; // Simulating market cap data
let currentIndex = 0;

// Polling loop
const pollingLoop = setInterval(() => {
    const currentEpochTime = Math.floor(Date.now() / 1000);
    const currentMarketCap = mockMarketCapData[currentIndex];

    // Call the MarketCapTracker submit method
    const shouldExit = tracker.submit(currentMarketCap, currentEpochTime);

    // Output the result of whether we should exit the trade or not
    console.log(`Market Cap: ${currentMarketCap}, Epoch: ${currentEpochTime}, Exit: ${shouldExit}`);

    // If exit condition is met, stop the polling loop
    if (shouldExit) {
        console.log("Exiting trade!");
        clearInterval(pollingLoop);  // Stop the loop
    }

    // Simulate moving to the next market cap value
    currentIndex = (currentIndex + 1) % mockMarketCapData.length;

}, pollingInterval);