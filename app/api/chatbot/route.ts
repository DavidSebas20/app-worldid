import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Crear la instancia de OpenAI con la API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    // Formatear los mensajes para la API de OpenAI
    const formattedMessages = messages.map((message: any) => ({
      role: message.role,
      content: message.content,
    }));

    // Crear un mensaje de sistema con el contexto
    const systemMessage = {
      role: "system",
      content: `Eres Ruedin, un asistente especializado en subastas y ventas de autos. 
      
      Información del cliente: ${
        context.client
          ? JSON.stringify(context.client)
          : "No hay información del cliente"
      }
      
      Autos disponibles para subasta: ${JSON.stringify(context.cars)}
      
      Pujas del cliente: ${JSON.stringify(context.bids)}
      
      Usa esta información para proporcionar respuestas personalizadas sobre los autos, las pujas del cliente y el proceso de subasta. Sé amigable, profesional y siempre intenta dar recomendaciones útiles basadas en los datos disponibles. Si te preguntan por autos específicos o pujas, usa la información proporcionada. Si no tienes la información solicitada, puedes sugerir que revisen la sección correspondiente en la aplicación o que contacten al soporte.`,
    };

    // Añadir el mensaje del sistema al principio de la conversación
    const apiMessages = [systemMessage, ...formattedMessages];

    // Hacer la solicitud a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: apiMessages,
      temperature: 0.5,
      max_tokens: 500,
    });

    // Obtener la respuesta
    const assistantMessage = response.choices[0].message.content;

    // Devolver la respuesta
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Error en el chatbot:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud del chatbot" },
      { status: 500 }
    );
  }
}
