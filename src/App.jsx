import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { ExternalLink } from "lucide-react";
import io from "socket.io-client";
import { Loader2 } from "lucide-react";

const MintMonitor = () => {
  const [mintData, setMintData] = useState([]);
  console.log({ mintData });

  // You can switch between 'mainnet' and 'devnet' as needed
  const SOLANA_NETWORK = "mainnet";
  const getExplorerUrl = (signature) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}`;
  };

  const getAddressExplorerUrl = (address) => {
    return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_NETWORK}`;
  };

  useEffect(() => {
    const socket = io("https://quicknode-backend-ahdm.vercel.app", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to the server.");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server.");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("streamData", (data) => {
      console.log("Received data:", data);
      const dataArray = Array.isArray(data) ? data : [data];

      dataArray.forEach((item) => {
        console.log({ item });

        const processedMint = {
          timestamp: new Date(
            item.blockTime ? item.blockTime * 1000 : Date.now()
          ).toLocaleTimeString(),
          ...item,
        };

        setMintData((prev) => [...prev, processedMint].slice(-50));
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="h-fit min-h-screen w-full p-10 dark:bg-black  flex-col bg-gray-100  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
      <div>
        <p className="text-4xl sm:text-5xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
          Latest 20 Pump.Fun Mint Transactions
        </p>
      </div>

      <Card className="w-full max-w-5xl bg-stone-300">
        <CardHeader>
          <CardTitle>Recent Mints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mintData.length <= 0 ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              mintData
                .slice(-20)
                .reverse()
                .map((mint, i) => {
                  if (!mint.matchedTransactions) return;

                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-stone-200 p-2 bg-secondary rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <a
                          href={getAddressExplorerUrl(
                            mint.matchedTransactions[0].accounts.mint
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm hover:text-blue-500 transition-colors"
                        >
                          {mint.matchedTransactions[0].accounts.mint.substring(
                            0,
                            12
                          )}
                          ...
                        </a>
                        <a
                          href={getExplorerUrl(
                            mint.matchedTransactions[0].signature
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-blue-500"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {mint.timestamp}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MintMonitor;
