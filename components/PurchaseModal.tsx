"use client";
import { useState, useEffect } from "react";
import type { Car, Client } from "@/types";
import {
  Check,
  AlertTriangle,
  Truck,
  FileText,
  PenToolIcon as Tool,
  Wallet,
  DollarSign,
} from "lucide-react";
import { getImageFromCache } from "@/utils/imageCache";
import { getRandomCarImage, getRandomDefaultImage } from "@/utils/carImages";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

  // Nuevos estados para las opciones de pago y servicios
  const [paymentMethod, setPaymentMethod] = useState<"worldcoin" | "dollars">(
    "worldcoin"
  );
  const [services, setServices] = useState({
    paperwork: false,
    delivery: false,
    inspection: false,
  });

  // Calcular el precio base y la comisión del vendedor
  const basePrice = car.precioInicial;
  const baseCommissionRate = 0.01; // 1% de comisión base para el vendedor
  const baseCommission = basePrice * baseCommissionRate;
  const sellerReceives = basePrice - baseCommission;

  // Calcular costos adicionales para el comprador
  const getAdditionalCosts = () => {
    let additionalCosts = 0;

    // Si seleccionó realizar papeles y no paga con Worldcoin, añadir 0.3%
    if (services.paperwork && paymentMethod !== "worldcoin") {
      additionalCosts += basePrice * 0.003;
    }

    // Añadir costo por entrega a domicilio si está seleccionada
    if (services.delivery) {
      additionalCosts += basePrice * 0.004;
    }

    // Añadir costo por revisión mecánica si está seleccionada
    if (services.inspection) {
      additionalCosts += basePrice * 0.005;
    }

    return additionalCosts;
  };

  const additionalCosts = getAdditionalCosts();
  const totalPrice = basePrice + additionalCosts;

  // Cargar la imagen del caché si está disponible
  useEffect(() => {
    const getCarImage = () => {
      try {
        // Primero verificar si la imagen ya está en caché
        const cachedImage = getImageFromCache(car._id);
        if (cachedImage) {
          setCarImage(cachedImage);
          return;
        }

        // Si no está en caché, obtener una imagen aleatoria según la marca
        const imageUrl = getRandomCarImage(car.marca);
        setCarImage(imageUrl);
      } catch (error) {
        console.error("Error al obtener imagen:", error);
        setImageError(true);

        // En caso de error, usar una imagen genérica
        const defaultImage = getRandomDefaultImage();
        setCarImage(defaultImage);
      }
    };

    getCarImage();
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

      // 1. Primero, eliminar la puja si existe
      if (bid && bid._id) {
        console.log("Eliminando puja con ID:", bid._id);

        try {
          const pujaResponse = await fetch(`/api/proxy/pujas/${bid._id}`, {
            method: "DELETE",
          });

          if (!pujaResponse.ok) {
            console.warn(`No se pudo eliminar la puja: ${pujaResponse.status}`);
            // Continuamos con el proceso aunque falle la eliminación de la puja
          } else {
            console.log("Puja eliminada exitosamente");
          }
        } catch (pujaError) {
          console.warn("Error al eliminar la puja:", pujaError);
          // Continuamos con el proceso aunque falle la eliminación de la puja
        }
      }

      // 2. Luego, eliminar el carro
      console.log("Eliminando carro con ID:", car._id);

      const carResponse = await fetch(`/api/proxy/carros/${car._id}`, {
        method: "DELETE",
      });

      console.log("Respuesta de eliminación del carro:", carResponse.status);

      if (!carResponse.ok) {
        const errorText = await carResponse.text();
        console.error("Error al eliminar el auto:", errorText);
        throw new Error(`Error al eliminar el auto: ${carResponse.status}`);
      }

      const data = await carResponse.json();
      console.log("Respuesta de eliminación:", data);

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

  // Manejar cambios en los servicios seleccionados
  const handleServiceChange = (service: keyof typeof services) => {
    setServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
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
                  Cobramos una comisión base del 1% por cada transacción
                  exitosa.
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

            {/* Opciones de pago */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Método de pago</h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "worldcoin" | "dollars")
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="worldcoin" id="worldcoin" />
                  <Label
                    htmlFor="worldcoin"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4 text-blue-500" />
                    Pagar con Worldcoin
                    {paymentMethod === "worldcoin" && services.paperwork && (
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                        (Trámite de papeles gratis)
                      </span>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dollars" id="dollars" />
                  <Label htmlFor="dollars" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Pagar con Dólares
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Servicios adicionales */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Servicios adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="paperwork"
                    checked={services.paperwork}
                    onCheckedChange={() => handleServiceChange("paperwork")}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="paperwork"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-gray-500" />
                      Trámite de papeles
                      {paymentMethod === "worldcoin" ? (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          (Gratis con Worldcoin)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          (+0.3% comisión)
                        </span>
                      )}
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="delivery"
                    checked={services.delivery}
                    onCheckedChange={() => handleServiceChange("delivery")}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="delivery"
                      className="flex items-center gap-2"
                    >
                      <Truck className="h-4 w-4 text-gray-500" />
                      Entrega a domicilio
                      <span className="text-xs text-gray-500">
                        (+0.4% comisión)
                      </span>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="inspection"
                    checked={services.inspection}
                    onCheckedChange={() => handleServiceChange("inspection")}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="inspection"
                      className="flex items-center gap-2"
                    >
                      <Tool className="h-4 w-4 text-gray-500" />
                      Revisión por mecánico
                      <span className="text-xs text-gray-500">
                        (+0.5% comisión)
                      </span>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de costos */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <h3 className="font-medium mb-2">Resumen de costos</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Precio base del vehículo:</span>
                  <span className="font-medium">
                    ${basePrice.toLocaleString()}
                  </span>
                </div>

                {/* Servicios adicionales (costos para el comprador) */}
                {services.paperwork && paymentMethod !== "worldcoin" && (
                  <div className="flex justify-between">
                    <span>Trámite de papeles (0.3%):</span>
                    <span>${(basePrice * 0.003).toLocaleString()}</span>
                  </div>
                )}

                {services.delivery && (
                  <div className="flex justify-between">
                    <span>Entrega a domicilio (0.4%):</span>
                    <span>${(basePrice * 0.004).toLocaleString()}</span>
                  </div>
                )}

                {services.inspection && (
                  <div className="flex justify-between">
                    <span>Revisión mecánica (0.5%):</span>
                    <span>${(basePrice * 0.005).toLocaleString()}</span>
                  </div>
                )}

                {additionalCosts > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2 flex justify-between font-medium">
                    <span>Subtotal servicios adicionales:</span>
                    <span>${additionalCosts.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2 flex justify-between font-bold">
                  <span>Total a pagar (comprador):</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>

                {/* Información para el vendedor */}
                <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-gray-500">
                    <span>Comisión del vendedor (1%):</span>
                    <span>-${baseCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>El vendedor recibirá:</span>
                    <span>${sellerReceives.toLocaleString()}</span>
                  </div>
                </div>
              </div>
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
                {isPurchasing
                  ? "Procesando..."
                  : `Comprar con ${
                      paymentMethod === "worldcoin" ? "Worldcoin" : "Dólares"
                    }`}
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
                      setCarImage(getRandomDefaultImage());
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
                  <span className="font-medium">Precio base:</span> $
                  {basePrice.toLocaleString()}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Método de pago:</span>{" "}
                  {paymentMethod === "worldcoin" ? "Worldcoin" : "Dólares"}
                </p>

                {/* Servicios contratados */}
                {(services.paperwork ||
                  services.delivery ||
                  services.inspection) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="font-medium mb-1">Servicios contratados:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {services.paperwork && (
                        <li>
                          Trámite de papeles{" "}
                          {paymentMethod === "worldcoin"
                            ? "(Gratis)"
                            : `($${(basePrice * 0.003).toLocaleString()})`}
                        </li>
                      )}
                      {services.delivery && (
                        <li>
                          Entrega a domicilio ($
                          {(basePrice * 0.004).toLocaleString()})
                        </li>
                      )}
                      {services.inspection && (
                        <li>
                          Revisión por mecánico ($
                          {(basePrice * 0.005).toLocaleString()})
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="mb-2 font-bold">
                    <span>Total pagado:</span> ${totalPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span>Comisión del vendedor (1%):</span> $
                    {baseCommission.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span>El vendedor recibirá:</span> $
                    {sellerReceives.toLocaleString()}
                  </p>
                </div>
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
