"use client"
import { useState } from "react"
import { MiniKit, VerificationLevel, tokenToDecimals, Tokens } from "@worldcoin/minikit-js"
import type { Car, Client } from "@/types"

interface BidModalProps {
  car: Car
  isOpen: boolean
  onClose: () => void
  client: Client | null
  refreshData: () => void
}

export default function BidModal({ car, isOpen, onClose, client, refreshData }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState(car.precioInicial + 100)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isOpen) return null

  const handleVerifyAndBid = async () => {
    if (!client) {
      setError("Por favor, inicie sesión primero")
      return
    }

    if (bidAmount <= car.precioInicial) {
      setError("El monto de la puja debe ser mayor que el precio inicial")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      if (!MiniKit.isInstalled()) {
        setError("Worldcoin MiniKit no está instalado")
        setIsVerifying(false)
        return
      }

      const verifyPayload = {
        action: `bid-${car._id}`,
        signal: client._id,
        verification_level: VerificationLevel.Orb,
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

      if (finalPayload.status === "error") {
        setError("Verificación fallida: " + finalPayload.error)
        setIsVerifying(false)
        return
      }

      // Verify the proof in the backend
      const verifyResponse = await fetch(`/api/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      })

      const verifyResponseJson = await verifyResponse.json()

      if (verifyResponseJson.status !== 200) {
        setError("Verificación en el servidor fallida")
        setIsVerifying(false)
        return
      }

      // Ahora procesamos el pago antes de hacer la puja
      setIsVerifying(false)
      setIsPaying(true)

      // Iniciar pago
      const paymentInitResponse = await fetch(`/api/initiate-payment`, {
        method: "POST",
      })

      const { id } = await paymentInitResponse.json()

      const paymentPayload = {
        reference: id,
        to: car.ownerWallet || "0x0c892815f0B058E69987920A23FBb33c834289cf", // Usar wallet del dueño o fallback
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(0.01, Tokens.WLD).toString(), // Monto pequeño para la puja
          },
        ],
        description: `Puja por ${car.marca} ${car.modelo}`,
      }

      const paymentResponse = await MiniKit.commandsAsync.pay(paymentPayload)
      const paymentResult = paymentResponse?.finalPayload

      if (!paymentResult || paymentResult.status !== "success") {
        setError("El pago para realizar la puja ha fallado")
        setIsPaying(false)
        return
      }

      // Confirmar pago
      const confirmPaymentResponse = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: paymentResult }),
      })

      const paymentConfirmation = await confirmPaymentResponse.json()

      if (!paymentConfirmation.success) {
        setError("La confirmación del pago ha fallado")
        setIsPaying(false)
        return
      }

      // Ahora que el pago está confirmado, enviamos la puja
      setIsPaying(false)
      setIsSubmitting(true)

      const bidData = {
        clienteId: client._id,
        carroId: car._id,
        monto: bidAmount,
      }

      const bidResponse = await fetch("/api/proxy/pujas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bidData),
      })

      if (!bidResponse.ok) {
        throw new Error("Error al enviar la puja")
      }

      setSuccess("¡Puja realizada con éxito!")
      refreshData()
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error al realizar la puja:", err)
      setError("Error al realizar la puja. Por favor, intente de nuevo.")
    } finally {
      setIsVerifying(false)
      setIsPaying(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Realizar una Puja</h2>
          <p className="mb-4">
            {car.marca} {car.modelo} ({car.año})
          </p>
          <p className="mb-6">
            Precio Inicial: <span className="font-semibold">${car.precioInicial.toLocaleString()}</span>
          </p>

          <div className="mb-6">
            <label htmlFor="bidAmount" className="block text-sm font-medium mb-2">
              Monto de su Puja ($)
            </label>
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={car.precioInicial + 1}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
              {success}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              disabled={isVerifying || isSubmitting || isPaying}
            >
              Cancelar
            </button>
            <button
              onClick={handleVerifyAndBid}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              disabled={isVerifying || isSubmitting || isPaying || !client}
            >
              {isVerifying
                ? "Verificando..."
                : isPaying
                  ? "Procesando pago..."
                  : isSubmitting
                    ? "Enviando puja..."
                    : "Verificar y Pujar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
