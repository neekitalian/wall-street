(() => {
  const roleCopy = {
    founder: ["Founder", "创始人"], pe: ["PE Fund", "私募基金"], bank: ["Bank", "银行"], hedge: ["Hedge Fund", "对冲基金"], creditor: ["Creditor", "债权人"]
  };
  const actionCopy = {
    founder: [["grow","Invest in growth","投资增长"],["restructure","Restructure operations","重组经营"],["protect","Protect liquidity","保护流动性"]],
    pe: [["acquire","Leveraged acquisition","杠杆收购"],["operate","Improve operations","改善经营"],["pass","Preserve capital","保留资本"]],
    bank: [["lend","Extend credit","提供信贷"],["tighten","Tighten covenants","收紧契约"],["decline","Decline financing","拒绝融资"]],
    hedge: [["long","Go long","做多"],["short","Short the structure","做空结构"],["hedge","Buy protection","买入保护"]],
    creditor: [["extend","Extend maturity","延长期限"],["enforce","Enforce claims","执行债权"],["swap","Debt-for-equity swap","债转股"]]
  };
  const isZh = () => document.documentElement.lang.startsWith("zh");
  const avatar = role => `assets/avatars/${role}.png`;
  let session = null; let roomState = null; let pollTimer = null; let busy = false; let selectedPlayerLimit = 2;

  const modal = document.createElement("div");
  modal.id = "multiplayerModal"; modal.className = "modal multiplayer-modal"; modal.hidden = true;
  modal.innerHTML = `<div class="modal-card multiplayer-card" role="dialog" aria-modal="true" aria-labelledby="multiplayerTitle"><div class="multi-head"><div><p class="eyebrow">SYNDICATE NETWORK</p><h2 id="multiplayerTitle">Online Capital Table</h2></div><button id="closeMultiplayer" class="quiet-button" type="button">×</button></div><div id="multiplayerContent"></div></div>`;
  document.body.appendChild(modal);

  function t(en, zh) { return isZh() ? zh : en; }
  function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;
    return fetch(path, { ...options, headers }).then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
      return payload;
    });
  }

  function showError(message) {
    const node = document.getElementById("multiError"); if (node) node.textContent = message;
  }

  function renderEntry() {
    document.getElementById("multiplayerTitle").textContent = t("Online Capital Table", "在线资本交易桌");
    document.getElementById("multiplayerContent").innerHTML = `<div class="multi-intro"><p>${t("Create an anonymous room or join with a six-character code. Base funds are fixed by the selected game mode.", "创建匿名房间，或使用六位房间码加入。初始资金由所选游戏模式固定。")}</p></div><div class="mode-options"><button class="mode-option selected" data-player-limit="2" type="button"><strong>${t("2 PLAYERS","2 人模式")}</strong><span>${t("$10M cash · $50M enterprise value · 3 AI desks","现金 $10M · 企业价值 $50M · 3 个 AI 席位")}</span></button><button class="mode-option" data-player-limit="5" type="button"><strong>${t("5 PLAYERS","5 人模式")}</strong><span>${t("$20M cash · $100M enterprise value · all roles human","现金 $20M · 企业价值 $100M · 全部角色由玩家担任")}</span></button></div><p class="fixed-fund-note">${t("The base fund cannot be changed by players.","玩家不能修改初始资金。")}</p><div class="role-picker-preview"><img id="selectedRoleFace" src="${avatar("founder")}" alt=""><div><span>${t("YOUR CHARACTER","你的角色")}</span><strong id="selectedRoleName">${roleCopy.founder[isZh()?1:0]}</strong></div></div><div class="multi-form"><label>${t("Display name","玩家名称")}<input id="multiName" maxlength="40" autocomplete="nickname"></label><label>${t("Role","角色")}<select id="multiRole">${Object.entries(roleCopy).map(([id,label]) => `<option value="${id}">${label[isZh()?1:0]}</option>`).join("")}</select></label><label>${t("Room code (to join)","房间码（加入时填写）")}<input id="multiCode" maxlength="6" autocomplete="off"></label></div><p id="multiError" class="multi-error"></p><div class="multi-buttons"><button id="createRoom" class="primary-action" type="button">${t("Create room","创建房间")}</button><button id="joinRoom" class="primary-action" type="button">${t("Join room","加入房间")}</button></div>`;
    document.querySelectorAll("[data-player-limit]").forEach(button => button.addEventListener("click", () => { selectedPlayerLimit = Number(button.dataset.playerLimit); document.querySelectorAll("[data-player-limit]").forEach(option => option.classList.toggle("selected", option === button)); }));
    document.getElementById("multiRole").addEventListener("change", event => { const role = event.target.value; document.getElementById("selectedRoleFace").src = avatar(role); document.getElementById("selectedRoleName").textContent = roleCopy[role][isZh()?1:0]; });
    document.getElementById("createRoom").onclick = () => enterRoom("create"); document.getElementById("joinRoom").onclick = () => enterRoom("join");
  }

  async function enterRoom(mode) {
    if (busy) return; busy = true; showError("");
    const name = document.getElementById("multiName").value.trim(); const role = document.getElementById("multiRole").value; const code = document.getElementById("multiCode").value.trim().toUpperCase();
    if (!name || (mode === "join" && code.length !== 6)) { showError(t("Enter a name and valid room code.","请输入名称和有效的房间码。")); busy = false; return; }
    try {
      const payload = await api(mode === "create" ? "/api/rooms-create" : "/api/rooms-join", { method:"POST", body:JSON.stringify({ name, role, code, playerLimit: selectedPlayerLimit }) });
      session = { token: payload.sessionToken, code: payload.room.code, player: payload.player }; roomState = payload.room;
      localStorage.setItem("capital-machine-room", JSON.stringify(session)); document.getElementById("setupModal").hidden = true; renderRoom(); schedulePoll();
    } catch (error) { showError(error.message); } finally { busy = false; }
  }

  function metric(label, value) { return `<div><span>${label}</span><strong>${value}</strong></div>`; }
  function countdown() { if (!roomState?.deadline || roomState.status !== "active") return "--"; return `${Math.max(0, Math.ceil((new Date(roomState.deadline).getTime() - Date.now()) / 1000))}s`; }
  function renderRoom() {
    if (!session || !roomState) return renderEntry();
    const playersByRole = Object.fromEntries(roomState.players.map(player => [player.role, player])); const submitted = new Set(roomState.submittedRoles || []);
    const state = roomState.state || {}; const active = roomState.status === "active"; const finished = roomState.status === "finished";
    document.getElementById("multiplayerTitle").textContent = `${t("Room","房间")} ${roomState.code}`;
    const seats = Object.entries(roleCopy).map(([role,label]) => { const aiSeat = active && roomState.playerLimit === 2 && !playersByRole[role]; return `<div class="seat ${playersByRole[role] || aiSeat ? "occupied" : ""}"><img src="${avatar(role)}" alt="${label[isZh()?1:0]}"><div><span>${label[isZh()?1:0]}</span><strong>${playersByRole[role]?.name || (aiSeat ? t("AI DESK","AI 席位") : t("OPEN","空缺"))}</strong>${active ? `<small>${aiSeat ? t("CONSERVATIVE","保守策略") : (submitted.has(role) ? t("LOCKED","已提交") : t("DECIDING","决策中"))}</small>` : ""}</div></div>`; }).join("");
    const metrics = active || finished ? `<div class="room-metrics">${metric(t("Cash","现金"),`$${Number(state.cash||0).toFixed(1)}M`)}${metric(t("Enterprise value","企业价值"),`$${Number(state.enterpriseValue||0).toFixed(1)}M`)}${metric(t("Debt","债务"),`$${Number(state.debt||0).toFixed(1)}M`)}${metric(t("Control","控制"),Math.round(state.control||0))}${metric(t("Liquidity","流动性"),Math.round(state.liquidity||0))}${metric(t("Stress","压力"),Math.round(state.marketStress||0))}</div>` : "";
    let controls = "";
    if (roomState.status === "lobby") controls = session.player.is_host ? `<button id="startRoom" class="primary-action" type="button" ${roomState.players.length === roomState.playerLimit ? "" : "disabled"}>${t(`Start when ${roomState.playerLimit} player seats are filled`,`${roomState.playerLimit} 个玩家席位到齐后开始`)}</button>` : `<p class="waiting-copy">${t("Waiting for the host to start.","等待房主开始游戏。")}</p>`;
    else if (active && !submitted.has(session.player.role)) controls = `<div class="active-player"><img src="${avatar(session.player.role)}" alt=""><p class="role-prompt">${t("Your decision as","你当前的角色：")} ${roleCopy[session.player.role][isZh()?1:0]}</p></div><div class="role-actions">${actionCopy[session.player.role].map(([value,en,zh]) => `<button type="button" data-choice="${value}">${t(en,zh)}</button>`).join("")}</div>`;
    else if (active) controls = `<p class="waiting-copy">${t("Decision locked. Waiting for the other seats…","决策已锁定，等待其他席位……")}</p>`;
    else controls = `<p class="waiting-copy">${t("The game is complete.","本局已经结束。")}</p>`;
    document.getElementById("multiplayerContent").innerHTML = `<div class="room-status"><div><span>${t("MODE","模式")}</span><strong>${roomState.playerLimit}P</strong></div><div><span>${t("TURN","回合")}</span><strong>${Math.min(roomState.turn,12)}/12</strong></div><div><span>${t("STATUS","状态")}</span><strong>${roomState.status.toUpperCase()}</strong></div><div><span>${t("YOUR ROLE","你的角色")}</span><strong>${roleCopy[session.player.role][isZh()?1:0]}</strong></div><div><span>${t("DEADLINE","剩余时间")}</span><strong>${countdown()}</strong></div></div><div class="seat-grid">${seats}</div>${metrics}<div class="room-event">${state.lastEvent || t("The table is assembling.","交易桌正在集结。")}</div><p id="multiError" class="multi-error"></p>${controls}<button id="leaveRoom" class="quiet-button leave-room" type="button">${t("Leave this device","在此设备退出")}</button>`;
    const start = document.getElementById("startRoom"); if (start) start.onclick = startRoom;
    document.querySelectorAll("[data-choice]").forEach(button => button.onclick = () => submitAction(button.dataset.choice));
    document.getElementById("leaveRoom").onclick = leaveRoom;
  }

  async function startRoom() { try { roomState = (await api("/api/rooms-start", { method:"POST", body:JSON.stringify({ code:session.code }) })).room; renderRoom(); } catch(error) { showError(error.message); } }
  async function submitAction(choice) { if (busy) return; busy = true; try { roomState = (await api("/api/rooms-action", { method:"POST", body:JSON.stringify({ code:session.code, choice }) })).room; renderRoom(); } catch(error) { showError(error.message); } finally { busy = false; } }
  async function poll() { if (!session) return; try { const payload = await api(`/api/rooms-state?code=${encodeURIComponent(session.code)}`); session.player = payload.player; roomState = payload.room; renderRoom(); } catch(error) { showError(t("Connection lost. Reconnecting…","连接中断，正在重连……")); } }
  function schedulePoll() { clearInterval(pollTimer); pollTimer = setInterval(poll, 2000); }
  function leaveRoom() { clearInterval(pollTimer); localStorage.removeItem("capital-machine-room"); session = null; roomState = null; renderEntry(); }
  async function resume() { try { const saved = JSON.parse(localStorage.getItem("capital-machine-room")); if (!saved?.token || !saved?.code) return; session = saved; const payload = await api(`/api/rooms-state?code=${encodeURIComponent(session.code)}`); session.player = payload.player; roomState = payload.room; schedulePoll(); } catch (_) { localStorage.removeItem("capital-machine-room"); session = null; } }

  function open() { modal.hidden = false; if (session && roomState) renderRoom(); else renderEntry(); }
  document.getElementById("onlineButton").addEventListener("click", open);
  document.getElementById("multiplayerButton").addEventListener("click", open);
  document.getElementById("closeMultiplayer").addEventListener("click", () => { modal.hidden = true; });
  resume().finally(() => { if (new URLSearchParams(location.search).has("online")) open(); });
})();
