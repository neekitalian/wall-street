const { db, clean, guard, authenticate, publicState } = require("./_multiplayer");

module.exports = async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const client = db(); if (!client) return res.status(503).json({ error: "Multiplayer storage is not configured" });
  const roomCode = clean(req.body?.code, 6).toUpperCase(); const rawToken = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try {
    const auth = await authenticate(client, roomCode, rawToken); if (!auth || !auth.player.is_host) return res.status(403).json({ error: "Only the host can start" });
    const { count } = await client.from("cm_players").select("id", { count: "exact", head: true }).eq("room_id", auth.room.id);
    if (count !== 5) return res.status(409).json({ error: "All five roles must be occupied" });
    const deadline = new Date(Date.now() + 90000).toISOString();
    const { data: room, error } = await client.from("cm_rooms").update({ status: "active", deadline, version: auth.room.version + 1 }).eq("id", auth.room.id).eq("status", "lobby").select().single();
    if (error) throw error;
    return res.status(200).json({ player: auth.player, room: await publicState(client, room) });
  } catch (error) { console.error("rooms-start", error.message); return res.status(500).json({ error: "Could not start room" }); }
};
