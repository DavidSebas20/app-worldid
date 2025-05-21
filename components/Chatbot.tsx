"use client";
import ChatInterface from "./chatbot/ChatInterface";
import { Bot } from "lucide-react";

interface ChatbotProps {
  client: any;
}

export default function Chatbot({ client }: ChatbotProps) {
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {client ? (
        <ChatInterface client={client} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <Bot className="w-16 h-16 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso no disponible</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Para chatear con Bidy, necesitas iniciar sesión primero.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bidy te ayudará con información personalizada sobre autos y pujas.
          </p>
        </div>
      )}
    </div>
  );
}
