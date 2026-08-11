const copy = {
  en: {
    restart: "Restart", mission: "Turn $30M into durable wealth. Survive the path, not just the forecast.",
    wealth: "NET WORTH", goal: "Goal $100M", liquidity: "LIQUIDITY", debt: "DEBT", control: "CONTROL",
    reputation: "REPUTATION", fragility: "FRAGILITY", balance: "Balance Sheet", deal: "The Deal Room",
    network: "Power Network", rate: "BASE RATE", credit: "CREDIT", market: "MARKET", lesson: "CURRENT LESSON",
    formula: "OWNERSHIP × CASH FLOW × TIME", formulaSub: "Leverage accelerates both directions.", latest: "LATEST EVENT",
    decision: "Choose one. The quarter advances after your decision.", playAgain: "Play again", allocation: "CAPITAL AT RISK",
    leverage: "DEBT MULTIPLIER", setupTitle: "Choose your starting position", setupIntro: "Wealth changes the deals you can access. Your origin changes the advantages—and obligations—you begin with.",
    capital: "MANDATE CAPITAL", begin: "Begin solo mandate", online: "Online table", aiCalling: "RALPH IS PREPARING A BRIEFING…", aiLive: "MARKET BRIEFING", offline: "OFFLINE BRIEFING",
    assets: ["Cash", "Public equity", "Private equity", "Real estate"],
    people: ["Bankers", "Investors", "Boards", "Operators"],
    endKicker: "FINAL INVESTMENT COMMITTEE"
  },
  zh: {
    restart: "重新开始", mission: "把三千万美元变成可持续财富。活过过程，而不只是看对终局。",
    wealth: "净资产", goal: "目标 $100M", liquidity: "流动性", debt: "债务", control: "控制权",
    reputation: "信誉", fragility: "脆弱度", balance: "资产负债表", deal: "交易室",
    network: "权力网络", rate: "基准利率", credit: "信贷", market: "市场", lesson: "本回合认知",
    formula: "所有权 × 现金流 × 时间", formulaSub: "杠杆会同时加速两个方向。", latest: "最新事件",
    decision: "选择一个方案。决策后进入下一季度。", playAgain: "再玩一次", allocation: "风险资本比例",
    leverage: "债务倍数", setupTitle: "选择你的起点", setupIntro: "财富规模决定可参与的交易；出身决定你最初拥有的优势与义务。",
    capital: "委托资本", begin: "开始单人游戏", online: "在线交易桌", aiCalling: "RALPH 正在准备简报……", aiLive: "市场简报", offline: "离线简报",
    assets: ["现金", "上市股权", "私人股权", "房地产"],
    people: ["银行家", "投资人", "董事会", "经营者"],
    endKicker: "最终投资委员会"
  }
};

