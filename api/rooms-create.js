const { db, code, token, hash, clean, guard, publicState } = require("./_multiplayer");

module.exports = async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const client = db(); if (!client) return res.status(503).json({ error: "Multiplayer storage is not configured" });
  const name = clean(req.body?.name); const role = clean(req.body?.role, 16); const playerLimit = Number(req.body?.playerLimit) === 2 ? 2 : 5;
  if (!name || !["founder", "pe", "bank", "hedge", "creditor"].includes(role)) return res.status(400).json({ error: "Invalid name or role" });
  try {
    const initialState = playerLimit === 2
      ? { cash: 10, enterpriseValue: 50, debt: 15, control: 50, liquidity: 55, marketStress: 15, lastEvent: "Two principals enter a tightly funded deal." }
      : { cash: 20, enterpriseValue: 100, debt: 40, control: 50, liquidity: 50, marketStress: 20, lastEvent: "The full syndicate assembles." };
    let room; let error;
    for (let i = 0; i < 5; i += 1) {
      ({ data: room, error } = await client.from("cm_rooms").insert({ code: code(), player_limit: playerLimit, state: initialState }).select().single());
      if (!error) break;
    }
    if (!room) throw error || new Error("Could not allocate room code");
    const sessionToken = token();
    const { data: player, error: playerError } = await client.from("cm_players").insert({ room_id: room.id, role, name, is_host: true, session_hash: hash(sessionToken) }).select("id,role,name,is_host").single();
    if (playerError) throw playerError;
    return res.status(201).json({ sessionToken, player, room: await publicState(client, room) });
  } catch (error) { console.error("rooms-create", error.message); return res.status(500).json({ error: "Could not create room" }); }
};
