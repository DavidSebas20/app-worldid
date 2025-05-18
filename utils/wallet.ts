// Función para generar una dirección de wallet aleatoria
export function generateRandomWallet(): string {
  const characters = "0123456789abcdef";
  let wallet = "0x";

  // Generar 40 caracteres hexadecimales (20 bytes)
  for (let i = 0; i < 40; i++) {
    wallet += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return wallet;
}

// Función para generar un nombre aleatorio
export function generateRandomName(): string {
  const names = [
    "Juan",
    "María",
    "Pedro",
    "Ana",
    "Luis",
    "Sofía",
    "Carlos",
    "Laura",
    "Miguel",
    "Carmen",
    "José",
    "Isabel",
    "Antonio",
    "Elena",
    "Francisco",
    "Patricia",
    "Manuel",
    "Rosa",
    "Javier",
    "Lucía",
  ];

  const surnames = [
    "García",
    "Rodríguez",
    "López",
    "Martínez",
    "González",
    "Pérez",
    "Sánchez",
    "Fernández",
    "Gómez",
    "Martín",
    "Jiménez",
    "Ruiz",
    "Hernández",
    "Díaz",
    "Moreno",
    "Álvarez",
    "Romero",
    "Alonso",
    "Gutiérrez",
    "Navarro",
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];

  return `${randomName} ${randomSurname}`;
}
