import crypto from "node:crypto";
import { STATUSES } from "../lib/services.js";
import { getLead, listLeads, saveLead } from "../lib/storage.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// null = administración deshabilitada (falta ADMIN_TOKEN); true/false = credencial válida o no.
function authorized(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return null;
  const given = Buffer.from((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(token);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export default async (req) => {
  const ok = authorized(req);
  if (ok === null) return json({ ok: false, error: "admin_disabled" }, 503);
  if (!ok) return json({ ok: false, error: "unauthorized" }, 401);

  if (req.method === "GET") return json({ ok: true, leads: await listLeads() });

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    if (!STATUSES.includes(body.status)) return json({ ok: false, error: "invalid_status" }, 422);
    const record = await getLead(String(body.id ?? ""));
    if (!record) return json({ ok: false, error: "not_found" }, 404);
    record.status = body.status;
    await saveLead(record);
    return json({ ok: true });
  }

  return json({ ok: false, error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/leads" };
