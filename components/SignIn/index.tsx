"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export const SignIn = () => {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (status === "loading") {
    return <p className="text-center text-gray-500">Cargando...</p>;
  }

  let displayWallet = "No disponible";
  let shortWallet = "No disponible";

  try {
    // Intentar acceder a session?.user?.name de forma segura
    if (session?.user?.name) {
      displayWallet = session.user.name;
      shortWallet = displayWallet.slice(0, 10) + "...";
    }
  } catch (err) {
    console.error("Error al acceder a la sesión:", err);
  }

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);

      // Iniciar sesión con Worldcoin sin redirección
      await signIn("worldcoin", {
        redirect: false,
      });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Error al iniciar sesión. Por favor, intente de nuevo.");
      setIsSigningIn(false);
    }
  };

  if (session) {
    return (
      <>
        <p className="mb-2">
          Conectado con Worldcoin como{" "}
          <span className="font-semibold">{shortWallet}</span>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Wallet completa: {displayWallet}
        </p>
        <button
          onClick={() => signOut({ redirect: false })}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Cerrar sesión de Worldcoin
        </button>
      </>
    );
  } else {
    return (
      <>
        <p className="mb-2">No has iniciado sesión con Worldcoin</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
        >
          {isSigningIn ? "Iniciando sesión..." : "Iniciar sesión con Worldcoin"}
        </button>
      </>
    );
  }
};
