import { purgeOldCounters } from "../lib/storage.js";

// Función programada: se ejecuta una vez al día solo en el sitio publicado.
export default async () => {
  const removed = await purgeOldCounters();
  console.log(`Limpieza del límite de envíos: ${removed} contadores eliminados`);
};

export const config = { schedule: "@daily" };
