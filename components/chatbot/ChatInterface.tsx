"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import type { Car, Bid } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  client: any;
}

export default function ChatInterface({ client }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes guardados al iniciar
  useEffect(() => {
    const savedMessages = localStorage.getItem(
      `chat_messages_${client?._id || "guest"}`
    );
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "¡Hola! Soy Ruedin, tu asistente de subastas de autos. ¿En qué puedo ayudarte hoy? Puedo informarte sobre autos disponibles, tus pujas o el proceso de subasta.",
        },
      ]);
    }
  }, [client?._id]);

  // Guardar mensajes cuando cambien
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        `chat_messages_${client?._id || "guest"}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, client?._id]);

  // Obtener datos de contexto
  useEffect(() => {
    async function fetchContextData() {
      try {
        // Obtener datos de los autos
        const carsResponse = await fetch("/api/proxy/carros");
        if (carsResponse.ok) {
          const carsData = await carsResponse.json();
          setCars(carsData);
        }

        // Obtener pujas si el cliente está verificado
        if (client?._id) {
          const bidsResponse = await fetch(
            `/api/proxy/pujas?clienteId=${client._id}`
          );
          if (bidsResponse.ok) {
            const bidsData = await bidsResponse.json();
            setBids(bidsData);
          }
        }
      } catch (error) {
        console.error("Error fetching context data:", error);
      }
    }

    fetchContextData();
  }, [client]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;

    // Agregar mensaje del usuario
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Preparar el contexto
      const contextData = {
        cars: cars.slice(0, 10), // Limitar para no exceder el tamaño del contexto
        bids: bids.slice(0, 10),
        client: client
          ? {
              _id: client._id,
              nombre: client.nombre,
              wallet: client.wallet,
            }
          : null,
      };

      // Enviar la solicitud al endpoint del chatbot
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: contextData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Agregar respuesta del asistente
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error chatting with Ruedin:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, he tenido un problema al procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-3 bg-blue-600 dark:bg-blue-700 text-white flex items-center gap-2">
        <Bot className="w-5 h-5" />
        <h2 className="text-base font-semibold">
          Bidy - Asistente de Subastas
        </h2>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-2.5 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t dark:border-gray-600"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || input.trim() === ""}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
