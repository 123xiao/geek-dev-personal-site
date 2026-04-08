const STORAGE_KEY = "asset_live_users_v1";
const DEFAULT_USER_PRESETS = [
  { name: "正总", initialAssetYuan: 8000000, hourlyRateYuan: 170 },
  { name: "首总", initialAssetYuan: 3000000, hourlyRateYuan: 100 },
  { name: "4会老丝", initialAssetYuan: 1000000, hourlyRateYuan: 50 },
];

const state = {
  users: [],
  timer: null,
  rowMap: new Map(),
  displayValueMap: new Map(),
  rafMap: new Map(),
  tiltBound: new WeakSet(),
};

const dom = {
  nowTime: document.getElementById("nowTime"),
  userCount: document.getElementById("userCount"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  openModalBtn: document.getElementById("openModalBtn"),
  openModalFromEmpty: document.getElementById("openModalFromEmpty"),
  userModal: document.getElementById("userModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  leaderboardList: document.getElementById("leaderboardList"),
  emptyState: document.getElementById("emptyState"),
  topThreePanel: document.getElementById("topThreePanel"),
  topThreeCards: Array.from(document.querySelectorAll(".top-three-card")),
  rowTemplate: document.getElementById("leaderRowTemplate"),
  form: document.getElementById("userForm"),
  formError: document.getElementById("formError"),
  nameInput: document.getElementById("nameInput"),
  hourlyInput: document.getElementById("hourlyInput"),
  initialInput: document.getElementById("initialInput"),
};

init();

function init() {
  state.users = loadUsers();
  bindEvents();
  updateBoard();

  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(updateBoard, 1000);
}

function bindEvents() {
  dom.openModalBtn.addEventListener("click", openModal);

  if (dom.openModalFromEmpty) {
    dom.openModalFromEmpty.addEventListener("click", openModal);
  }

  dom.closeModalBtn.addEventListener("click", closeModal);

  dom.userModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.userModal.hidden) {
      closeModal();
    }
  });

  dom.form.addEventListener("submit", handleAddUser);

  dom.clearAllBtn.addEventListener("click", () => {
    if (state.users.length === 0) {
      showFormError("当前没有可清空的数据。", false);
      return;
    }

    const confirmed = window.confirm("确认清空全部玩家数据吗？该操作不可恢复。");
    if (!confirmed) return;

    state.users = [];
    clearAllAnimations();
    saveUsers();
    updateBoard();
  });

  dom.leaderboardList.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-btn");
    if (!removeBtn) return;

    const row = removeBtn.closest(".leader-row");
    if (!row) return;

    removeUser(row.dataset.userId);
  });
}

function openModal() {
  dom.userModal.hidden = false;
  showFormError("");
  window.setTimeout(() => {
    dom.nameInput.focus();
  }, 10);
}

function closeModal() {
  dom.userModal.hidden = true;
  showFormError("");
}

function handleAddUser(event) {
  event.preventDefault();

  const name = dom.nameInput.value.trim();
  const hourlyRateCents = toCents(dom.hourlyInput.value);
  const initialAssetCents = toCents(dom.initialInput.value);

  if (!name) {
    showFormError("请输入玩家名称。");
    return;
  }

  if (hourlyRateCents === null || hourlyRateCents < 0) {
    showFormError("时薪必须是大于或等于 0 的数字。");
    return;
  }

  if (initialAssetCents === null || initialAssetCents < 0) {
    showFormError("初始资产必须是大于或等于 0 的数字。");
    return;
  }

  state.users.push({
    id: createUserId(),
    name,
    hourlyRateCents,
    initialAssetCents,
    createdAt: Date.now(),
  });

  saveUsers();
  dom.form.reset();
  closeModal();
  updateBoard();
}

function removeUser(userId) {
  const nextUsers = state.users.filter((user) => user.id !== userId);
  if (nextUsers.length === state.users.length) return;

  state.users = nextUsers;
  cleanupUserCaches(userId);
  saveUsers();
  updateBoard();
}

