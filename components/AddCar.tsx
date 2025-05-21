"use client";
import { useState } from "react";
import type React from "react";
import { AlertCircle, Check } from "lucide-react";

import type { Client } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface AddCarProps {
  client: Client | null;
  refreshData: () => void;
}

export default function AddCar({ client, refreshData }: AddCarProps) {
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    precioInicial: 1000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "año" || name === "precioInicial" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) {
      setError("Debes iniciar sesión para añadir un auto");
      return;
    }

    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const carData = {
        ...formData,
        ownerWallet: client.wallet,
      };

      console.log("Enviando datos del auto:", carData);

      const response = await fetch("/api/proxy/carros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Auto añadido con éxito:", data);

      setSuccess("¡Auto añadido con éxito!");
      setFormData({
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        precioInicial: 1000,
      });
      setTermsAccepted(false);

      // Forzar actualización completa para incluir el nuevo auto
      refreshData();
    } catch (error) {
      console.error("Error al añadir auto:", error);
      setError("Error al añadir el auto. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Añadir Auto para Subasta</h1>

      {!client ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6">
          <p>Debes iniciar sesión para añadir un auto.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md">
            <p>
              Añadiendo auto como: <strong>{client.nombre}</strong>
            </p>
            <p className="text-sm">Wallet: {client.wallet.slice(0, 10)}...</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="marca" className="block text-sm font-medium mb-1">
                Marca
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="modelo"
                className="block text-sm font-medium mb-1"
              >
                Modelo
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="año" className="block text-sm font-medium mb-1">
                Año
              </label>
              <select
                id="año"
                name="año"
                value={formData.año}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="precioInicial"
                className="block text-sm font-medium mb-1"
              >
                Precio Inicial ($)
              </label>
              <input
                type="number"
                id="precioInicial"
                name="precioInicial"
                value={formData.precioInicial}
                onChange={handleChange}
                min="1"
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
          </div>

          <Alert className="mt-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-800 dark:text-amber-500">
              Términos y condiciones
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              <p className="mb-2">Al añadir un auto para subasta, aceptas:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  El cobro del 1% del valor final de venta como comisión por
                  nuestros servicios.
                </li>
                <li>
                  La revisión completa de todos los documentos y papeles del
                  vehículo para verificar su legalidad.
                </li>
                <li>
                  Que en caso de detectar fraude o que el vehículo provenga de
                  actividades ilícitas, tu cuenta será baneada automáticamente
                  sin previo aviso.
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Acepto los términos y condiciones
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md flex items-center gap-2">
              <Check className="h-4 w-4" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !termsAccepted}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Añadiendo..." : "Añadir Auto"}
          </button>
        </form>
      )}
    </div>
  );
}
