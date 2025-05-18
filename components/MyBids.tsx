"use client";
import { useState } from "react";
import { MiniKit, tokenToDecimals, Tokens } from "@worldcoin/minikit-js";
import PurchaseModal from "./PurchaseModal";

interface MyBidsProps {
  bids: any[];
  refreshData: () => void;
}

export default function MyBids({ bids, refreshData }: MyBidsProps) {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, string>>(
    {}
  );
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);

  const handlePayment = async (bid: any) => {
    try {
      setIsProcessing({ ...isProcessing, [bid._id]: true });

      // Initialize payment
      const res = await fetch(`/api/initiate-payment`, {
        method: "POST",
      });

      const { id } = await res.json();

      if (!MiniKit.isInstalled()) {
        setPaymentStatus({
          ...paymentStatus,
          [bid._id]: "MiniKit no está instalado",
        });
        setIsProcessing({ ...isProcessing, [bid._id]: false });
        return;
      }

      const payload = {
        reference: id,
        to:
          bid.carroId.ownerWallet ||
          "0x0c892815f0B058E69987920A23FBb33c834289cf", // Use owner wallet or fallback
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(
              bid.monto / 10000,
              Tokens.WLD
            ).toString(), // Convert to appropriate amount
          },
        ],
        description: `Pago por ${bid.carroId.marca} ${bid.carroId.modelo}`,
      };

      const sendPaymentResponse = await MiniKit.commandsAsync.pay(payload);
      const response = sendPaymentResponse?.finalPayload;

      if (!response) {
        setPaymentStatus({ ...paymentStatus, [bid._id]: "Pago fallido" });
        setIsProcessing({ ...isProcessing, [bid._id]: false });
        return;
      }

      if (response.status === "success") {
        // Confirm payment
        const confirmRes = await fetch(`/api/confirm-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: response }),
        });

        const payment = await confirmRes.json();

        if (payment.success) {
          // Register payment in the API
          const pagoData = {
            proof: {
              credential_type: "orb",
              action: `payment-${bid._id}`,
            },
            compradorWallet: bid.clienteId.wallet,
            carroId: bid.carroId._id,
          };

          const pagoRes = await fetch("/api/proxy/pago", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pagoData),
          });

          if (pagoRes.ok) {
            setPaymentStatus({
              ...paymentStatus,
              [bid._id]: "Pago realizado con éxito",
            });
            refreshData();
          } else {
            setPaymentStatus({
              ...paymentStatus,
              [bid._id]: "Error al registrar el pago en la API",
            });
          }
        } else {
          setPaymentStatus({
            ...paymentStatus,
            [bid._id]: "Error en la confirmación del pago",
          });
        }
      } else {
        setPaymentStatus({
          ...paymentStatus,
          [bid._id]: `Pago fallido: ${response.status}`,
        });
      }
    } catch (error) {
      console.error("Error en el pago:", error);
      setPaymentStatus({
        ...paymentStatus,
        [bid._id]: "Ocurrió un error durante el pago",
      });
    } finally {
      setIsProcessing({ ...isProcessing, [bid._id]: false });
    }
  };

  const handleSimulatePurchase = (bid: any) => {
    setSelectedBid(bid);
    setIsPurchaseModalOpen(true);
  };

  // Group bids by car
  const bidsByCar: Record<string, any[]> = {};
  bids.forEach((bid) => {
    const carId = bid.carroId._id;
    if (!bidsByCar[carId]) {
      bidsByCar[carId] = [];
    }
    bidsByCar[carId].push(bid);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Pujas</h1>

      {bids.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Aún no has realizado ninguna puja.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(bidsByCar).map(([carId, carBids]) => {
            // Sort bids by amount (highest first)
            const sortedBids = [...carBids].sort((a, b) => b.monto - a.monto);
            const highestBid = sortedBids[0];
            const isWinningBid =
              sortedBids[0].clienteId._id === sortedBids[0].clienteId._id;

            return (
              <div
                key={carId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">
                    {highestBid.carroId.marca} {highestBid.carroId.modelo} (
                    {highestBid.carroId.año})
                  </h3>

                  <div className="mt-2 space-y-2">
                    <p>
                      Precio Inicial:{" "}
                      <span className="font-medium">
                        ${highestBid.carroId.precioInicial.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Tu Puja Más Alta:{" "}
                      <span className="font-medium">
                        ${highestBid.monto.toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Puja Más Alta Actual:{" "}
                      <span className="font-medium">
                        ${sortedBids[0].monto.toLocaleString()}
                      </span>
                      {isWinningBid && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          (¡Vas ganando!)
                        </span>
                      )}
                    </p>
                  </div>

                  {isWinningBid && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePayment(highestBid)}
                        disabled={isProcessing[highestBid._id]}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isProcessing[highestBid._id]
                          ? "Procesando..."
                          : "Pagar Ahora"}
                      </button>
                      <button
                        onClick={() => handleSimulatePurchase(highestBid)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Simular Compra
                      </button>
                    </div>
                  )}

                  {paymentStatus[highestBid._id] && (
                    <p
                      className={`mt-2 text-sm ${
                        paymentStatus[highestBid._id].includes("éxito")
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {paymentStatus[highestBid._id]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBid && isPurchaseModalOpen && (
        <PurchaseModal
          car={selectedBid.carroId}
          client={selectedBid.clienteId}
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedBid(null);
          }}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}
