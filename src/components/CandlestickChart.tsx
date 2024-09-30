import { useState, useEffect, useRef } from "react";
import {
  CandlestickSeries,
  BarSeries,
  XAxis,
  YAxis,
  Chart,
  ChartCanvas,
  MouseCoordinateX,
  MouseCoordinateY,
  discontinuousTimeScaleProviderBuilder,
  BollingerSeries,
  CrossHairCursor,
  bollingerBand,
  LineSeries,
} from "react-financial-charts";
import { timeFormat } from "d3-time-format";

type BollingerBands = {
  top: number;
  middle: number;
  bottom: number;
};

type CandlestickData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bb?: BollingerBands;
};

type CandlestickChartProps = {
  data: CandlestickData[];
};

const CandlestickChart = ({ data }: CandlestickChartProps) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const ScaleProvider =
    discontinuousTimeScaleProviderBuilder().inputDateAccessor(
      (d) => new Date(d.time * 1000)
    );

  const handleSelectTool = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTool(event.target.value);
  };

  const removeTool = () => {
    setSelectedTool(null);
  };

  const bb = bollingerBand()
    .merge((d: CandlestickData, c: BollingerBands) => {
      d.bb = c;
    })
    .accessor((d: CandlestickData) => d.bb);

  let calculatedData = data;
  if (selectedTool === "Bollinger Bands") {
    calculatedData = bb(data);
  }

  const { data: chartData, xScale, xAccessor } = ScaleProvider(calculatedData);

  // Fibonacci Retracement Levels
  const calculateFibonacciLevels = () => {
    const high = Math.max(...data.map((d) => d.high));
    const low = Math.min(...data.map((d) => d.low));

    const diff = high - low;

    return [
      high,
      high - 0.236 * diff,
      high - 0.382 * diff,
      high - 0.5 * diff,
      high - 0.618 * diff,
      low,
    ];
  };

  const fibonacciLevels =
    selectedTool === "Fibonacci Retracement" ? calculateFibonacciLevels() : [];

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setDimensions({
          width: chartContainerRef.current.offsetWidth,
          height: 600,
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div ref={chartContainerRef} className="w-full max-w-screen-lg mx-auto">
      <div className="mb-4">
        <label htmlFor="ToolSelect" className="mr-2">
          Select Tool:
        </label>
        <select
          id="ToolSelect"
          value={selectedTool || ""}
          onChange={handleSelectTool}
          className="border rounded p-2"
        >
          <option value="">None</option>
          <option value="Bollinger Bands">Bollinger Bands</option>
          <option value="Fibonacci Retracement">Fibonacci Retracement</option>
        </select>

        {selectedTool && (
          <button
            onClick={removeTool}
            className="ml-4 p-2 bg-red-500 text-white rounded"
          >
            Remove Tool
          </button>
        )}
      </div>
      <ChartCanvas
        width={dimensions.width}
        height={dimensions.height}
        ratio={1}
        data={chartData}
        seriesName="BTCUSD"
        xAccessor={xAccessor}
        mouseMoveEvent={true}
        xScale={xScale}
        margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
      >
        {/* Candlestick Chart */}
        <Chart
          id={1}
          height={450}
          padding={80}
          yExtents={(d: CandlestickData) => [d.high, d.low]}
        >
          <XAxis showGridLines />
          <YAxis showGridLines />
          <MouseCoordinateX displayFormat={timeFormat("%Y-%m-%d %H:%M")} />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={(value: number) => `$${value.toFixed(2)}`}
          />
          {selectedTool === "Bollinger Bands" && (
            <BollingerSeries
              yAccessor={bb.accessor()}
              strokeStyle={{
                top: "#206dc6",
                middle: "#69d5ff",
                bottom: "#206dc6",
              }}
              fillStyle="#4f9bf320"
            />
          )}

          {selectedTool === "Fibonacci Retracement" &&
            fibonacciLevels.map((level, index) => (
              <LineSeries
                key={index}
                yAccessor={() => level}
                strokeStyle="#FF0000"
                strokeDasharray="Dash"
              />
            ))}

          <CandlestickSeries />
        </Chart>

        {/* Volume Bar Chart */}
        <Chart
          id={2}
          height={100}
          origin={(w, h) => [0, h - 210]}
          yExtents={(d: CandlestickData) => d.volume}
        >
          <YAxis axisAt="left" orient="left" ticks={3} />
          <BarSeries
            yAccessor={(d: CandlestickData) => d.volume}
            fillStyle={(d) =>
              d.close > d.open
                ? "rgba(38, 166, 154, 0.3)"
                : "rgba(239, 83, 80, 0.3)"
            }
          />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    </div>
  );
};

export default CandlestickChart;
