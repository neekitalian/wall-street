const { db, token, hash, clean, guard, publicState } = require("./_multiplayer");

module.exports = async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const client = db(); if (!client) return res.status(503).json({ error: "Multiplayer storage is not configured" });
  const roomCode = clean(req.body?.code, 6).toUpperCase(); const name = clean(req.body?.name); const role = clean(req.body?.role, 16);
  if (roomCode.length !== 6 || !name || !["founder", "pe", "bank", "hedge", "creditor"].includes(role)) return res.status(400).json({ error: "Invalid room, name or role" });
  try {
    const { data: room } = await client.from("cm_rooms").select("*").eq("code", roomCode).eq("status", "lobby").maybeSingle();
    if (!room) return res.status(404).json({ error: "Open room not found" });
    const { count } = await client.from("cm_players").select("id", { count: "exact", head: true }).eq("room_id", room.id);
    if (count >= (room.player_limit || 5)) return res.status(409).json({ error: "This room is full" });
    const sessionToken = token();
    const { data: player, error } = await client.from("cm_players").insert({ room_id: room.id, role, name, session_hash: hash(sessionToken) }).select("id,role,name,is_host").single();
    if (error?.code === "23505") return res.status(409).json({ error: "That role is already occupied" });
    if (error) throw error;
    return res.status(200).json({ sessionToken, player, room: await publicState(client, room) });
  } catch (error) { console.error("rooms-join", error.message); return res.status(500).json({ error: "Could not join room" }); }
};
