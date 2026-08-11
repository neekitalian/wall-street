const { db, clean, guard, authenticate, publicState } = require("./_multiplayer");

module.exports = async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const client = db(); if (!client) return res.status(503).json({ error: "Multiplayer storage is not configured" });
  const roomCode = clean(req.query?.code, 6).toUpperCase(); const rawToken = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try {
    const auth = await authenticate(client, roomCode, rawToken); if (!auth) return res.status(401).json({ error: "Invalid room session" });
    await client.from("cm_players").update({ last_seen: new Date().toISOString() }).eq("id", auth.player.id);
    if (auth.room.status === "active" && auth.room.deadline && new Date(auth.room.deadline).getTime() <= Date.now()) {
      await client.rpc("cm_timeout_turn", { target_room: auth.room.id, target_turn: auth.room.turn });
    }
    const { data: currentRoom, error: roomError } = await client.from("cm_rooms").select("id,code,status,turn,version,state,deadline,player_limit").eq("id", auth.room.id).single();
    if (roomError) throw roomError;
    return res.status(200).json({ player: auth.player, room: await publicState(client, currentRoom) });
  } catch (error) { console.error("rooms-state", error.message); return res.status(500).json({ error: "Could not load room" }); }
};
