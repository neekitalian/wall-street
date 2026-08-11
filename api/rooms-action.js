const { db, ACTIONS, clean, guard, authenticate, publicState } = require("./_multiplayer");

module.exports = async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const client = db(); if (!client) return res.status(503).json({ error: "Multiplayer storage is not configured" });
  const roomCode = clean(req.body?.code, 6).toUpperCase(); const choice = clean(req.body?.choice, 20); const rawToken = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try {
    const auth = await authenticate(client, roomCode, rawToken); if (!auth) return res.status(401).json({ error: "Invalid room session" });
    if (auth.room.status !== "active") return res.status(409).json({ error: "Room is not active" });
    if (!ACTIONS[auth.player.role]?.includes(choice)) return res.status(400).json({ error: "Illegal action for this role" });
    const { error: insertError } = await client.from("cm_actions").insert({ room_id: auth.room.id, turn: auth.room.turn, player_id: auth.player.id, role: auth.player.role, choice });
    if (insertError?.code === "23505") return res.status(409).json({ error: "Action already submitted" });
    if (insertError) throw insertError;
    const { error: resolveError } = await client.rpc("cm_resolve_turn", { target_room: auth.room.id, target_turn: auth.room.turn });
    if (resolveError) throw resolveError;
    const { data: room, error: roomError } = await client.from("cm_rooms").select("*").eq("id", auth.room.id).single(); if (roomError) throw roomError;
    return res.status(200).json({ player: auth.player, room: await publicState(client, room) });
  } catch (error) { console.error("rooms-action", error.message); return res.status(500).json({ error: "Could not submit action" }); }
};
