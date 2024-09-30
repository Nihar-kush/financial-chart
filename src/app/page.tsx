"use client";

import CandlestickChart from "@/components/CandlestickChart";
import {
  CandlestickData,
  fetchBinanceCryptoData,
} from "@/networkApis/cryptoApi";

import { useEffect, useState } from "react";

export default function Home() {
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [timeFrame, setTimeFrame] = useState<string>("1m"); // Default timeframe
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await fetchBinanceCryptoData("BTCUSDT", timeFrame);
      setCandlestickData(data);
      setLoading(false);
    };
    getData();
  }, [timeFrame]);

  return (
    <div className="bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#1deac44c,#ffffff_100%)] text-black h-screen overflow-hidden text-center">
      <h1 className="text-2xl font-bold mb-4">BTC-USD Candlestick Chart</h1>
      <div className="mb-4">
        <label htmlFor="timeFrame" className="mr-2">
          Select Time Frame:
        </label>
        <select
          id="timeFrame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="border p-2"
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CandlestickChart data={candlestickData} />
      )}
    </div>
  );
}