const opportunities = [
  {
    type: ["BUYOUT", "杠杆收购"], title: ["Northstar Logistics", "北星物流"],
    body: ["A dull, profitable operator. The seller wants certainty; your bank wants collateral.", "一家乏味但盈利的公司。卖方想要成交确定性，银行则想要抵押品。"],
    stats: [["Price", "$40M"], ["EBITDA", "$6.0M"], ["Debt rate", "8.0%"]],
    risk: ["Debt service survives the base case, but a recession would erase the cushion.", "基础情景能够偿债，但经济衰退会抹去全部安全垫。"],
    lesson: ["Control can be purchased with borrowed money; survival cannot.", "控制权可以用借来的钱购买，生存能力不行。"],
    actions: [
      { label: ["Conservative bid", "保守报价"], sub: ["$8M cash · $12M debt", "$8M现金 · $12M债务"], fx: s => invest(s, 8, 12, 11, 9, 4, 3) },
      { label: ["Leveraged control", "杠杆控股"], sub: ["$5M cash · $30M debt", "$5M现金 · $30M债务"], fx: s => invest(s, 5, 30, 20, 18, 8, 7) },
      { label: ["Pass", "放弃"], sub: ["Keep optionality", "保留选择权"], fx: s => pass(s, 1) }
    ]
  },
  {
    type: ["DISTRESSED", "困境债务"], title: ["Hotel creditor fight", "酒店债权人争夺战"],
    body: ["A good property sits inside a bad capital structure. The fulcrum security may take control.", "好资产被困在糟糕的资本结构中。关键债权可能最终取得控制权。"],
    stats: [["Face value", "$18M"], ["Purchase", "$7M"], ["Est. recovery", "45–110%"]],
    risk: ["Recovery depends on collateral, legal entity and creditor coalition—not the hotel lobby.", "回收率取决于抵押品、法律实体和债权人联盟，而不是酒店大堂看起来多漂亮。"],
    lesson: ["Where you sit in the waterfall determines what you own after distress.", "在偿付瀑布中的位置，决定困境之后你能拥有什么。"],
    actions: [
      { label: ["Buy senior debt", "买优先债"], sub: ["Lower upside · protected", "低收益 · 有保护"], fx: s => invest(s, 5, 0, 5, 2, 3, -3) },
      { label: ["Buy fulcrum claim", "买关键债权"], sub: ["Fight for control", "争夺控制权"], fx: s => invest(s, 7, 2, 10, 13, 5, 5) },
      { label: ["Pass", "放弃"], sub: ["Avoid legal drag", "避开法律消耗"], fx: s => pass(s, 0) }
    ]
  },
  {
    type: ["MISPRICING", "市场错价"], title: ["The crowded short", "拥挤的空头交易"],
    body: ["You find weak underwriting hidden behind a strong rating. Carry is expensive and timing is unknown.", "你发现强评级背后隐藏着糟糕的承保质量，但持有成本很高，兑现时间未知。"],
    stats: [["Premium", "12%/yr"], ["Max payoff", "5.5×"], ["Catalyst", "Unclear"]],
    risk: ["A terminally correct thesis can still fail if funding runs out first.", "即使最终判断正确，也可能因资金先耗尽而失败。"],
    lesson: ["A view becomes a trade only with an instrument, catalyst and survival budget.", "观点只有配上工具、催化剂与生存预算，才是一笔交易。"],
    actions: [
      { label: ["Small hedge", "小额对冲"], sub: ["Spend $1M premium", "支付$1M保费"], fx: s => invest(s, 1, 0, 2, 0, 2, -1) },
      { label: ["Concentrated short", "集中做空"], sub: ["Spend $4M premium", "支付$4M保费"], fx: s => invest(s, 4, 0, 10, 0, 4, 8) },
      { label: ["Pass", "放弃"], sub: ["No carry cost", "没有持有成本"], fx: s => pass(s, -1) }
    ]
  },
  {
    type: ["QUANT", "量化策略"], title: ["Convergence engine", "价差收敛引擎"],
    body: ["A repeatable 1.8% edge appears across hundreds of relative-value trades.", "数百个相对价值交易中出现了可重复的1.8%优势。"],
    stats: [["Edge", "1.8%"], ["Correlation", "0.82"], ["Liquidity", "Normal"]],
    risk: ["Small spreads demand size. Crowded exits can turn correlation into one.", "小价差需要大仓位；拥挤退出会让所有相关性趋近于一。"],
    lesson: ["Leverage converts a statistical edge into a funding problem.", "杠杆会把统计优势转化为融资问题。"],
    actions: [
      { label: ["Low leverage", "低杠杆"], sub: ["2× gross exposure", "2倍总敞口"], fx: s => invest(s, 3, 3, 4, 0, 3, 1) },
      { label: ["Scale the book", "扩大组合"], sub: ["8× gross exposure", "8倍总敞口"], fx: s => invest(s, 3, 18, 11, 0, 5, 12) },
      { label: ["Pass", "放弃"], sub: ["No forced unwind", "避免被迫平仓"], fx: s => pass(s, 0) }
    ]
  },
  {
    type: ["PRIVATE", "私人投资"], title: ["AI infrastructure round", "AI基础设施融资"],
    body: ["A fast-growing private company offers access, but no liquidity and few investor rights.", "一家高速增长的私人公司提供投资额度，但流动性很差，投资人权利也很少。"],
    stats: [["Valuation", "$220M"], ["Growth", "72%"], ["Lock-up", "5 years"]],
    risk: ["A compelling company is not automatically a compelling claim at any price.", "一家优秀公司，并不意味着任何价格下的股权都是优秀资产。"],
    lesson: ["Access, price and rights are separate dimensions of the same deal.", "准入、价格与权利，是同一笔交易的三个不同维度。"],
    actions: [
      { label: ["Negotiate rights", "谈判权利"], sub: ["$4M · board observer", "$4M · 董事会观察员"], fx: s => invest(s, 4, 0, 7, 4, 5, 2) },
      { label: ["Chase allocation", "追逐额度"], sub: ["$8M · no protection", "$8M · 无保护"], fx: s => invest(s, 8, 0, 13, 1, 3, 7) },
      { label: ["Pass", "放弃"], sub: ["Price discipline", "保持价格纪律"], fx: s => pass(s, 1) }
    ]
  }
];

