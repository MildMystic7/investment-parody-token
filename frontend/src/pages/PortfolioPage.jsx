import { ChartAreaInteractive } from "../components/ChartAreaInteractive";
import styles from "./PortfolioPage.module.css";
import bonk from "../assets/bonk.webp";
import usdc from "../assets/usdc.webp";
import fartcoin from "../assets/fartcoin.webp";

const holdingsData = [
  {
    name: "Bonk",
    marketCap: "$1.5B",
    value: "$8,432",
    image: bonk,
  },
  {
    name: "Fartcoin",
    marketCap: "$420K",
    value: "$4,415",
    image: fartcoin,
  },
  {
    name: "USDC",
    marketCap: "$1T",
    value: "$100",
    image: usdc,
  },
];

function PortfolioPage() {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Portfolio</h1>
          <p>Track our memecoin investments and performance</p>
        </div>

        <div className={styles.content}>
          <ChartAreaInteractive />
        </div>
      </div>

      <div className="mt-5 max-w-[1200px] mx-auto w-full mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Balance */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6">Balance</h2>
          <div className="bg-[#111116] p-6 rounded-lg border border-gray-700 shadow-sm">
            <p className="text-4xl font-bold text-white">$974.4</p>
            <p className="text-sm text-gray-400 mt-2">Total Portfolio Value</p>
          </div>
        </div>

        {/* Right Column: Holdings */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Total Holdings</h2>
          <div className="space-y-4">
            {holdingsData.map((holding, index) => (
              <div
                key={index}
                className="bg-[#111116] p-6 rounded-lg border border-gray-700 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={holding.image}
                    alt={holding.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {holding.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Market Cap: {holding.marketCap}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {holding.value}
                  </p>
                  <p className="text-sm text-gray-400 text-right">
                    Portfolio Value
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;
