import { getStore } from "@netlify/blobs";

const store = () => getStore({ name: "leads", consistency: "strong" });

export const saveLead = (record) => store().setJSON(record.id, record);

export const getLead = (id) => store().get(id, { type: "json" });

export async function listLeads(limit = 200) {
  const { blobs } = await store().list();
  const keys = blobs
    .map((blob) => blob.key)
    .sort()
    .reverse()
    .slice(0, limit);
  const rows = await Promise.all(keys.map((key) => getLead(key)));
  return rows.filter(Boolean);
}

// Límite de envíos por hora. Guarda solo un contador asociado a una huella de la IP.
export async function allowRequest(fingerprint, max) {
  const store = getStore({ name: "ratelimit", consistency: "strong" });
  const key = `${new Date().toISOString().slice(0, 13)}-${fingerprint}`;
  const current = (await store.get(key, { type: "json" })) ?? { count: 0 };
  if (current.count >= max) return false;
  await store.setJSON(key, { count: current.count + 1 });
  return true;
}