const events = [
  { title: ["Rates fall 75 bps", "利率下降75个基点"], text: ["Assets rerate upward and floating-rate debt becomes cheaper.", "资产估值上升，浮息债务成本下降。"], fx: s => { s.rate -= .75; s.public *= 1.07; s.private *= 1.06; s.reputation += 1; } },
  { title: ["Liquidity vanishes", "市场流动性消失"], text: ["Lenders raise haircuts. Leveraged positions must post cash now.", "贷款人提高折扣率；杠杆头寸必须立即追加现金。"], fx: s => { const call = Math.min(s.cash, s.debt * .08); s.cash -= call; s.fragility += 8; s.credit = "TIGHT"; } },
  { title: ["Operating beat", "经营业绩超预期"], text: ["Portfolio companies convert operational improvement into real cash flow.", "被投企业把经营改善转化为真实现金流。"], fx: s => { s.private *= 1.09; s.cash += 1.2; s.control += 2; } },
  { title: ["Multiple compression", "估值倍数收缩"], text: ["Good businesses remain good, but buyers now pay less for them.", "好公司仍然是好公司，但买家愿意支付的价格降低了。"], fx: s => { s.public *= .91; s.private *= .94; s.sentiment = "CAUTIOUS"; } },
  { title: ["Refinancing window opens", "再融资窗口开启"], text: ["Strong relationships let you extend maturities before competitors.", "良好关系让你比竞争者更早延长债务期限。"], fx: s => { s.debt *= .94; s.cash += .6; s.bankers += 4; } },
  { title: ["Board conflict", "董事会冲突"], text: ["A minority investor blocks your plan. Governance rights suddenly matter.", "少数股东阻止了你的计划，治理权突然变得重要。"], fx: s => { s.control -= 7; s.reputation -= 3; } },
  { title: ["Risk-on rally", "风险偏好回归"], text: ["Public markets reward duration and narrative.", "公开市场开始奖励久期和增长叙事。"], fx: s => { s.public *= 1.11; s.sentiment = "OPTIMISTIC"; } },
  { title: ["Regulatory inquiry", "监管调查"], text: ["Weak information controls cost time, trust and legal fees.", "薄弱的信息管控带来时间、信誉与法律费用损失。"], fx: s => { s.cash -= Math.min(1.5, s.cash); s.reputation -= 8; s.fragility += 3; } },
  { title: ["Strategic buyer calls", "战略买家来电"], text: ["A patient private holding receives an unsolicited premium offer.", "一项长期私人持股收到带溢价的主动报价。"], fx: s => { const gain = s.private * .07; s.private -= gain; s.cash += gain * 1.25; s.reputation += 3; } },
  { title: ["Quiet quarter", "平静的一季"], text: ["Cash flow compounds. Nothing dramatic happens—and that is valuable.", "现金流继续复利。没有戏剧性事件，本身就是价值。"], fx: s => { s.cash += .5; s.realEstate *= 1.015; s.fragility -= 1; } }
];

