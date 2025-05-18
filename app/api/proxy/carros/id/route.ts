import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🔧 Entrando en DELETE /api/proxy/carros/[id]");

  try {
    const id = params.id;
    console.log("📌 ID recibido en params:", id);

    if (!id) {
      console.error("❌ ID del carro no proporcionado");
      return NextResponse.json(
        { error: "ID del carro es requerido" },
        { status: 400 }
      );
    }

    const url = `https://car-auction-api.onrender.com/api/carros/${id}`;
    console.log("🌐 Enviando solicitud DELETE a:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Respuesta recibida con status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🧨 Error en respuesta de API:", errorText);
      return NextResponse.json(
        { error: `Error al eliminar el carro: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Carro eliminado exitosamente:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🔥 Excepción en proxy DELETE:", error.message || error);
    return NextResponse.json(
      { error: "Error inesperado al eliminar el carro" },
      { status: 500 }
    );
  }
}
