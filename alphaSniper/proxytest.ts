import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';

class ProxyTester {
  private proxies: { host: string; port: number }[] = [];
  private workingProxies: { host: string; port: number }[] = [];
  private testUrl: string;

  constructor(proxies: { host: string; port: number }[], testUrl: string) {
    this.proxies = proxies;
    this.testUrl = testUrl;
  }

  private async testProxy(proxy: { host: string; port: number }): Promise<boolean> {
    const config: AxiosRequestConfig = {
      httpsAgent: new https.Agent({
        minVersion: 'TLSv1.2', // Force at least TLSv1.2
        rejectUnauthorized: false, // For testing; remove in production
      }),
      proxy: {
        host: proxy.host,
        port: proxy.port,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
      timeout: 5000, // Set a reasonable timeout
    };

    try {
      const response = await axios.get(this.testUrl, config);
      console.log(`Proxy ${proxy.host}:${proxy.port} passed:`, response.status);
      return true; // Proxy works
    } catch (error) {
      console.error(`Proxy ${proxy.host}:${proxy.port} failed:`,error);
      return false; // Proxy failed
    }
  }

  public async testAllProxies(): Promise<void> {
    const testResults = await Promise.all(
      this.proxies.map(async (proxy) => ({
        proxy,
        isWorking: await this.testProxy(proxy),
      }))
    );

    this.workingProxies = testResults.filter(result => result.isWorking).map(result => result.proxy);
    console.log('Working Proxies:', this.workingProxies);
  }

  public getWorkingProxies(): { host: string; port: number }[] {
    return this.workingProxies;
  }
}

// Example Usage:
const proxies = [
  { host: '18.132.206.90', port: 8001 }, // Example proxy
  { host: '134.209.29.120', port: 8080 }, // Replace with actual proxies
];

const tester = new ProxyTester(proxies, 'http://httpbin.org/ip'); // Test against Google
tester.testAllProxies().then(() => {
  const workingProxies = tester.getWorkingProxies();
  console.log('Final list of working proxies:', workingProxies);
});
