"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { generateRandomWallet } from "@/utils/wallet";

export const SignIn = () => {
  const { data: session, status } = useSession();
  const [randomWallet, setRandomWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Generar una wallet aleatoria si no existe en localStorage
    const storedWallet = localStorage.getItem("randomWallet");
    if (storedWallet) {
      setRandomWallet(storedWallet);
    } else {
      const newWallet = generateRandomWallet();
      localStorage.setItem("randomWallet", newWallet);
      setRandomWallet(newWallet);
    }

    // Verificar si hay un error en la URL
    const errorParam = new URLSearchParams(window.location.search).get("error");
    if (errorParam) {
      setError(`Error de autenticación: ${errorParam}`);
    }
  }, []);

  // Manejar errores de sesión
  useEffect(() => {
    if (status === "unauthenticated" && isSigningIn) {
      setIsSigningIn(false);
      setError("No se pudo iniciar sesión. Intente usar la wallet aleatoria.");
    }
  }, [status, isSigningIn]);

  if (status === "loading") {
    return <p className="text-center text-gray-500">Cargando...</p>;
  }

  let displayWallet = "0x0000000000000000000000000000000000000000";
  let shortWallet = "0x000...000";

  try {
    // Intentar acceder a session?.user?.name de forma segura
    displayWallet = session?.user?.name || randomWallet || displayWallet;
    shortWallet = displayWallet.slice(0, 10) + "...";
  } catch (err) {
    console.error("Error al acceder a la sesión:", err);
    // Usar wallet aleatoria si hay error
    displayWallet = randomWallet || displayWallet;
    shortWallet = displayWallet.slice(0, 10) + "...";
  }

  const handleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);

      // Intentar iniciar sesión con Worldcoin
      await signIn("worldcoin", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(
        "Error al iniciar sesión. Por favor, intente de nuevo o use la wallet aleatoria."
      );
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (session) {
        await signOut({ callbackUrl: window.location.origin });
      } else {
        // Si estamos usando wallet aleatoria
        localStorage.setItem("isLoggedInWithRandom", "false");
        window.location.reload();
      }
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      // Si hay error al cerrar sesión con NextAuth, forzar cierre de sesión local
      localStorage.setItem("isLoggedInWithRandom", "false");
      window.location.reload();
    }
  };

  if (session) {
    return (
      <>
        <p className="mb-2">
          Conectado como <span className="font-semibold">{shortWallet}</span>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Wallet completa: {displayWallet}
        </p>
        <button
          onClick={handleSignOut}
          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Cerrar sesión
        </button>
      </>
    );
  } else {
    const isLoggedInWithRandom =
      localStorage.getItem("isLoggedInWithRandom") === "true";

    if (isLoggedInWithRandom) {
      return (
        <>
          <p className="mb-2">
            Conectado con wallet aleatoria:{" "}
            <span className="font-semibold">{shortWallet}</span>
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Wallet completa: {displayWallet}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </>
      );
    }

    return (
      <>
        <p className="mb-2">No has iniciado sesión</p>
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
        <p className="mt-4 text-sm text-gray-500">
          O puedes usar tu wallet aleatoria:{" "}
          <span className="font-mono">{shortWallet}</span>
        </p>
        <button
          onClick={() => {
            // Simular inicio de sesión con la wallet aleatoria
            localStorage.setItem("isLoggedInWithRandom", "true");
            window.location.reload();
          }}
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          Usar wallet aleatoria
        </button>
      </>
    );
  }
};
