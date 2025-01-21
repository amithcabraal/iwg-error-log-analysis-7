export interface ErrorLog {
  '@timestamp': string;
  bluescreen: {
    error: string;
    gameName: string;
    gameid: string;
    type: string;
    'silent error'?: boolean;
    ua?: {
      brands: Array<{
        brand: string;
        version: string;
      }>;
      mobile: boolean;
      platform: string;
      platformVersion: string;
    };
    sessionInfo?: {
      errorTime: {
        day: number;
        month: number;
        year: number;
        hour: number;
        min: number;
        sec: number;
      };
    };
  };
}

export interface ChartData {
  timestamp: string;
  count: number;
  gameName: string;
}

export interface BrowserData {
  browser: string;
  count: number;
}

export interface PlatformData {
  platform: string;
  count: number;
}