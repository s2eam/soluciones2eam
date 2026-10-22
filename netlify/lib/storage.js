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
