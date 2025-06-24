import { Button } from "../components/ui/button";

function OakCoinPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-black text-center mt-10">
      <h1 className="text-4xl font-bold mb-8">OakCoin</h1>
      <p className="mb-8">
        Welcome to the analytics page for OakCoin. Here you will soon find
        detailed charts and real-time data about our community's favorite parody
        token.
      </p>
      <p className="mb-8">
        For now, you can view the live chart on Dexscreener.
      </p>
      <div className="flex justify-center gap-4">
        <Button
          asChild
          variant="outline"
          style={{
            backgroundColor: "#FF971D",
            color: "white",
            border: "none",
          }}
        >
          <a
            href="https://dexscreener.com/solana/fazh3x66bsv1oc2g8mlzuwenftebv7munhluemnvudfj"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Dexscreener
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          style={{
            backgroundColor: "#FF971D",
            color: "white",
            border: "none",
          }}
        >
          <a
            href="https://twitter.com/your-twitter-handle"
            target="_blank"
            rel="noopener noreferrer"
          >
            View community on X
          </a>
        </Button>
      </div>

      <div className="mt-12 p-8 border-dashed border-2 border-[#FFE8D6] rounded-lg">
        <h2 className="text-2xl font-bold text-center text-black">
          Chart Component Coming Soon
        </h2>
        <p className="text-center text-black mt-2">
          A beautiful, interactive chart will be embedded here.
        </p>
      </div>
    </div>
  );
}

export default OakCoinPage;
