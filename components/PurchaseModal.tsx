"use client";
import { useState, useEffect } from "react";
import type { Car, Client } from "@/types";
import { Check, AlertTriangle } from "lucide-react";
import { getImageFromCache } from "@/utils/imageCache";

interface PurchaseModalProps {
  car: Car;
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  refreshData: () => void;
  bid?: any; // Añadimos la puja como prop opcional
}

export default function PurchaseModal({
  car,
  client,
  isOpen,
  onClose,
  refreshData,
  bid,
}: PurchaseModalProps) {
  const [simulatePurchase, setSimulatePurchase] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState("");
  const [carImage, setCarImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [processingFeedback, setProcessingFeedback] = useState(false);
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Calcular el precio total y la comisión
  const totalPrice = car.precioInicial;
  const commission = totalPrice * 0.01; // 1% de comisión
  const sellerReceives = totalPrice - commission;

  // Cargar la imagen del caché si está disponible
  useEffect(() => {
    const cachedImage = getImageFromCache(car._id);
    if (cachedImage) {
      setCarImage(cachedImage);
    } else {
      // Si no está en caché, intentar obtener una imagen
      const fetchCarImage = async () => {
        try {
          const response = await fetch(
            `/api/proxy/car-image?marca=${encodeURIComponent(
              car.marca
            )}&modelo=${encodeURIComponent(car.modelo)}&año=${car.año}`,
            { cache: "no-store" }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setCarImage(data.imageUrl);
            }
          }
        } catch (error) {
          console.error("Error al obtener imagen del auto:", error);
          setImageError(true);
        }
      };

      fetchCarImage();
    }
  }, [car]);

  // Manejar la compra
  const handlePurchase = async () => {
    if (!simulatePurchase) {
      setError("Por favor, marque la casilla para simular la compra");
      return;
    }

    try {
      setError("");
      setIsPurchasing(true);

      // Simular el proceso de compra con un retraso
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular compra exitosa
      setPurchaseComplete(true);
      setPurchaseSuccess(true);
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      setError(
        "Ocurrió un error al procesar la compra. Por favor, intente de nuevo."
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  // Manejar la confirmación positiva (el carro llegó bien)
  const handlePositiveFeedback = async () => {
    try {
      setProcessingFeedback(true);
      setError("");

      // 1. Primero, eliminar el carro directamente desde la API externa
      console.log("Eliminando carro con ID:", car._id);

      const carResponse = await fetch(
        `https://car-auction-api.onrender.com/api/carros/${car._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta de eliminación del carro:", carResponse.status);

      if (!carResponse.ok) {
        const errorText = await carResponse.text();
        console.error("Error al eliminar el auto:", errorText);
        throw new Error(`Error al eliminar el auto: ${carResponse.status}`);
      }

      const carData = await carResponse.json();
      console.log("Carro eliminado exitosamente:", carData);

      // 2. Luego, eliminar la puja si existe
      if (bid && bid._id) {
        console.log("Eliminando puja con ID:", bid._id);

        try {
          const pujaResponse = await fetch(
            `https://car-auction-api.onrender.com/api/pujas/${bid._id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!pujaResponse.ok) {
            console.warn(`No se pudo eliminar la puja: ${pujaResponse.status}`);
            // Continuamos con el proceso aunque falle la eliminación de la puja
          } else {
            const pujaData = await pujaResponse.json();
            console.log("Puja eliminada exitosamente:", pujaData);
          }
        } catch (pujaError) {
          console.warn("Error al eliminar la puja:", pujaError);
          // Continuamos con el proceso aunque falle la eliminación de la puja
        }
      }

      setFeedbackComplete(true);
      setFeedbackMessage(
        "¡Excelente! El auto ha sido eliminado de la lista y la transacción ha sido completada con éxito."
      );
      refreshData(); // Actualizar la lista de autos
    } catch (error) {
      console.error("Error al procesar la confirmación:", error);
      setError(
        "Ocurrió un error al procesar su confirmación. Por favor, contacte a soporte."
      );
    } finally {
      setProcessingFeedback(false);
    }
  };

  // Manejar la confirmación negativa (hubo problemas con el carro)
  const handleNegativeFeedback = async () => {
    try {
      setProcessingFeedback(true);
      setError("");

      // Simular la devolución del dinero y la penalización al vendedor
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFeedbackComplete(true);
      setFeedbackMessage(
        "Lamentamos los inconvenientes. Se ha procesado la devolución de su dinero y el vendedor ha sido penalizado. Nuestro equipo de soporte se pondrá en contacto con usted."
      );
    } catch (error) {
      console.error("Error al procesar la reclamación:", error);
      setError(
        "Ocurrió un error al procesar su reclamación. Por favor, contacte a soporte."
      );
    } finally {
      setProcessingFeedback(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {!purchaseComplete ? (
          // Pantalla de compra inicial
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Comprar Auto</h2>
            <div className="mb-4">
              <p className="font-semibold">
                {car.marca} {car.modelo} ({car.año})
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Precio:{" "}
                <span className="font-semibold">
                  ${car.precioInicial.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
              <p className="mb-2">
                <strong>Información importante:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Nuestra plataforma retiene el pago hasta confirmar la entrega
                  correcta del vehículo.
                </li>
                <li>
                  Cobramos una comisión del 1% por cada transacción exitosa.
                </li>
                <li>
                  El vendedor recibirá el pago solo después de su confirmación.
                </li>
                <li>
                  Si hay algún problema, procesaremos la devolución completa de
                  su dinero.
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={simulatePurchase}
                  onChange={(e) => setSimulatePurchase(e.target.checked)}
                  className="mr-2 h-5 w-5"
                />
                <span>Simular compra (solo para demostración)</span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                disabled={isPurchasing}
              >
                Cancelar
              </button>
              <button
                onClick={handlePurchase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                disabled={isPurchasing}
              >
                {isPurchasing ? "Procesando..." : "Comprar Ahora"}
              </button>
            </div>
          </div>
        ) : !showFeedback ? (
          // Pantalla de compra exitosa
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-4">
              ¡Felicidades por su compra!
            </h2>

            <div className="mb-6">
              {carImage && !imageError ? (
                <div className="h-48 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={carImage || "/placeholder.svg"}
                    alt={`${car.marca} ${car.modelo}`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.log(
                        "Error al cargar la imagen en el modal, usando placeholder"
                      );
                      setImageError(true);
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">
                    {car.marca} {car.modelo} ({car.año})
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">
                Detalles de la compra:
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                <p className="mb-2">
                  <span className="font-medium">Vehículo:</span> {car.marca}{" "}
                  {car.modelo} ({car.año})
                </p>
                <p className="mb-2">
                  <span className="font-medium">Precio total:</span> $
                  {totalPrice.toLocaleString()}
                </p>
                <p className="mb-2">
                  <span className="font-medium">
                    Comisión de la plataforma (1%):
                  </span>{" "}
                  ${commission.toLocaleString()}
                </p>
                <p className="mb-2">
                  <span className="font-medium">El vendedor recibirá:</span> $
                  {sellerReceives.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-center">
                <strong>Importante:</strong> El pago se mantiene en custodia
                hasta que confirme la recepción correcta del vehículo.
              </p>
            </div>

            <button
              onClick={() => setShowFeedback(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Continuar
            </button>
          </div>
        ) : !feedbackComplete ? (
          // Pantalla de confirmación de recepción
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Confirmar Recepción del Vehículo
            </h2>

            <p className="mb-6">
              Por favor, confirme si ha recibido el vehículo y si está
              satisfecho con la compra:
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handlePositiveFeedback}
                disabled={processingFeedback}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center disabled:opacity-50"
              >
                <Check className="mr-2 h-5 w-5" />
                {processingFeedback
                  ? "Procesando..."
                  : "Me llegó el carro en perfectas condiciones"}
              </button>

              <button
                onClick={handleNegativeFeedback}
                disabled={processingFeedback}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center disabled:opacity-50"
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                {processingFeedback
                  ? "Procesando..."
                  : "Tuve un problema con el carro"}
              </button>
            </div>
          </div>
        ) : (
          // Pantalla de confirmación final
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div
                className={`${
                  feedbackMessage.includes("Excelente")
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                } rounded-full p-3`}
              >
                {feedbackMessage.includes("Excelente") ? (
                  <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-center mb-4">
              {feedbackMessage.includes("Excelente")
                ? "¡Transacción Completada!"
                : "Reclamación Procesada"}
            </h2>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-center">{feedbackMessage}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
