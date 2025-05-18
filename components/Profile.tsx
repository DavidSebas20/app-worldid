"use client";
import { SignIn } from "@/components/SignIn";
import RegisterForm from "@/components/RegisterForm";
import type { Client } from "@/types";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface ProfileProps {
  client: Client | null;
  loading?: boolean;
  onClientRegistered?: (client: Client) => void;
  onLogout?: () => void;
  userWallet?: string | null;
}

export default function Profile({
  client,
  loading = false,
  onClientRegistered = () => {},
  onLogout = () => {},
  userWallet = null,
}: ProfileProps) {
  const [showRegisterForm, setShowRegisterForm] = useState(!client);
  const { data: session } = useSession();

  const handleClientRegistered = (newClient: Client) => {
    onClientRegistered(newClient);
    setShowRegisterForm(false);
  };

  const handleLogout = () => {
    if (session) {
      signOut({ redirect: false });
    }
    onLogout();
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-center text-gray-500">
            Cargando información del perfil...
          </p>
        </div>
      ) : client ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
          <div>
            <p className="mb-2">
              Conectado como{" "}
              <span className="font-semibold">{client.nombre}</span>
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Wallet:{" "}
              <span className="font-mono">{client.wallet.slice(0, 10)}...</span>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Tu Información</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre
                </p>
                <p>{client.nombre}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Correo
                </p>
                <p>{client.correo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Wallet
                </p>
                <p className="truncate">{client.wallet}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                <p className="truncate">{client._id}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : showRegisterForm ? (
        <RegisterForm
          onClientRegistered={handleClientRegistered}
          initialWallet={userWallet || undefined}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
          <SignIn />
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center mb-4">¿No tienes una cuenta?</p>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Registrarme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