function updateBoard() {
  const now = Date.now();
  dom.nowTime.textContent = formatTime(now);

  const snapshots = state.users
    .map((user) => {
      const snapshot = calculateSnapshot(user, now);
      return { user, ...snapshot };
    })
    .sort((a, b) => b.currentAssetCents - a.currentAssetCents);

  dom.userCount.textContent = `${snapshots.length} 位玩家`;

  const hasUsers = snapshots.length > 0;
  dom.emptyState.hidden = hasUsers;
  renderTopThree(snapshots);

  if (!hasUsers) {
    dom.leaderboardList.innerHTML = "";
    state.rowMap.clear();
    refresh3DEffects();
    return;
  }

  const currentIds = new Set(snapshots.map((item) => item.user.id));
  removeStaleRows(currentIds);

  const fragment = document.createDocumentFragment();

  snapshots.forEach((item, index) => {
    const rank = index + 1;
    const rowRef = getOrCreateRow(item.user);

    const duelInfo = computeDuelInfo(snapshots, index);
    patchRow(rowRef, item, rank, duelInfo);

    fragment.appendChild(rowRef.row);
  });

  dom.leaderboardList.innerHTML = "";
  dom.leaderboardList.appendChild(fragment);
  refresh3DEffects();
}

function getOrCreateRow(user) {
  const existing = state.rowMap.get(user.id);
  if (existing) return existing;

  const row = dom.rowTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.userId = user.id;

  const rowRef = {
    row,
    rankNo: row.querySelector(".rank-no"),
    rankIcon: row.querySelector(".rank-icon"),
    rankBadge: row.querySelector(".rank-badge"),
    playerName: row.querySelector(".player-name"),
    playerMeta: row.querySelector(".player-meta"),
    assetValue: row.querySelector(".asset-value"),
    hourlyValue: row.querySelector(".hourly-value"),
    secondlyValue: row.querySelector(".secondly-value"),
    growthValue: row.querySelector(".growth-value"),
    gapLabel: row.querySelector(".gap-label"),
    gapValue: row.querySelector(".gap-value"),
  };

  rowRef.playerName.textContent = user.name;
  rowRef.playerMeta.textContent = `入场时间：${formatDateTime(user.createdAt)}`;

  state.rowMap.set(user.id, rowRef);
  return rowRef;
}

function patchRow(rowRef, item, rank, duelInfo) {
  rowRef.rankNo.textContent = String(rank);
  rowRef.rankIcon.textContent = rankIconText(rank);
  rowRef.rankBadge.textContent = rankBadgeText(rank);
  rowRef.row.classList.remove(
    "rank-top-1",
    "rank-top-2",
    "rank-top-3",
    "tier-crown",
    "tier-legend",
    "tier-epic",
    "tier-elite",
    "tier-bronze"
  );
  if (rank <= 3) {
    rowRef.row.classList.add(`rank-top-${rank}`);
  }
  rowRef.row.classList.add(rankTierClass(rank));

  animateCurrency(`${item.user.id}:asset`, rowRef.assetValue, item.currentAssetCents, 2);
  animateCurrency(`${item.user.id}:growth`, rowRef.growthValue, item.growthCents, 2);
  animateCurrency(`${item.user.id}:gap`, rowRef.gapValue, duelInfo.gapCents, 2);

  rowRef.hourlyValue.textContent = `${formatCurrency(item.user.hourlyRateCents)}/h`;
  rowRef.secondlyValue.textContent = `${formatCurrency(item.secondRateCents, 4)}/s`;
  rowRef.gapLabel.textContent = duelInfo.label;
}

