(() => {
  const roleCopy = {
    founder: ["Founder", "创始人"], pe: ["PE Fund", "私募基金"], bank: ["Bank", "银行"], hedge: ["Hedge Fund", "对冲基金"], creditor: ["Creditor", "债权人"]
  };
  const actionCopy = {
    founder: [["grow","Growth bet","增长下注","Spend cash to raise enterprise value. Stronger when the Bank lends.","投入现金提高企业价值。银行放贷时效果更强。"],["restructure","Operational restructuring","经营重组","Pay for a turnaround that reduces debt. Stronger when creditors extend.","投入资金推动转型并降低债务。债权人延期时效果更强。"],["protect","Build cash reserves","建立现金储备","Trade near-term value for liquidity and survival time.","牺牲短期价值，换取流动性与生存时间。"]],
    pe: [["acquire","Leveraged buyout","杠杆收购","Gain control and scale with borrowed money. Funding determines whether it closes.","用借款取得控制权并扩大规模。融资决定交易能否完成。"],["operate","Execute the operating plan","执行经营计划","Create cash flow and value without adding debt.","不增加债务，通过经营创造现金流与价值。"],["pass","Walk away","放弃交易","Preserve optionality and reduce market pressure.","保留选择权并降低市场压力。"]],
    bank: [["lend","Fund the deal","为交易融资","Add liquidity and debt. Amplifies a buyout or growth plan.","同时增加流动性与债务，放大收购或增长计划。"],["tighten","Tighten covenants","收紧契约","Protect the loan by restricting borrower liquidity.","通过限制借款人流动性来保护贷款。"],["decline","Refuse financing","拒绝融资","Limit leverage, but leave the company with less cash.","限制杠杆，但公司可用现金也会减少。"]],
    hedge: [["long","Buy the upside","买入上涨空间","Back enterprise value while accepting more market risk.","押注企业价值上涨，同时承担更多市场风险。"],["short","Short the structure","做空资本结构","Profit from weakness. Dangerous when creditors enforce.","押注结构恶化。债权人执行债权时冲击最大。"],["hedge","Buy protection","买入保护","Pay a premium to reduce stress and tail exposure.","支付保费，降低压力与尾部风险。"]],
    creditor: [["extend","Extend maturity","延长期限","Give the company time in exchange for a negotiated workout.","给公司更多时间，以换取协商重组。"],["enforce","Enforce claims","执行债权","Use priority rights to take cash and control. May start a liquidity spiral.","利用偿付顺位夺取现金与控制权，可能触发流动性螺旋。"],["swap","Debt for equity","债转股","Reduce debt and move control from owners to creditors.","降低债务，把控制权从股东转移给债权人。"]]
  };
  const roleObjective = {
    founder: ["Keep the company alive without losing control.", "让公司活下来，同时避免失去控制权。"],
    pe: ["Increase controlled value without making the financing fatal.", "提高受控资产价值，同时避免融资结构致命。"],
    bank: ["Earn from credit while protecting repayment and covenants.", "从信贷中获利，同时保护偿付与契约权利。"],
    hedge: ["Express the best risk-adjusted view and survive the path.", "表达最佳风险调整观点，并在兑现前活下来。"],
    creditor: ["Maximize recovery, priority and restructuring leverage.", "最大化回收、偿付顺位与重组谈判权。"]
  };
  const isZh = () => document.documentElement.lang.startsWith("zh");
  const avatar = role => `assets/avatars/${role}.png`;
  const invitedRoom = (new URLSearchParams(location.search).get("room") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
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
    document.getElementById("multiplayerContent").innerHTML = `<div class="multi-intro"><p>${t("Create an anonymous room or join with a six-character code. Base funds are fixed by the selected game mode.", "创建匿名房间，或使用六位房间码加入。初始资金由所选游戏模式固定。")}</p></div><div class="mode-options"><button class="mode-option selected" data-player-limit="2" type="button"><strong>${t("2 PLAYERS","2 人模式")}</strong><span>${t("$10M cash · $50M enterprise value · 3 AI desks","现金 $10M · 企业价值 $50M · 3 个 AI 席位")}</span></button><button class="mode-option" data-player-limit="5" type="button"><strong>${t("5 PLAYERS","5 人模式")}</strong><span>${t("$20M cash · $100M enterprise value · all roles human","现金 $20M · 企业价值 $100M · 全部角色由玩家担任")}</span></button></div><p class="fixed-fund-note">${t("The base fund cannot be changed by players.","玩家不能修改初始资金。")}</p><div class="role-picker-preview"><img id="selectedRoleFace" src="${avatar("founder")}" alt=""><label class="role-picker-control"><span>${t("YOUR CHARACTER","你的角色")}</span><select id="multiRole">${Object.entries(roleCopy).map(([id,label]) => `<option value="${id}">${label[isZh()?1:0]}</option>`).join("")}</select></label></div><div class="multi-form"><label>${t("Display name","玩家名称")}<input id="multiName" maxlength="40" autocomplete="nickname"></label><label>${t("Room code (to join)","房间码（加入时填写）")}<input id="multiCode" maxlength="6" autocomplete="off"></label></div><p id="multiError" class="multi-error"></p><div class="multi-buttons"><button id="createRoom" class="primary-action" type="button">${t("Create room","创建房间")}</button><button id="joinRoom" class="primary-action" type="button">${t("Join room","加入房间")}</button></div>`;
    document.querySelectorAll("[data-player-limit]").forEach(button => button.addEventListener("click", () => { selectedPlayerLimit = Number(button.dataset.playerLimit); document.querySelectorAll("[data-player-limit]").forEach(option => option.classList.toggle("selected", option === button)); }));
    document.getElementById("multiRole").addEventListener("change", event => { document.getElementById("selectedRoleFace").src = avatar(event.target.value); });
    if (invitedRoom.length === 6) document.getElementById("multiCode").value = invitedRoom;
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
  function actionName(choice) { const action = Object.values(actionCopy).flat().find(item => item[0] === choice); return action ? t(action[1], action[2]) : choice; }
  function countdown() { if (!roomState?.deadline || roomState.status !== "active") return "--"; return `${Math.max(0, Math.ceil((new Date(roomState.deadline).getTime() - Date.now()) / 1000))}s`; }
  function invitationUrl() {
    const base = location.protocol === "file:" ? "https://wall-street-eight.vercel.app/" : `${location.origin}${location.pathname}`;
    const url = new URL(base); url.searchParams.set("online", "1"); url.searchParams.set("room", roomState.code); return url.toString();
  }
  async function shareInvitation() {
    const url = invitationUrl();
    const text = t(`Join my Capital Machine room ${roomState.code}. Choose your role and take a seat at the capital table.`, `加入我的 Capital Machine 房间 ${roomState.code}。选择你的角色，坐上资本交易桌。`);
    try {
      if (navigator.share) await navigator.share({ title: `Capital Machine · ${roomState.code}`, text, url });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(`${text}\n${url}`); showError(t("Invitation copied to clipboard.", "邀请消息已复制。")); }
      else {
        const field = document.createElement("textarea"); field.value = `${text}\n${url}`; field.setAttribute("readonly", ""); field.style.position = "fixed"; field.style.opacity = "0"; document.body.appendChild(field); field.select(); document.execCommand("copy"); field.remove(); showError(t("Invitation copied to clipboard.", "邀请消息已复制。"));
      }
    } catch (error) { if (error.name !== "AbortError") showError(t("Could not share the invitation.", "无法分享邀请。")); }
  }
  function renderRoom() {
    if (!session || !roomState) return renderEntry();
    const playersByRole = Object.fromEntries(roomState.players.map(player => [player.role, player])); const submitted = new Set(roomState.submittedRoles || []);
    const state = roomState.state || {}; const active = roomState.status === "active"; const finished = roomState.status === "finished";
    document.getElementById("multiplayerTitle").textContent = `${t("Room","房间")} ${roomState.code}`;
    const seats = Object.entries(roleCopy).map(([role,label]) => { const aiSeat = active && roomState.playerLimit === 2 && !playersByRole[role]; return `<div class="seat ${playersByRole[role] || aiSeat ? "occupied" : ""}"><img src="${avatar(role)}" alt="${label[isZh()?1:0]}"><div><span>${label[isZh()?1:0]}</span><strong>${playersByRole[role]?.name || (aiSeat ? t("AI DESK","AI 席位") : t("OPEN","空缺"))}</strong>${active ? `<small>${aiSeat ? t("CONSERVATIVE","保守策略") : (submitted.has(role) ? t("LOCKED","已提交") : t("DECIDING","决策中"))}</small>` : ""}</div></div>`; }).join("");
    const metrics = active || finished ? `<div class="room-metrics">${metric(t("Cash","现金"),`$${Number(state.cash||0).toFixed(1)}M`)}${metric(t("Enterprise value","企业价值"),`$${Number(state.enterpriseValue||0).toFixed(1)}M`)}${metric(t("Debt","债务"),`$${Number(state.debt||0).toFixed(1)}M`)}${metric(t("Control","控制"),Math.round(state.control||0))}${metric(t("Liquidity","流动性"),Math.round(state.liquidity||0))}${metric(t("Stress","压力"),Math.round(state.marketStress||0))}</div>` : "";
    const lastActions = Array.isArray(state.lastActions) && state.lastActions.length ? `<div class="last-actions"><span>${t("LAST ROUND","上一回合")}</span>${state.lastActions.map(choice => `<strong>${actionName(choice)}</strong>`).join("")}</div>` : "";
    let controls = "";
    if (roomState.status === "lobby") controls = session.player.is_host ? `<button id="startRoom" class="primary-action" type="button" ${roomState.players.length === roomState.playerLimit ? "" : "disabled"}>${t(`Start when ${roomState.playerLimit} player seats are filled`,`${roomState.playerLimit} 个玩家席位到齐后开始`)}</button>` : `<p class="waiting-copy">${t("Waiting for the host to start.","等待房主开始游戏。")}</p>`;
    else if (active && !submitted.has(session.player.role)) controls = `<div class="active-player"><img src="${avatar(session.player.role)}" alt=""><div><p class="role-prompt">${t("Your decision as","你当前的角色：")} ${roleCopy[session.player.role][isZh()?1:0]}</p><p class="role-objective">${roleObjective[session.player.role][isZh()?1:0]}</p></div></div><p class="turn-rule">${t("All desks choose simultaneously. The rules combine every action after all player seats lock.","所有席位同时决策。玩家席位全部锁定后，规则将合并结算所有行动。")}</p><div class="role-actions">${actionCopy[session.player.role].map(([value,en,zh,enDetail,zhDetail]) => `<button type="button" data-choice="${value}"><strong>${t(en,zh)}</strong><small>${t(enDetail,zhDetail)}</small></button>`).join("")}</div>`;
    else if (active) controls = `<p class="waiting-copy">${t("Decision locked. Waiting for the other seats…","决策已锁定，等待其他席位……")}</p>`;
    else controls = `<p class="waiting-copy">${t("The game is complete.","本局已经结束。")}</p>`;
    document.getElementById("multiplayerContent").innerHTML = `<div class="room-status"><div><span>${t("MODE","模式")}</span><strong>${roomState.playerLimit}P</strong></div><div><span>${t("TURN","回合")}</span><strong>${Math.min(roomState.turn,12)}/12</strong></div><div><span>${t("STATUS","状态")}</span><strong>${roomState.status.toUpperCase()}</strong></div><div><span>${t("YOUR ROLE","你的角色")}</span><strong>${roleCopy[session.player.role][isZh()?1:0]}</strong></div><div><span>${t("DEADLINE","剩余时间")}</span><strong>${countdown()}</strong></div></div><div class="seat-grid">${seats}</div>${metrics}<div class="room-event">${state.lastEvent || t("The table is assembling.","交易桌正在集结。")}</div>${lastActions}<p id="multiError" class="multi-error"></p>${controls}${roomState.status === "lobby" ? `<button id="shareRoom" class="invite-button" type="button">${t("Share invitation","分享邀请")}</button>` : ""}<button id="leaveRoom" class="quiet-button leave-room" type="button">${t("Leave this device","在此设备退出")}</button>`;
    const start = document.getElementById("startRoom"); if (start) start.onclick = startRoom;
    const share = document.getElementById("shareRoom"); if (share) share.onclick = shareInvitation;
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
