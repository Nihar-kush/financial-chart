import axios from "axios";

export type CandlestickData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetching BTC_USD data from Binance API
export const fetchBinanceCryptoData = async (
  symbol: string = "BTCUSDT",
  interval: string = "1m"
): Promise<CandlestickData[]> => {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const formattedData: CandlestickData[] = data.map((item: any) => ({
      time: item[0] / 1000,
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching data from Binance", error);
    return [];
  }
};