function renderTopThree(snapshots) {
  if (!dom.topThreePanel || dom.topThreeCards.length === 0) return;

  const hasUsers = snapshots.length > 0;
  dom.topThreePanel.hidden = !hasUsers;
  if (!hasUsers) return;

  dom.topThreeCards.forEach((card) => {
    const rank = Number(card.dataset.rank || 0);
    const slot = snapshots[rank - 1];

    const nameEl = card.querySelector(".top-player-name");
    const assetEl = card.querySelector(".top-player-asset");
    const speedEl = card.querySelector(".top-player-speed");
    const gapEl = card.querySelector(".top-player-gap");

    if (!slot) {
      card.classList.add("is-empty");
      nameEl.textContent = "虚位待定";
      assetEl.textContent = "--";
      speedEl.textContent = "--";
      gapEl.textContent = "--";
      return;
    }

    card.classList.remove("is-empty");
    nameEl.textContent = slot.user.name;

    animateCurrency(`${slot.user.id}:top_asset`, assetEl, slot.currentAssetCents, 2);

    speedEl.textContent = `时薪 ${formatCurrency(slot.user.hourlyRateCents)}/h · 秒增 ${formatCurrency(
      slot.secondRateCents,
      4
    )}/s`;

    const duelInfo = computeDuelInfo(snapshots, rank - 1);
    if (duelInfo.label === "等待对手") {
      gapEl.textContent = "等待对手入场";
    } else {
      gapEl.textContent = `${duelInfo.label} ${formatCurrency(duelInfo.gapCents)}`;
    }
  });
}

function computeDuelInfo(snapshots, index) {
  if (snapshots.length === 1) {
    return { label: "等待对手", gapCents: 0 };
  }

  if (index === 0) {
    const gap = snapshots[0].currentAssetCents - snapshots[1].currentAssetCents;
    return { label: "领先第2名", gapCents: gap };
  }

  const prev = snapshots[index - 1].currentAssetCents;
  const current = snapshots[index].currentAssetCents;

  return {
    label: `距第${index}名`,
    gapCents: prev - current,
  };
}

function rankBadgeText(rank) {
  if (rank === 1) return "王座";
  if (rank === 2) return "追击";
  if (rank === 3) return "暗涌";
  return "博弈";
}

function rankIconText(rank) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "•";
}

function rankTierClass(rank) {
  if (rank === 1) return "tier-crown";
  if (rank <= 3) return "tier-legend";
  if (rank <= 10) return "tier-epic";
  if (rank <= 20) return "tier-elite";
  return "tier-bronze";
}

function refresh3DEffects() {
  const cards = [...dom.topThreeCards, ...dom.leaderboardList.querySelectorAll(".leader-row")];
  cards.forEach((card) => {
    enable3DTilt(card);
  });
}

function enable3DTilt(card) {
  if (!card || state.tiltBound.has(card)) return;
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

  card.classList.add("card-tilt");

  let specular = card.querySelector(".tilt-specular");
  if (!specular) {
    specular = document.createElement("span");
    specular.className = "tilt-specular";
    card.appendChild(specular);
  }

  const maxTilt = card.classList.contains("top-three-card") ? 8.5 : 5.8;

  const handleMove = (event) => {
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
    card.style.setProperty("--tz", "8px");
    card.classList.add("is-tilting");
  };

  const resetTilt = () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--tz", "0px");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
    card.classList.remove("is-tilting");
  };

  card.addEventListener("pointermove", handleMove);
  card.addEventListener("pointerenter", handleMove);
  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("pointercancel", resetTilt);
  card.addEventListener("lostpointercapture", resetTilt);

  state.tiltBound.add(card);
}

function calculateSnapshot(user, now) {
  const elapsedSeconds = Math.max(0, (now - user.createdAt) / 1000);
  const secondRateCents = user.hourlyRateCents / 3600;
  const growthCents = secondRateCents * elapsedSeconds;

  return {
    secondRateCents,
    growthCents,
    currentAssetCents: user.initialAssetCents + growthCents,
  };
}