let lang = "en";
let state;
const SOLO_BASE_CAPITAL = 1;
let settings = { capital: SOLO_BASE_CAPITAL, reserve: 40, origin: "professional", allocation: 50, leverage: 1 };

const origins = [
  { id: "builder", name: ["Builder", "创业者"], note: ["More control, weaker network", "控制权较强，关系较弱"], control: 12, reputation: -8, network: -8 },
  { id: "professional", name: ["Professional", "专业人士"], note: ["Balanced default", "相对均衡的起点"], control: 0, reputation: 0, network: 0 },
  { id: "heir", name: ["Heir", "继承者"], note: ["Strong access, less autonomy", "准入更强，自主权较低"], control: -10, reputation: 8, network: 15 },
  { id: "fund", name: ["Fund operator", "基金经理"], note: ["Outside capital, high pressure", "管理外部资本，压力更大"], control: 4, reputation: 5, network: 10 }
];

function initialState() {
  const origin = origins.find(x => x.id === settings.origin); const liquid = settings.capital * settings.reserve / 100; const invested = settings.capital - liquid;
  return { turn: 1, startCapital: settings.capital, target: Math.max(30, settings.capital * 10), cash: liquid, public: invested * .5, private: invested * .4, realEstate: invested * .1, debt: 0,
    control: 38 + origin.control, reputation: 50 + origin.reputation, fragility: settings.origin === "fund" ? 22 : 12, rate: 4.2, credit: "OPEN", sentiment: "OPTIMISTIC",
    bankers: 48 + origin.network, investors: 45 + origin.network, boards: 36 + origin.network, operators: 44 + (settings.origin === "builder" ? 12 : origin.network),
    lastEvent: 0, currentDeal: 0, ended: false, aiNarration: null, aiLoading: false, runId: `${Date.now()}-${Math.random()}` };
}

function invest(s, cashCost, debtAdded, assetGain, controlGain, reputationGain, fragilityGain) {
  const scale = (s.startCapital / 30) * (settings.allocation / 50);
  cashCost *= scale; assetGain *= scale; debtAdded *= scale * settings.leverage;
  controlGain *= Math.min(1, .35 + scale); fragilityGain *= Math.max(.4, settings.leverage);
  if (s.cash < cashCost) {
    const gap = cashCost - s.cash;
    s.debt += gap;
    s.cash = 0;
    s.fragility += 5;
  } else s.cash -= cashCost;
  s.debt += debtAdded;
  s.private += assetGain;
  s.control += controlGain;
  s.reputation += reputationGain;
  s.fragility += fragilityGain;
  s.bankers += debtAdded > 0 ? 4 : 1;
  s.boards += Math.max(0, controlGain / 2);
}

function pass(s, reputationGain) { s.reputation += reputationGain; s.cash += .35; s.fragility -= 1; }
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const money = value => `${value < 0 ? "−" : ""}$${Math.abs(value).toFixed(1)}M`;
const netWorth = () => state.cash + state.public + state.private + state.realEstate - state.debt;
const pick = pair => pair[lang === "en" ? 0 : 1];

async function chooseAction(action) {
  if (state.ended) return;
  const deal = opportunities[state.currentDeal]; const actionName = pick(action.label);
  action.fx(state);
  applyQuarterEconomics();
  const event = events[(state.turn * 7 + state.currentDeal * 3) % events.length];
  event.fx(state);
  state.lastEvent = events.indexOf(event);
  normalizeState();
  state.turn += 1;
  state.currentDeal = (state.currentDeal + 1 + (state.turn % 2)) % opportunities.length;
  state.aiNarration = null; state.aiLoading = true;
  render();
  if (state.cash < -.01 || netWorth() <= 0 || state.fragility >= 100 || state.turn > 20) finishGame();
  if (!state.ended) await requestNarration(deal, actionName, event);
}

