function OakCoinPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-4xl font-bold mb-4">OakCoin Analytics</h1>
      <p className="mb-4">
        Welcome to the analytics page for OakCoin. Here you will soon find
        detailed charts and real-time data about our community's favorite parody
        token.
      </p>
      <p className="mb-8">
        For now, you can view the live chart on Dexscreener.
      </p>
      <a
        href="https://dexscreener.com/solana/fazh3x66bsv1oc2g8mlzuwenftebv7munhluemnvudfj"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        View on Dexscreener
      </a>

      <div className="mt-12 p-8 border-dashed border-2 border-gray-500 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-400">
          Chart Component Coming Soon
        </h2>
        <p className="text-center text-gray-500 mt-2">
          A beautiful, interactive chart will be embedded here.
        </p>
      </div>
    </div>
  );
}

export default OakCoinPage;