function animateCurrency(key, element, targetCents, digits) {
  const current = state.displayValueMap.has(key)
    ? state.displayValueMap.get(key)
    : targetCents;

  if (Math.abs(targetCents - current) < 0.0001) {
    element.textContent = formatCurrency(targetCents, digits);
    state.displayValueMap.set(key, targetCents);
    return;
  }

  stopAnimation(key);

  const startValue = current;
  const startTime = performance.now();
  const duration = 760;

  const tick = (timestamp) => {
    const progress = Math.min(1, (timestamp - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = startValue + (targetCents - startValue) * eased;

    state.displayValueMap.set(key, value);
    element.textContent = formatCurrency(value, digits);

    if (progress < 1) {
      state.rafMap.set(key, requestAnimationFrame(tick));
      return;
    }

    state.displayValueMap.set(key, targetCents);
    element.textContent = formatCurrency(targetCents, digits);
    pulseNumber(element);
    state.rafMap.delete(key);
  };

  state.rafMap.set(key, requestAnimationFrame(tick));
}

function pulseNumber(element) {
  element.classList.remove("num-pop");
  // 强制重绘，保证重复触发动画生效。
  void element.offsetWidth;
  element.classList.add("num-pop");
}

function stopAnimation(key) {
  const rafId = state.rafMap.get(key);
  if (rafId) {
    cancelAnimationFrame(rafId);
    state.rafMap.delete(key);
  }
}

function clearAllAnimations() {
  for (const key of state.rafMap.keys()) {
    stopAnimation(key);
  }
  state.displayValueMap.clear();
}

function cleanupUserCaches(userId) {
  state.rowMap.delete(userId);

  const keys = [];
  for (const key of state.displayValueMap.keys()) {
    if (key.startsWith(`${userId}:`)) keys.push(key);
  }

  for (const key of keys) {
    state.displayValueMap.delete(key);
    stopAnimation(key);
  }
}

function removeStaleRows(currentIds) {
  for (const userId of state.rowMap.keys()) {
    if (!currentIds.has(userId)) {
      cleanupUserCaches(userId);
    }
  }
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildDefaultUsers();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = buildDefaultUsers();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return parsed.map(normalizeUser).filter((item) => item !== null);
  } catch (error) {
    console.error("加载本地数据失败:", error);
    const seeded = buildDefaultUsers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function buildDefaultUsers() {
  const now = Date.now();
  const launchOffsets = [35 * 60 * 1000, 22 * 60 * 1000, 10 * 60 * 1000];

  return DEFAULT_USER_PRESETS.map((item, index) => ({
    id: createUserId(),
    name: item.name,
    hourlyRateCents: toCents(item.hourlyRateYuan),
    initialAssetCents: toCents(item.initialAssetYuan),
    createdAt: now - (launchOffsets[index] || 0),
  }));
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.users));
}

function normalizeUser(item) {
  if (!item || typeof item !== "object") return null;

  const id = typeof item.id === "string" && item.id ? item.id : createUserId();
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const hourlyRateCents = Number(item.hourlyRateCents);
  const initialAssetCents = Number(item.initialAssetCents);
  const createdAt = Number(item.createdAt);

  if (!name) return null;
  if (!Number.isFinite(hourlyRateCents) || hourlyRateCents < 0) return null;
  if (!Number.isFinite(initialAssetCents) || initialAssetCents < 0) return null;
  if (!Number.isFinite(createdAt) || createdAt <= 0) return null;

  return { id, name, hourlyRateCents, initialAssetCents, createdAt };
}

function toCents(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number * 100);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(cents, fractionDigits = 2) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(cents / 100);
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const datePart = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const timePart = formatTime(timestamp);
  return `${datePart} ${timePart}`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function showFormError(message, isError = true) {
  if (!message) {
    dom.formError.textContent = "";
    dom.formError.style.color = "";
    return;
  }

  dom.formError.textContent = message;
  dom.formError.style.color = isError ? "" : "#9fe4c3";
}

function createUserId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