async function requestNarration(deal, actionName, event) {
  const runId = state.runId; const turn = state.turn;
  try {
    const response = await fetch("/api/game-event", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turn: state.turn - 1, language: lang, origin: settings.origin, action: actionName, deal: pick(deal.title), localEvent: pick(event.title),
        market: { regime: state.sentiment, baseRate: state.rate, credit: state.credit },
        portfolio: { netWorth: netWorth(), cash: state.cash, debt: state.debt, control: state.control, reputation: state.reputation, fragility: state.fragility }
      })
    });
    if (!response.ok) throw new Error("Narrator unavailable");
    const payload = await response.json();
    if (state.runId === runId && state.turn === turn && payload?.narration?.dialogue) state.aiNarration = payload.narration;
  } catch (_) {
    if (state.runId === runId && state.turn === turn) state.aiNarration = null;
  } finally {
    if (state.runId === runId && state.turn === turn) { state.aiLoading = false; render(); }
  }
}

function applyQuarterEconomics() {
  state.cash += state.public * .005 + state.private * .008 + state.realEstate * .006;
  state.cash -= state.debt * ((state.rate + 3.2) / 400);
  if (state.cash < 0) { state.debt += Math.abs(state.cash) * 1.25; state.cash = 0; state.fragility += 7; }
  if (state.debt > Math.max(1, netWorth()) * .75) state.fragility += 4;
}

function normalizeState() {
  ["control", "reputation", "fragility", "bankers", "investors", "boards", "operators"].forEach(k => state[k] = clamp(state[k]));
  ["cash", "public", "private", "realEstate", "debt"].forEach(k => state[k] = Math.max(0, state[k]));
}

function setText(id, value) { document.getElementById(id).textContent = value; }
function render() {
  const c = copy[lang];
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  setText("languageButton", lang === "en" ? "中文" : "EN"); setText("restartButton", c.restart);
  setText("missionCopy", lang === "en" ? `Grow ${money(state.startCapital)} into ${money(state.target)}. Survive the path, not just the forecast.` : `把 ${money(state.startCapital)} 增长到 ${money(state.target)}。不仅要看对终局，更要活过过程。`); setText("wealthLabel", c.wealth); setText("goalCopy", c.goal);
  setText("liquidityLabel", c.liquidity); setText("debtLabel", c.debt); setText("balanceTitle", c.balance);
  setText("dealTitle", c.deal); setText("networkTitle", c.network); setText("rateLabel", c.rate);
  setText("creditLabel", c.credit); setText("sentimentLabel", c.market); setText("lessonLabel", c.lesson);
  setText("wealthFormula", c.formula); setText("formulaSub", c.formulaSub); setText("eventLabel", c.latest);
  setText("decisionPrompt", c.decision); setText("playAgainButton", c.playAgain); setText("endKicker", c.endKicker);
  setText("allocationLabel", c.allocation); setText("leverageLabel", c.leverage); setText("allocationValue", `${settings.allocation}%`); setText("leverageValue", `${settings.leverage.toFixed(1)}×`);
  setText("setupTitle", c.setupTitle); setText("setupIntro", c.setupIntro); setText("capitalLabel", c.capital); setText("beginButton", c.begin); setText("onlineButton", c.online); setText("multiplayerButton", c.online);
  const year = 2027 + Math.floor((state.turn - 1) / 4), quarter = ((state.turn - 1) % 4) + 1;
  setText("quarterLabel", `${year} Q${quarter} · ${lang === "en" ? "TURN" : "回合"} ${Math.min(state.turn,20)}/20`);
  setText("netWorth", money(netWorth())); setText("liquidity", money(state.cash)); setText("debt", money(state.debt));
  setText("goalCopy", `${lang === "en" ? "Goal" : "目标"} ${money(state.target)}`); document.getElementById("goalProgress").style.width = `${clamp(netWorth() / state.target * 100, 0, 100)}%`;
  setText("rateValue", `${Math.max(.1,state.rate).toFixed(1)}%`); setText("creditValue", state.credit); setText("sentimentValue", state.sentiment);
  setText("regimeBadge", state.sentiment === "OPTIMISTIC" ? (lang === "en" ? "EXPANSION" : "扩张") : (lang === "en" ? "CAUTION" : "谨慎"));
  renderAssets(c); renderNetworks(c); renderDeal(); renderEvent(); renderSetup(); renderPreview();
}

