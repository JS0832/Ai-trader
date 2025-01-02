import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs';
import readline from 'readline';
import https from 'https';
export class ProxyManager {
  private workingProxies: string[] = [];
  private rejectedProxies: string[] = [];

  constructor(private filePath: string, private testUrl: string) {}

  private async loadProxiesFromFile(): Promise<string[]> {
    const proxies: string[] = [];

    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) proxies.push(line.trim());
    }

    return proxies;
  }

  private async testProxy(proxy: string): Promise<boolean> {
    const [host, port] = proxy.split(':');
    const config: AxiosRequestConfig = {
        httpsAgent: new https.Agent({
            minVersion: 'TLSv1.2', // Ensure compatibility with modern servers
          }),
      proxy: {
        host,
        port: parseInt(port),
      },
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };

    try {
      await axios.get(this.testUrl, config);
      return true;
    } catch (error) {
        console.log(error)
      return false;
    }
  }

  public async loadAndTestProxies() {
    const proxies = await this.loadProxiesFromFile();

    for (const proxy of proxies) {
      const isWorking = await this.testProxy(proxy);
      if (isWorking) {
        this.workingProxies.push(proxy);
        console.log(`Proxy passed: ${proxy}`);
      } else {
        this.rejectedProxies.push(proxy);
        console.log(`Proxy failed: ${proxy}`);
      }
    }

    console.log('\nSummary:');
    console.log('Working Proxies:', this.workingProxies);
    console.log('Rejected Proxies:', this.rejectedProxies);
  }

  public getWorkingProxies(): string[] {
    return this.workingProxies;
  }

  public getRejectedProxies(): string[] {
    return this.rejectedProxies;
  }
}




async function main() {
    const proxyManager = new ProxyManager('alphaSniper/proxy_list.txt', 'https://www.google.com/');
    await proxyManager.loadAndTestProxies();
  
    // Access the working proxies
    const workingProxies = proxyManager.getWorkingProxies();
    console.log('Accessible Working Proxies:', workingProxies);
  }
  
  main();