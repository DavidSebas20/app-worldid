"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { generateRandomWallet } from "@/utils/wallet";
import { signIn, useSession } from "next-auth/react";

interface RegisterFormProps {
  onClientRegistered: (client: any) => void;
  initialWallet?: string;
}

export default function RegisterForm({
  onClientRegistered,
  initialWallet,
}: RegisterFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    wallet: initialWallet || "",
    nombre: "",
    correo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Actualizar la wallet si cambia la sesión
  useEffect(() => {
    if (session && session.user && typeof session.user.name === "string") {
      setFormData((prev) => ({ ...prev, wallet: session.user?.name || "" }));
    }
  }, [session]);

  // Generar una wallet aleatoria si no hay initialWallet ni sesión
  useEffect(() => {
    if (!formData.wallet && !initialWallet && !session?.user?.name) {
      const randomWallet = generateRandomWallet();
      setFormData((prev) => ({ ...prev, wallet: randomWallet }));
    }
  }, [initialWallet, formData.wallet, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validar datos
      if (!formData.nombre.trim()) {
        throw new Error("El nombre es obligatorio");
      }
      if (!formData.correo.trim()) {
        throw new Error("El correo es obligatorio");
      }
      if (!formData.wallet.trim()) {
        throw new Error("La wallet es obligatoria");
      }

      console.log("Enviando datos de registro:", formData);

      const response = await fetch("/api/proxy/clientes/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error al registrar: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cliente registrado con éxito:", data);
      setSuccess("¡Registro completado con éxito!");

      // Guardar la wallet en localStorage
      localStorage.setItem("userWallet", formData.wallet);

      // Notificar al componente padre que el cliente se ha registrado
      onClientRegistered(data);
    } catch (error: any) {
      console.error("Error al registrar:", error);
      setError(
        error.message || "Error al registrar. Por favor, intente de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorldcoinSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError("");
      await signIn("worldcoin", { redirect: false });
    } catch (error) {
      console.error("Error al iniciar sesión con Worldcoin:", error);
      setError(
        "Error al iniciar sesión con Worldcoin. Por favor, intente de nuevo."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4">Registro de Usuario</h2>

      {session ? (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md">
          <p>
            Has iniciado sesión con Worldcoin. Completa tu perfil para
            continuar.
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={handleWorldcoinSignIn}
            disabled={isSigningIn}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 mb-4"
          >
            {isSigningIn
              ? "Iniciando sesión..."
              : "Iniciar sesión con Worldcoin"}
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                o regístrate con tus datos
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wallet" className="block text-sm font-medium mb-1">
            Wallet
          </label>
          <input
            type="text"
            id="wallet"
            name="wallet"
            value={formData.wallet}
            onChange={handleChange}
            readOnly={!!session || !!initialWallet}
            className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md ${
              !!session || !!initialWallet ? "bg-gray-50 dark:bg-gray-700" : ""
            }`}
          />
          {(session || initialWallet) && (
            <p className="text-xs text-gray-500 mt-1">
              {session
                ? "Usando la wallet de Worldcoin"
                : "Usando la wallet generada"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Tu nombre"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            placeholder="tu@correo.com"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}
