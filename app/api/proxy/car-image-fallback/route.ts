import { type NextRequest, NextResponse } from "next/server";

// Esta función proporciona imágenes de respaldo para autos cuando la API principal falla
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const marca = searchParams.get("marca")?.toLowerCase() || "";

    // Mapa de URLs de imágenes por marca (múltiples imágenes por marca)
    const brandImages: Record<string, string[]> = {
      toyota: [
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1000",
        "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1000",
      ],
      honda: [
        "https://images.unsplash.com/photo-1617469767053-d3b16ee6a4dd?q=80&w=1000",
        "https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=1000",
        "https://images.unsplash.com/photo-1600259828526-77f8617ceec7?q=80&w=1000",
      ],
      ford: [
        "https://images.unsplash.com/photo-1551830820-330a71b99659?q=80&w=1000",
        "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?q=80&w=1000",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000",
      ],
      chevrolet: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000",
        "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=1000",
        "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1000",
      ],
      bmw: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000",
        "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?q=80&w=1000",
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1000",
      ],
      mercedes: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1000",
        "https://images.unsplash.com/photo-1501066927591-314112b5888e?q=80&w=1000",
      ],
      audi: [
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000",
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000",
        "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=1000",
      ],
      volkswagen: [
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1000",
        "https://images.unsplash.com/photo-1627454822466-0b05097c56c9?q=80&w=1000",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000",
      ],
      nissan: [
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000",
        "https://images.unsplash.com/photo-1590510696537-c0327f7aeda9?q=80&w=1000",
        "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
      ],
      hyundai: [
        "https://images.unsplash.com/photo-1629895892858-f54c1f9a131b?q=80&w=1000",
        "https://images.unsplash.com/photo-1633788481582-835f7e4e1b50?q=80&w=1000",
        "https://images.unsplash.com/photo-1625395005224-0fce68a3cdc8?q=80&w=1000",
      ],
      kia: [
        "https://images.unsplash.com/photo-1625395005224-0fce68a3cdc8?q=80&w=1000",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000",
        "https://images.unsplash.com/photo-1633788481582-835f7e4e1b50?q=80&w=1000",
      ],
      mazda: [
        "https://images.unsplash.com/photo-1544558635-667480601430?q=80&w=1000",
        "https://images.unsplash.com/photo-1586464836139-86553c751f65?q=80&w=1000",
        "https://images.unsplash.com/photo-1600259828526-77f8617ceec7?q=80&w=1000",
      ],
    };

    // Imágenes genéricas para marcas no encontradas
    const defaultImages = [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1000",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000",
    ];

    // Buscar imágenes por marca o usar imágenes por defecto
    let imageOptions = defaultImages;

    for (const [brand, urls] of Object.entries(brandImages)) {
      if (marca.includes(brand)) {
        imageOptions = urls;
        break;
      }
    }

    // Seleccionar una imagen al azar de las opciones disponibles
    const randomIndex = Math.floor(Math.random() * imageOptions.length);
    const imageUrl = imageOptions[randomIndex];

    console.log(
      `Seleccionada imagen de respaldo ${randomIndex + 1} de ${
        imageOptions.length
      } para ${marca}`
    );
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error al obtener imagen de respaldo:", error);
    // En caso de error, devolver una imagen fija
    return NextResponse.json({
      imageUrl:
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000",
    });
  }
}
