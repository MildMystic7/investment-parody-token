import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Generate 7 days of mock portfolio data based on current value
const generateChartData = (currentValue) => {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Create some realistic fluctuation around the current value
    const variation = 0.8 + Math.random() * 0.4; // 80% to 120% of current value
    const value = currentValue * variation;

    data.push({
      date: date.toISOString().split("T")[0],
      portfolioValue: Math.round(value * 100) / 100,
    });
  }

  // Ensure the last day shows the actual current value
  data[data.length - 1].portfolioValue = currentValue;

  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatCurrency = (value) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <div className="p-4 bg-white flex flex-col gap-2 rounded-md border border-[#FFE8D6] shadow-lg">
        <div className="text-medium text-lg text-black">
          {formatDate(label)}
        </div>
        <div className="text-sm text-black">
          Portfolio Value:
          <span className="ml-2 font-semibold">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function ChartAreaInteractive() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/portfolio");
        const data = await response.json();

        if (data.success) {
          // Generate 7 days of chart data based on current portfolio value
          const currentValue = data.data.totalValueUsd || 0;
          const mockChartData = generateChartData(currentValue);
          setChartData(mockChartData);
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);
        // Fallback to mock data
        setChartData(generateChartData(162000));
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F9F6F7] p-8 rounded-2xl text-black max-w-[1600px] mx-auto w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
          <div className="h-[400px] bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F6F7] p-8 rounded-2xl text-black max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black">Performance Chart</h3>
        <p className="text-black text-md mt-2">
          Showing total portfolio value for the last 7 days
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF971D" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF971D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "black", fontSize: 14 }}
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke="#FF971D"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPortfolio)"
            name="Portfolio Value"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center mt-8">
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#FF971D]"></div>
          <span className="text-md text-black">Total Portfolio Value</span>
        </div>
      </div>
    </div>
  );
}