function renderSetup() {
  settings.capital = SOLO_BASE_CAPITAL; setText("capitalValue", money(SOLO_BASE_CAPITAL));
  document.getElementById("originOptions").innerHTML = origins.map(o => `<button class="origin-option" type="button" data-origin="${o.id}" aria-pressed="${settings.origin === o.id}"><strong>${pick(o.name)}</strong><small>${pick(o.note)}</small></button>`).join("");
  document.querySelectorAll("[data-origin]").forEach(button => button.addEventListener("click", () => { settings.origin = button.dataset.origin; renderSetup(); }));
}

function renderPreview() {
  const scale = state.startCapital / 30 * settings.allocation / 50;
  const deal = opportunities[state.currentDeal]; const first = deal.actions[0];
  const liquidity = state.cash * settings.allocation / 100; const debtCapacity = liquidity * settings.leverage;
  setText("dealPreview", lang === "en" ? `Your mandate: up to ${money(liquidity)} cash + ${money(debtCapacity)} debt for this decision.` : `本次授权：最多投入 ${money(liquidity)} 现金，并使用 ${money(debtCapacity)} 债务。`);
}

function renderAssets(c) {
  const values = [state.cash, state.public, state.private, state.realEstate];
  const colors = ["#b68735", "#174f3e", "#456b78", "#9a735f"];
  const total = Math.max(.01, values.reduce((a,b) => a+b,0));
  document.getElementById("assetList").innerHTML = values.map((v,i) => `<div class="asset-row"><span>${c.assets[i]}</span><strong>${money(v)}</strong><small>${(v/total*100).toFixed(0)}% ${lang === "en" ? "of gross assets" : "总资产占比"}</small></div>`).join("");
  document.getElementById("allocationBar").innerHTML = values.map((v,i) => `<span style="width:${v/total*100}%;background:${colors[i]}"></span>`).join("");
}

function renderNetworks(c) {
  const values = [state.bankers, state.investors, state.boards, state.operators];
  document.getElementById("networkList").innerHTML = values.map((v,i) => `<div class="network-row"><div class="network-meta"><span>${c.people[i]}</span><strong>${Math.round(v)}</strong></div><div class="network-track"><span style="width:${v}%"></span></div></div>`).join("");
}

