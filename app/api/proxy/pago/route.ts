import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Proxy: Processing payment", body)

    const response = await fetch("https://car-auction-api.onrender.com/api/pago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log("Proxy: Payment processed successfully", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error processing payment:", error)
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 })
  }
}
