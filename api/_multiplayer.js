const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

const ROLES = ["founder", "pe", "bank", "hedge", "creditor"];
const ACTIONS = {
  founder: ["grow", "restructure", "protect"],
  pe: ["acquire", "operate", "pass"],
  bank: ["lend", "tighten", "decline"],
  hedge: ["long", "short", "hedge"],
  creditor: ["extend", "enforce", "swap"]
};

function db() {
  const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function code() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.randomBytes(6), byte => alphabet[byte % alphabet.length]).join("");
}

function token() { return crypto.randomBytes(24).toString("base64url"); }
function hash(value) { return crypto.createHash("sha256").update(String(value)).digest("hex"); }
function clean(value, max = 40) { return String(value ?? "").replace(/[^\p{L}\p{N} _.-]/gu, "").trim().slice(0, max); }

function guard(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const origin = req.headers.origin; const host = req.headers.host;
  if (origin && host) {
    try { if (new URL(origin).host !== host) { res.status(403).json({ error: "Cross-origin request denied" }); return false; } }
    catch (_) { res.status(403).json({ error: "Invalid origin" }); return false; }
  }
  if (JSON.stringify(req.body || {}).length > 10000) { res.status(413).json({ error: "Request too large" }); return false; }
  return true;
}

async function authenticate(client, roomCode, rawToken) {
  if (!roomCode || !rawToken) return null;
  const { data } = await client.from("cm_players").select("id,room_id,role,name,is_host").eq("session_hash", hash(rawToken)).maybeSingle();
  if (!data) return null;
  const { data: room } = await client.from("cm_rooms").select("id,code,status,turn,version,state,deadline").eq("id", data.room_id).eq("code", roomCode).maybeSingle();
  return room ? { player: data, room } : null;
}

async function publicState(client, room) {
  const { data: players, error: playerError } = await client.from("cm_players").select("id,role,name,is_host,last_seen").eq("room_id", room.id).order("joined_at");
  if (playerError) throw playerError;
  const { data: actions, error: actionError } = await client.from("cm_actions").select("role,choice,created_at").eq("room_id", room.id).eq("turn", room.turn);
  if (actionError) throw actionError;
  return { code: room.code, status: room.status, turn: room.turn, version: room.version, state: room.state, deadline: room.deadline, players, submittedRoles: actions.map(item => item.role) };
}

module.exports = { ROLES, ACTIONS, db, code, token, hash, clean, guard, authenticate, publicState };
