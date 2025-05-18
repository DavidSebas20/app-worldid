import { type NextRequest, NextResponse } from "next/server";

// Esta función busca imágenes de auto basadas en la marca, modelo y año
// y selecciona una al azar de los resultados
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const marca = searchParams.get("marca");
    const modelo = searchParams.get("modelo");
    const año = searchParams.get("año");

    if (!marca || !modelo) {
      return NextResponse.json(
        { error: "Marca y modelo son requeridos" },
        { status: 400 }
      );
    }

    // Construir la consulta de búsqueda
    const query = `${marca} ${modelo} ${año || ""} car`;
    console.log("Buscando imagen para:", query);

    try {
      // Solicitar múltiples imágenes (10) para poder seleccionar una al azar
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=10&client_id=pODVJLWJJUhYgIwvYZjRQQotFocnM1F0j-aIsFMXfQ4`
      );

      if (!response.ok) {
        console.error(`Error en la respuesta de Unsplash: ${response.status}`);
        return NextResponse.json(
          { error: `Error al buscar imagen: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Si se encontraron imágenes, seleccionar una al azar
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const imageUrl = data.results[randomIndex].urls.regular;
        console.log(
          `Seleccionada imagen ${randomIndex + 1} de ${
            data.results.length
          } para ${query}`
        );
        return NextResponse.json({ imageUrl });
      }

      // Si no se encontró ninguna imagen, intentar con una búsqueda más genérica
      const fallbackQuery = `${marca} car`;
      console.log("Intentando búsqueda de respaldo:", fallbackQuery);

      const fallbackResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          fallbackQuery
        )}&per_page=10&client_id=pODVJLWJJUhYgIwvYZjRQQotFocnM1F0j-aIsFMXfQ4`
      );

      if (!fallbackResponse.ok) {
        console.error(
          `Error en la respuesta de fallback de Unsplash: ${fallbackResponse.status}`
        );
        return NextResponse.json(
          {
            error: `Error al buscar imagen de respaldo: ${fallbackResponse.status}`,
          },
          { status: fallbackResponse.status }
        );
      }

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.results && fallbackData.results.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * fallbackData.results.length
        );
        const imageUrl = fallbackData.results[randomIndex].urls.regular;
        console.log(
          `Seleccionada imagen de respaldo ${randomIndex + 1} de ${
            fallbackData.results.length
          } para ${fallbackQuery}`
        );
        return NextResponse.json({ imageUrl });
      }

      // Si aún no se encuentra imagen, indicar que no se encontró
      console.log("No se encontraron imágenes para", query);
      return NextResponse.json(
        { error: "No se encontró ninguna imagen" },
        { status: 404 }
      );
    } catch (apiError) {
      console.error("Error al llamar a la API de Unsplash:", apiError);
      return NextResponse.json(
        { error: "Error al llamar a la API de imágenes" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general al buscar imagen de auto:", error);
    return NextResponse.json(
      { error: "Error al buscar imagen de auto" },
      { status: 500 }
    );
  }
}