function renderDeal() {
  const deal = opportunities[state.currentDeal];
  setText("dealType", pick(deal.type)); setText("lessonText", pick(deal.lesson));
  const briefing = lang === "en"
    ? ["RALPH · MARKET BRIEFING", "After each decision, Ralph explains what changed and why. Commentary only. The game rules control every number."]
    : ["RALPH · 市场简报", "每次决策后，Ralph 会解释发生了什么以及原因。他只负责解说，所有数字均由游戏规则决定。"];
  document.getElementById("dealContent").innerHTML = `<div class="pixel-stage"><div class="office-scene" role="img" aria-label="${lang === "en" ? "New York deal office overlooking Manhattan" : "俯瞰曼哈顿的纽约交易办公室"}"></div><aside class="market-briefing"><strong>${briefing[0]}</strong><p>${briefing[1]}</p></aside></div><div class="deal-hero"><h3>${pick(deal.title)}</h3><p>${pick(deal.body)}</p></div><div class="deal-numbers">${deal.stats.map(x => `<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("")}</div><p class="deal-risk">${pick(deal.risk)}</p>`;
  const actions = document.getElementById("dealActions"); actions.innerHTML = "";
  deal.actions.forEach(action => { const b = document.createElement("button"); b.type = "button"; b.disabled = state.aiLoading; b.innerHTML = `${pick(action.label)}<small>${scaledTerms(pick(action.sub))}</small>`; b.addEventListener("click", () => chooseAction(action)); actions.appendChild(b); });
}

function scaledTerms(terms) {
  const scale = state.startCapital / 30 * settings.allocation / 50; let index = 0;
  return terms.replace(/\$(\d+(?:\.\d+)?)M/g, (_, raw) => { const debtTerm = index++ > 0 && /debt|债务/.test(terms); return money(Number(raw) * scale * (debtTerm ? settings.leverage : 1)); });
}

function renderEvent() {
  const status = document.getElementById("narratorStatus"); status.dataset.live = String(Boolean(state.aiNarration));
  setText("narratorStatus", state.aiLoading ? copy[lang].aiCalling : state.aiNarration ? copy[lang].aiLive : copy[lang].offline);
  if (state.aiLoading) {
    setText("eventTitle", lang === "en" ? "Connecting to Ralph" : "正在连接 Ralph");
    setText("eventText", lang === "en" ? "The game has settled the numbers. Ralph is preparing a plain-language explanation." : "游戏已经完成数字结算。Ralph 正在准备一份易懂的说明。"); return;
  }
  if (state.aiNarration) {
    setText("eventTitle", `${state.aiNarration.speaker} · ${state.aiNarration.complication}`);
    setText("eventText", state.aiNarration.dialogue);
    if (state.aiNarration.lesson) setText("lessonText", state.aiNarration.lesson);
    return;
  }
  if (state.turn === 1) {
    setText("eventTitle", lang === "en" ? "The mandate begins" : "委托正式开始");
    setText("eventText", lang === "en" ? "You inherit a liquid $30M portfolio and a network with more potential than trust." : "你接手了一个流动性充足的三千万美元组合，以及一个潜力大于信任的关系网络。"); return;
  }
  const event = events[state.lastEvent]; setText("eventTitle", pick(event.title)); setText("eventText", pick(event.text));
}

function finishGame() {
  state.ended = true;
  const nw = netWorth(); let title, summary;
  if (nw <= 0 || state.fragility >= 100) {
    title = lang === "en" ? "Forced liquidation" : "被迫清算";
    summary = lang === "en" ? "The thesis may have survived. Your funding did not. Leverage transferred control to creditors." : "投资逻辑也许还成立，但你的融资没有活下来。杠杆把控制权交给了债权人。";
  } else if (nw >= state.target && state.fragility < 65) {
    title = lang === "en" ? "A durable capital machine" : "可持续的资本机器";
    summary = lang === "en" ? "You compounded ownership without surrendering the liquidity needed to wait." : "你让所有权持续复利，同时保留了等待机会所需的流动性。";
  } else {
    title = lang === "en" ? "Wealthy, but not invulnerable" : "富有，但并非坚不可摧";
    summary = lang === "en" ? "You created value, but the balance between liquidity, control and leverage still needs work." : "你创造了价值，但流动性、控制权与杠杆之间仍未达到理想平衡。";
  }
  setText("endTitle", title); setText("endSummary", summary);
  document.getElementById("endStats").innerHTML = [[copy[lang].wealth,money(nw)],[copy[lang].liquidity,money(state.cash)],[copy[lang].fragility,Math.round(state.fragility)]].map(x => `<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
  document.getElementById("endModal").hidden = false;
}

function restart() { state = initialState(); document.getElementById("endModal").hidden = true; document.getElementById("setupModal").hidden = false; render(); }
document.getElementById("languageButton").addEventListener("click", () => { lang = lang === "en" ? "zh" : "en"; render(); });
document.getElementById("restartButton").addEventListener("click", restart);
document.getElementById("playAgainButton").addEventListener("click", restart);
document.getElementById("allocationSlider").addEventListener("input", e => { settings.allocation = Number(e.target.value); render(); });
document.getElementById("leverageSlider").addEventListener("input", e => { settings.leverage = Number(e.target.value); render(); });
document.getElementById("beginButton").addEventListener("click", () => { state = initialState(); document.getElementById("setupModal").hidden = true; render(); });
restart();
