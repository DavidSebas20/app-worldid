"use client";
import { SignIn } from "@/components/SignIn";
import type { Client } from "@/types";

interface ProfileProps {
  client: Client | null;
  loading?: boolean;
  randomWallet?: string | null;
  isLoggedInWithRandom?: boolean;
  setIsLoggedInWithRandom?: (value: boolean) => void;
  authError?: boolean;
}

export default function Profile({
  client,
  loading = false,
  randomWallet = null,
  isLoggedInWithRandom = false,
  setIsLoggedInWithRandom = () => {},
  authError = false,
}: ProfileProps) {
  const handleLogout = () => {
    if (isLoggedInWithRandom && setIsLoggedInWithRandom) {
      localStorage.setItem("isLoggedInWithRandom", "false");
      setIsLoggedInWithRandom(false);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      {authError && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
          <p className="font-medium">
            Problema con la autenticación de Worldcoin
          </p>
          <p className="mt-1">
            Hay un problema con la autenticación de Worldcoin. Puedes usar la
            wallet aleatoria para probar la aplicación.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
        {isLoggedInWithRandom ? (
          <div>
            <p className="mb-2">
              Conectado como{" "}
              <span className="font-semibold">
                {randomWallet?.slice(0, 10)}...
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Wallet completa: {randomWallet}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <SignIn />
        )}

        {loading ? (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500">
              Cargando información del perfil...
            </p>
          </div>
        ) : client ? (
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
            </div>
          </div>
        ) : (
          !isLoggedInWithRandom && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-gray-500">
                Inicia sesión para ver tu perfil
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
