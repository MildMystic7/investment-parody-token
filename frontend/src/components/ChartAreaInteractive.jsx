import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const chartData = [
  { date: "2024-05-01", bonk: 400, fartcoin: 240 },
  { date: "2024-05-02", bonk: 300, fartcoin: 139 },
  { date: "2024-05-03", bonk: 200, fartcoin: 980 },
  { date: "2024-05-04", bonk: 278, fartcoin: 390 },
  { date: "2024-05-05", bonk: 189, fartcoin: 480 },
  { date: "2024-05-06", bonk: 239, fartcoin: 380 },
  { date: "2024-05-07", bonk: 349, fartcoin: 430 },
  { date: "2024-05-08", bonk: 400, fartcoin: 240 },
  { date: "2024-05-09", bonk: 300, fartcoin: 139 },
  { date: "2024-05-10", bonk: 200, fartcoin: 980 },
  { date: "2024-05-11", bonk: 278, fartcoin: 390 },
  { date: "2024-05-12", bonk: 189, fartcoin: 480 },
  { date: "2024-05-13", bonk: 239, fartcoin: 380 },
  { date: "2024-05-14", bonk: 349, fartcoin: 430 },
  { date: "2024-05-15", bonk: 400, fartcoin: 240 },
  { date: "2024-05-16", bonk: 300, fartcoin: 139 },
  { date: "2024-05-17", bonk: 200, fartcoin: 980 },
  { date: "2024-05-18", bonk: 278, fartcoin: 390 },
  { date: "2024-05-19", bonk: 189, fartcoin: 480 },
  { date: "2024-05-20", bonk: 239, fartcoin: 380 },
  { date: "2024-05-21", bonk: 349, fartcoin: 430 },
  { date: "2024-05-22", bonk: 400, fartcoin: 240 },
  { date: "2024-05-23", bonk: 300, fartcoin: 139 },
  { date: "2024-05-24", bonk: 200, fartcoin: 980 },
  { date: "2024-05-25", bonk: 278, fartcoin: 390 },
  { date: "2024-05-26", bonk: 189, fartcoin: 480 },
  { date: "2024-05-27", bonk: 239, fartcoin: 380 },
  { date: "2024-05-28", bonk: 349, fartcoin: 430 },
  { date: "2024-05-29", bonk: 400, fartcoin: 240 },
  { date: "2024-05-30", bonk: 300, fartcoin: 139 },
  { date: "2024-05-31", bonk: 450, fartcoin: 600 },
  { date: "2024-06-01", bonk: 500, fartcoin: 300 },
  { date: "2024-06-02", bonk: 550, fartcoin: 450 },
  { date: "2024-06-03", bonk: 480, fartcoin: 400 },
  { date: "2024-06-04", bonk: 600, fartcoin: 500 },
  { date: "2024-06-05", bonk: 620, fartcoin: 550 },
  { date: "2024-06-06", bonk: 580, fartcoin: 510 },
  { date: "2024-06-07", bonk: 640, fartcoin: 580 },
  { date: "2024-06-08", bonk: 680, fartcoin: 620 },
  { date: "2024-06-09", bonk: 720, fartcoin: 650 },
  { date: "2024-06-10", bonk: 700, fartcoin: 610 },
  { date: "2024-06-11", bonk: 750, fartcoin: 680 },
  { date: "2024-06-12", bonk: 800, fartcoin: 720 },
  { date: "2024-06-13", bonk: 780, fartcoin: 700 },
  { date: "2024-06-14", bonk: 820, fartcoin: 750 },
  { date: "2024-06-15", bonk: 850, fartcoin: 780 },
  { date: "2024-06-16", bonk: 880, fartcoin: 810 },
  { date: "2024-06-17", bonk: 900, fartcoin: 830 },
  { date: "2024-06-18", bonk: 920, fartcoin: 850 },
  { date: "2024-06-19", bonk: 950, fartcoin: 880 },
  { date: "2024-06-20", bonk: 930, fartcoin: 860 },
  { date: "2024-06-21", bonk: 960, fartcoin: 890 },
  { date: "2024-06-22", bonk: 980, fartcoin: 910 },
  { date: "2024-06-23", bonk: 1000, fartcoin: 930 },
  { date: "2024-06-24", bonk: 1020, fartcoin: 950 },
  { date: "2024-06-25", bonk: 1050, fartcoin: 970 },
  { date: "2024-06-26", bonk: 1030, fartcoin: 960 },
  { date: "2024-06-27", bonk: 1080, fartcoin: 1000 },
  { date: "2024-06-28", bonk: 1100, fartcoin: 1020 },
  { date: "2024-06-29", bonk: 1150, fartcoin: 1050 },
  { date: "2024-06-30", bonk: 1200, fartcoin: 1100 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-[#111116] flex flex-col gap-4 rounded-md border border-gray-700">
        <div className="text-medium text-lg text-white">{label}</div>
        <div className="text-sm text-white">
          Bonk:
          <span className="ml-2">${payload[0].value}</span>
        </div>
        <div className="text-sm text-white">
          Fartcoin:
          <span className="ml-2">${payload[1].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d");

  const getFilteredData = () => {
    const now = new Date("2024-06-30");
    let daysToSubtract = 30;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "1d") {
      daysToSubtract = 1;
    }

    const startDate = new Date(
      now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000
    );

    return chartData.filter(
      (item) => new Date(item.date) >= startDate && new Date(item.date) <= now
    );
  };

  const filteredData = getFilteredData();

  return (
    <div className="bg-[#111116] p-8 rounded-2xl text-white max-w-[1600px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white">Performance Chart</h3>
          <p className="text-white text-md mt-2">
            Showing total portfolio value for the last{" "}
            {timeRange === "30d"
              ? "30 days"
              : timeRange === "7d"
              ? "7 days"
              : "day"}
          </p>
        </div>
        <select
          className="bg-[#2e2e33] text-white px-4 py-2 border border-gray-600 rounded-lg text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
          <option value="1d">Last day</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorBonk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFartcoin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#fff", fontSize: 14 }}
            tickMargin={20}
            minTickGap={30}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.15)"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Area
            type="monotone"
            dataKey="bonk"
            stroke="#f97316"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBonk)"
            name="Bonk"
          />
          <Area
            type="monotone"
            dataKey="fartcoin"
            stroke="#6b7280"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorFartcoin)"
            name="Fartcoin"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-8 mt-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-md text-white">Bonk</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
          <span className="text-md text-white">Fartcoin</span>
        </div>
      </div>
    </div>
  );
}
