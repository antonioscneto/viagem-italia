let travelers = [];
let stays = [];
let shareGuides = [];
let totalCost = 0;
let shareCost = 0;
const places = [
  { id: "roma", name: "Roma", note: "Chegada · 30 dez", kind: "principal", number: "01", position: [12.4964, 41.9028], label: [10, 17] },
  { id: "san-marino", name: "San Marino", note: "30 dez — 1 jan", kind: "principal", number: "02", position: [12.4578, 43.9424], label: [20, -35] },
  { id: "loreto", name: "Loreto", note: "1 — 3 jan", kind: "principal", number: "03", position: [13.6095, 43.4408], label: [13, 13] },
  { id: "florenca", name: "Florença", note: "Base · 3 — 9 jan", kind: "principal", number: "04", position: [11.2558, 43.7696], label: [8, -22] },
  { id: "assisi", name: "Assis", note: "Passeio de um dia", kind: "daytrip", number: "05", position: [12.6196, 43.0707], label: [18, 24] },
  { id: "siena", name: "Siena", note: "Passeio de um dia", kind: "daytrip", number: "06", position: [11.3308, 43.3188], label: [10, 38] },
  { id: "san-gimignano", name: "San Gimignano", note: "Passeio de um dia", kind: "daytrip", number: "07", position: [11.0435, 43.4677], label: [-12, 33] },
  { id: "pisa", name: "Pisa", note: "Passeio de um dia", kind: "daytrip", number: "08", position: [10.4017, 43.7228], label: [-6, -31] },
  { id: "roma", name: "Roma", note: "Parada final", kind: "principal", number: "09", position: [12.4964, 41.9028], label: [10, 17] }
];
const checklistItems = [
  { id: "train-tickets", label: "Comprar as passagens de trem" },
  { id: "rental-car", label: "Reservar o carro" },
  { id: "pack-bags", label: "Fazer as malas (e deixar espaço para lembranças!)" }
];

const italyCoast = {
  mainland: [
    [12.376485, 46.767559], [13.806475, 46.509306], [13.69811, 46.016778], [13.93763, 45.591016],
    [13.141606, 45.736692], [12.328581, 45.381778], [12.383875, 44.885374], [12.261453, 44.600482],
    [12.589237, 44.091366], [13.526906, 43.587727], [14.029821, 42.761008], [15.14257, 41.95514],
    [15.926191, 41.961315], [16.169897, 41.740295], [15.889346, 41.541082], [16.785002, 41.179606],
    [17.519169, 40.877143], [18.376687, 40.355625], [18.480247, 40.168866], [18.293385, 39.810774],
    [17.73838, 40.277671], [16.869596, 40.442235], [16.448743, 39.795401], [17.17149, 39.4247],
    [17.052841, 38.902871], [16.635088, 38.843572], [16.100961, 37.985899], [15.684087, 37.908849],
    [15.687963, 38.214593], [15.891981, 38.750942], [16.109332, 38.964547], [15.718814, 39.544072],
    [15.413613, 40.048357], [14.998496, 40.172949], [14.703268, 40.60455], [14.060672, 40.786348],
    [13.627985, 41.188287], [12.888082, 41.25309], [12.106683, 41.704535], [11.191906, 42.355425],
    [10.511948, 42.931463], [10.200029, 43.920007], [9.702488, 44.036279], [8.888946, 44.366336],
    [8.428561, 44.231228], [7.850767, 43.767148], [7.435185, 43.693845], [7.549596, 44.127901],
    [7.007562, 44.254767], [6.749955, 45.028518], [7.096652, 45.333099], [6.802355, 45.70858],
    [6.843593, 45.991147], [7.273851, 45.776948], [7.755992, 45.82449], [8.31663, 46.163642],
    [8.489952, 46.005151], [8.966306, 46.036932], [9.182882, 46.440215], [9.922837, 46.314899],
    [10.363378, 46.483571], [10.442701, 46.893546], [11.048556, 46.751359], [11.164828, 46.941579],
    [12.153088, 47.115393], [12.376485, 46.767559]
  ],
  sardinia: [
    [9.210012, 41.209991], [9.809975, 40.500009], [9.669519, 39.177376], [9.214818, 39.240473],
    [8.806936, 38.906618], [8.428302, 39.171847], [8.388253, 40.378311], [8.159998, 40.950007],
    [8.709991, 40.899984], [9.210012, 41.209991]
  ],
  sicily: [
    [15.520376, 38.231155], [15.160243, 37.444046], [15.309898, 37.134219], [15.099988, 36.619987],
    [14.335229, 36.996631], [13.826733, 37.104531], [12.431004, 37.61295], [12.570944, 38.126381],
    [13.741156, 38.034966], [14.761249, 38.143874], [15.520376, 38.231155]
  ]
};

const storageKey = "andiamo-italy-trip-v2";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const state = { payments: [], visited: [], checklist: [] };
const svgNamespace = "http://www.w3.org/2000/svg";
let activeCode = null;
let serverRevision = 0;
let pendingWrites = 0;
let syncGeneration = 0;
let saveQueue = Promise.resolve();
let lastConfirmedState = { payments: [], visited: [], checklist: [] };
const message = document.querySelector("#message");
const saveStatus = document.querySelector("#save-status");

function money(cents) {
  return currency.format(cents / 100);
}

function getTraveler(id) {
  return travelers.find((traveler) => traveler.id === id);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function svgElement(tag, attributes = {}) {
  const node = document.createElementNS(svgNamespace, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message${type ? ` message-${type}` : ""}`;
}

function setSaveStatus(text, failed = false) {
  saveStatus.textContent = text;
  saveStatus.parentElement.classList.toggle("save-error", failed);
}

function showBalance(cents) {
  if (cents > 0) return { label: "Falta pagar", amount: money(cents), className: "balance-owed" };
  if (cents < 0) return { label: "Tem a receber", amount: money(-cents), className: "balance-credit" };
  return { label: "Tudo acertado", amount: money(0), className: "balance-settled" };
}

function getBalances() {
  return travelers.map((traveler) => {
    const paid = state.payments.reduce((sum, payment) => sum + (payment.from === traveler.id ? payment.amount : 0), 0);
    const received = state.payments.reduce((sum, payment) => sum + (payment.to === traveler.id ? payment.amount : 0), 0);
    return { ...traveler, paid, received, balance: shareCost - paid };
  });
}

function getLoretoDue() {
  const loreto = stays.find((stay) => stay.id === "loreto");
  const paid = state.payments.reduce((sum, payment) => sum + (payment.to === "hotel-provider" && payment.stayId === "loreto" ? payment.amount : 0), 0);
  return Math.max(0, loreto.amount - paid);
}

function renderOverview() {
  document.querySelector("#total-cost").textContent = money(totalCost);
  document.querySelector("#share-cost").textContent = money(shareCost);
  document.querySelector("#payments-total").textContent = money(state.payments.reduce((sum, payment) => sum + payment.amount, 0));
  document.querySelector("#payments-caption").textContent = `${state.payments.length} ${state.payments.length === 1 ? "pagamento registrado" : "pagamentos registrados"}`;
  document.querySelector("#loreto-due").textContent = money(getLoretoDue());
  document.querySelector("#progress-share").textContent = money(shareCost);
}

function renderProgress() {
  const list = document.querySelector("#progress-list");
  list.replaceChildren();

  for (const traveler of getBalances()) {
    const paid = Math.min(shareCost, traveler.paid);
    const percent = Math.round((paid / shareCost) * 100);
    const row = element("div", "progress-row");
    const name = element("strong", "progress-name", traveler.name);
    const bar = document.createElement("progress");
    bar.className = "traveler-progress";
    bar.max = 100;
    bar.value = percent;
    bar.setAttribute("aria-label", `${traveler.name}: ${money(paid)} de ${money(shareCost)} pagos`);
    const amount = element("span", "progress-amount", `${money(paid)} de ${money(shareCost)}`);
    const percentage = element("strong", "progress-percent", `${percent}%`);
    row.append(name, bar, amount, percentage);
    list.append(row);
  }
}

function renderShareGuides() {
  const list = document.querySelector("#share-guide-grid");
  list.replaceChildren();

  for (const guide of shareGuides) {
    const stay = stays.find((item) => item.id === guide.stayId);
    const card = element("article", "share-guide-card");
    const heading = element("h3", "share-guide-name", stay.name);
    const monthly = guide.monthly === null
      ? "Pagamento a combinar"
      : `${guide.installments}x de cerca de ${money(guide.monthly)}`;
    const transfer = element("p", "share-guide-transfer", guide.payer);
    const total = element("p", "share-guide-total");
    total.append(element("span", "", "Total por pessoa"), element("strong", "", money(guide.total)));
    const installment = element("p", "share-guide-installment");
    installment.append(element("span", "", "Sugestão"), element("strong", "", monthly));
    card.append(heading, transfer, total, installment);
    list.append(card);
  }
}

function renderStays() {
  const list = document.querySelector("#stay-list");
  list.replaceChildren();

  for (const stay of stays) {
    const pending = stay.id === "loreto" ? getLoretoDue() > 0 : false;
    const row = element("article", `stay-row${pending ? " stay-row-pending" : ""}`);
    const marker = element("span", "stay-marker", pending ? "!" : "✓");
    marker.setAttribute("aria-hidden", "true");
    const info = element("div", "stay-info");
    info.append(element("strong", "stay-name", stay.name), element("span", "stay-detail", stay.detail));
    const timing = element("div", "stay-timing");
    const installmentLabel = stay.id === "loreto" && !pending ? "Pago pelo grupo" : stay.installments;
    timing.append(element("span", "stay-dates", stay.dates), element("span", "stay-installments", installmentLabel));
    const amount = element("strong", "stay-amount", money(stay.amount));
    const payer = element("span", "stay-payer", stay.cardholder ? `Cartão de ${stay.cardholder}` : pending ? "Ainda não pago" : "Pago pelo grupo");
    const price = element("div", "stay-price");
    price.append(amount, payer);
    row.append(marker, info, timing, price);
    list.append(row);
  }
}

function renderTravelers() {
  const list = document.querySelector("#traveler-list");
  list.replaceChildren();

  for (const traveler of getBalances()) {
    const row = element("article", "traveler-row");
    const avatar = element("span", "traveler-avatar", traveler.name.split(" ").map((part) => part[0]).slice(0, 2).join(""));
    avatar.setAttribute("aria-hidden", "true");
    const identity = element("div", "traveler-identity");
    identity.append(element("strong", "traveler-name", traveler.name));
    identity.append(element("span", "traveler-detail", `Pagou ${money(traveler.paid)} · recebeu ${money(traveler.received)}`));
    const balance = showBalance(traveler.balance);
    const balanceNode = element("div", `traveler-balance ${balance.className}`);
    balanceNode.append(element("span", "", balance.label), element("strong", "", balance.amount));
    row.append(avatar, identity, balanceNode);
    list.append(row);
  }
}

function fillTravelerSelects() {
  const payer = document.querySelector("#payer-select");
  const recipient = document.querySelector("#recipient-select");
  const staySelect = document.querySelector("#stay-select");
  payer.replaceChildren();
  recipient.replaceChildren();
  staySelect.replaceChildren();
  staySelect.add(new Option("Todas as hospedagens", "all"));
  for (const stay of stays) staySelect.add(new Option(stay.name, stay.id));
  staySelect.value = "florence";
  for (const traveler of travelers) {
    payer.add(new Option(traveler.name, traveler.id));
    recipient.add(new Option(traveler.name, traveler.id));
  }
  recipient.add(new Option("Cartão / hotel", "hotel-provider"));
  payer.value = "person-1";
  recipient.value = "hotel-provider";
}

function monthLabel(value) {
  const date = new Date(`${value}-01T12:00:00`);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

function renderPayments() {
  const body = document.querySelector("#payments-body");
  const empty = document.querySelector("#payments-empty");
  body.replaceChildren();
  const sorted = [...state.payments].sort((a, b) => b.month.localeCompare(a.month) || b.createdAt - a.createdAt);

  for (const payment of sorted) {
    const row = document.createElement("tr");
    const month = element("td", "payment-month", monthLabel(payment.month));
    const payer = element("td", "payment-person", getTraveler(payment.from).name);
    const recipientName = payment.to === "hotel-provider" ? "Cartão / hotel" : getTraveler(payment.to).name;
    const recipient = element("td", "payment-person", recipientName);
    const stayName = payment.stayId === "all" ? "Todas as hospedagens" : stays.find((stay) => stay.id === payment.stayId).name;
    const stay = element("td", "payment-person", stayName);
    const amount = element("td", "payment-amount", money(payment.amount));
    const actionCell = document.createElement("td");
    const remove = element("button", "remove-payment", "Remover");
    remove.type = "button";
    remove.dataset.remove = payment.id;
    remove.setAttribute("aria-label", `Remover pagamento de ${getTraveler(payment.from).name} para ${recipientName}, ${stayName}, ${money(payment.amount)}`);
    actionCell.append(remove);
    row.append(month, payer, stay, recipient, amount, actionCell);
    body.append(row);
  }

  empty.hidden = sorted.length > 0;
  document.querySelector(".payment-table-wrap").classList.toggle("has-payments", sorted.length > 0);
  document.querySelector("#payment-count").textContent = `${sorted.length} ${sorted.length === 1 ? "registro" : "registros"}`;
}

function renderPlaces() {
  const list = document.querySelector("#itinerary-list");
  list.replaceChildren();
  for (const place of places) {
    const visited = state.visited.includes(place.id);
    const button = element("button", `itinerary-stop ${place.kind === "daytrip" ? "itinerary-daytrip" : ""}${visited ? " is-visited" : ""}`);
    button.type = "button";
    button.dataset.visit = place.id;
    button.setAttribute("aria-pressed", String(visited));
    const number = element("span", "stop-number", visited ? "✓" : place.number);
    const info = element("span", "stop-info");
    info.append(element("strong", "stop-name", place.name), element("small", "stop-note", place.note));
    const kind = element("span", "stop-kind", place.kind === "daytrip" ? "DIA" : "ROTA");
    button.append(number, info, kind);
    list.append(button);
  }

  renderMap();

  const placeCount = new Set(places.map((place) => place.id)).size;
  const visitedCount = state.visited.filter((id) => places.some((place) => place.id === id)).length;
  document.querySelector("#route-progress").textContent = `${visitedCount} de ${placeCount} lugares`;
}

function activateTab(id) {
  const selectedTab = document.querySelector(`.tab-button[data-tab="${id}"]`);
  if (!selectedTab) return;
  for (const tab of document.querySelectorAll(".tab-button")) {
    const active = tab === selectedTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  for (const panel of document.querySelectorAll(".tab-panel")) {
    panel.hidden = panel.dataset.panel !== id;
  }
}

function renderChecklist() {
  const list = document.querySelector("#checklist-list");
  list.replaceChildren();
  const completedCount = checklistItems.filter((item) => state.checklist.includes(item.id)).length;
  document.querySelector("#checklist-progress").textContent = `${completedCount} de ${checklistItems.length} concluídos`;

  for (const [index, item] of checklistItems.entries()) {
    const completed = state.checklist.includes(item.id);
    const button = element("button", `checklist-item${completed ? " is-complete" : ""}`);
    button.type = "button";
    button.dataset.check = item.id;
    button.setAttribute("role", "checkbox");
    button.setAttribute("aria-checked", String(completed));
    const marker = element("span", "checklist-marker", completed ? "✓" : String(index + 1).padStart(2, "0"));
    marker.setAttribute("aria-hidden", "true");
    button.append(marker, element("span", "checklist-label", item.label));
    list.append(button);
  }
}

function mapPoint([longitude, latitude]) {
  return [(longitude - 6.5) * 30 + 10, (47.2 - latitude) * 47 + 12];
}

function renderMap() {
  const land = document.querySelector("#map-land");
  const mainRoute = document.querySelector("#main-route");
  const daytripRoutes = document.querySelector("#daytrip-routes");
  const markers = document.querySelector("#map-markers");
  land.replaceChildren();
  daytripRoutes.replaceChildren();
  markers.replaceChildren();

  for (const ring of Object.values(italyCoast)) {
    const polygon = svgElement("polygon", {
      class: "land",
      points: ring.map((coordinate) => mapPoint(coordinate).join(",")).join(" ")
    });
    land.append(polygon);
  }

  const mainStops = places.filter((place) => place.kind === "principal");
  mainRoute.setAttribute("d", mainStops.map((place, index) => {
    const [x, y] = mapPoint(place.position);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" "));

  const base = places.find((place) => place.id === "florenca");
  for (const place of places.filter((stop) => stop.kind === "daytrip")) {
    const [startX, startY] = mapPoint(base.position);
    const [endX, endY] = mapPoint(place.position);
    daytripRoutes.append(svgElement("path", {
      class: "daytrip-route",
      d: `M${startX.toFixed(1)} ${startY.toFixed(1)} L${endX.toFixed(1)} ${endY.toFixed(1)}`
    }));
  }

  const mapPlaces = [...new Map(places.map((place) => [place.id, place])).values()];
  for (const place of mapPlaces) {
    const [x, y] = mapPoint(place.position);
    const visited = state.visited.includes(place.id);
    const marker = svgElement("g", {
      class: `map-marker${visited ? " is-visited" : ""}`,
      "data-place": place.id,
      role: "button",
      tabindex: "0",
      "aria-pressed": String(visited),
      "aria-label": `Marcar ${place.name} como ${visited ? "não visitada" : "visitada"}`
    });
    marker.append(
      svgElement("circle", { class: "marker-hit", cx: x, cy: y, r: 12 }),
      svgElement("circle", { class: "marker-halo", cx: x, cy: y, r: 10 }),
      svgElement("circle", { class: "marker-dot", cx: x, cy: y, r: 4.5 })
    );
    const [labelX, labelY] = place.label;
    marker.append(svgElement("line", {
      class: "label-leader",
      x1: x,
      y1: y,
      x2: x + labelX * 0.7,
      y2: y + labelY * 0.7
    }));
    const label = svgElement("text", {
      x: x + labelX * 0.7,
      y: y + labelY * 0.7,
      "text-anchor": labelX < 0 ? "end" : "start"
    });
    label.textContent = place.name;
    marker.append(label);
    markers.append(marker);
  }
}

function renderAll() {
  renderOverview();
  renderProgress();
  renderShareGuides();
  renderStays();
  renderTravelers();
  renderPayments();
  renderPlaces();
  renderChecklist();
}

function validateState(value, configuration = { travelers, stays }) {
  if (!value || ![1, 2, 3].includes(value.version) || !Array.isArray(value.payments) || !Array.isArray(value.visited)) {
    throw new Error("O arquivo não tem um formato de dados reconhecido.");
  }

  const ids = new Set();
  const validPayments = value.payments.map((payment) => {
    if (!payment) throw new Error("O arquivo contém um pagamento inválido.");
    const legacy = value.version === 1;
    const stayId = legacy
      ? payment.to === "loreto-provider" ? "loreto" : "all"
      : payment.stayId;
    const recipient = payment.to === "loreto-provider" ? "hotel-provider" : payment.to;
    if (
      !payment || typeof payment.id !== "string" || !payment.id ||
      !/^\d{4}-\d{2}$/.test(payment.month) ||
      Number(payment.month.slice(5, 7)) < 1 || Number(payment.month.slice(5, 7)) > 12 ||
      !configuration.travelers.some((traveler) => traveler.id === payment.from) ||
      (recipient !== "hotel-provider" && !configuration.travelers.some((traveler) => traveler.id === recipient)) ||
      (recipient !== "hotel-provider" && payment.from === recipient) ||
      (stayId !== "all" && !configuration.stays.some((stay) => stay.id === stayId)) ||
      !Number.isSafeInteger(payment.amount) || payment.amount <= 0 ||
      !Number.isSafeInteger(payment.createdAt)
    ) {
      throw new Error("O arquivo contém um pagamento inválido.");
    }
    if (ids.has(payment.id)) throw new Error("O arquivo contém pagamentos duplicados.");
    ids.add(payment.id);
    return { id: payment.id, month: payment.month, from: payment.from, to: recipient, stayId, amount: payment.amount, createdAt: payment.createdAt };
  });

  const validVisited = [...new Set(value.visited)];
  if (validVisited.some((id) => !places.some((place) => place.id === id))) {
    throw new Error("O arquivo contém uma cidade desconhecida.");
  }
  const validChecklist = value.checklist === undefined ? [] : value.checklist;
  if (
    !Array.isArray(validChecklist) ||
    validChecklist.some((id) => typeof id !== "string" || !checklistItems.some((item) => item.id === id)) ||
    new Set(validChecklist).size !== validChecklist.length
  ) {
    throw new Error("O arquivo contém uma tarefa inválida.");
  }
  return { version: 3, payments: validPayments, visited: validVisited, checklist: validChecklist };
}

function saveState(nextState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
    return true;
  } catch {
    setSaveStatus("Não foi possível salvar", true);
    setMessage("O navegador não conseguiu salvar as alterações. Verifique o espaço disponível e tente novamente.", "error");
    return false;
  }
}

function updateState(nextState, successMessage) {
  state.payments = nextState.payments;
  state.visited = nextState.visited;
  state.checklist = nextState.checklist;
  const snapshot = { payments: [...nextState.payments], visited: [...nextState.visited], checklist: [...nextState.checklist] };
  saveState({ version: 3, ...snapshot });
  renderAll();
  if (!activeCode) {
    setMessage("Digite o código do grupo para salvar alterações.", "error");
    return Promise.resolve(false);
  }

  const generation = syncGeneration;
  pendingWrites += 1;
  setSaveStatus("Sincronizando...");
  saveQueue = saveQueue.then(async () => {
    try {
      if (generation !== syncGeneration) return;
      const result = await window.TripSync.save(activeCode, snapshot, serverRevision);
      if (generation !== syncGeneration) return;
      serverRevision = result.revision;
      lastConfirmedState = snapshot;
      saveState({ version: 3, ...snapshot });
      setSaveStatus("Sincronizado com o grupo");
      if (successMessage) setMessage(successMessage, "success");
      return true;
    } catch (error) {
      if (generation !== syncGeneration) return;
      const failedCode = activeCode;
      syncGeneration += 1;
      pendingWrites = 0;
      try {
        const latest = await window.TripSync.load(failedCode);
        serverRevision = latest.revision;
        state.payments = latest.payments;
        state.visited = latest.visited;
        state.checklist = latest.checklist;
        lastConfirmedState = { payments: [...latest.payments], visited: [...latest.visited], checklist: [...latest.checklist] };
      } catch {
        state.payments = [...lastConfirmedState.payments];
        state.visited = [...lastConfirmedState.visited];
        state.checklist = [...lastConfirmedState.checklist];
      }
      saveState({ version: 3, payments: [...state.payments], visited: [...state.visited], checklist: [...state.checklist] });
      renderAll();
      setSaveStatus("Sincronização não concluída", true);
      setMessage(`${error.message} Suas alterações não foram aplicadas; os dados confirmados foram mantidos.`, "error");
      return false;
    } finally {
      if (generation === syncGeneration) pendingWrites = Math.max(0, pendingWrites - 1);
    }
  });
  return saveQueue;
}

function applyRemoteState(remote) {
  if (
    !remote || !Number.isSafeInteger(remote.revision) || remote.revision < 0 ||
    !Array.isArray(remote.payments) || !Array.isArray(remote.visited) ||
    !remote.settings || typeof remote.settings !== "object"
  ) {
    throw new Error("O servidor enviou dados em um formato inesperado.");
  }
  if (!Array.isArray(remote.checklist)) {
    throw new Error("O checklist ainda não está habilitado no servidor. Aplique a migração do Supabase e publique a função atualizada.");
  }
  const settings = validateSettings(remote.settings);
  const valid = validateState({ version: 3, payments: remote.payments, visited: remote.visited, checklist: remote.checklist }, settings);
  travelers = settings.travelers;
  stays = settings.stays;
  shareGuides = settings.shareGuides;
  fillTravelerSelects();
  totalCost = stays.reduce((sum, stay) => sum + stay.amount, 0);
  shareCost = Math.round(totalCost / travelers.length);
  serverRevision = remote.revision;
  state.payments = valid.payments;
  state.visited = valid.visited;
  state.checklist = valid.checklist;
  lastConfirmedState = { payments: [...valid.payments], visited: [...valid.visited], checklist: [...valid.checklist] };
  saveState({ version: 3, payments: [...valid.payments], visited: [...valid.visited], checklist: [...valid.checklist] });
  renderAll();
}

function validateSettings(value) {
  if (
    !Array.isArray(value.travelers) || value.travelers.length !== 5 ||
    !Array.isArray(value.stays) || value.stays.length !== 4 ||
    !Array.isArray(value.shareGuides) || value.shareGuides.length !== 4
  ) {
    throw new Error("A configuração privada da viagem está incompleta.");
  }
  const travelerIds = new Set();
  const validatedTravelers = value.travelers.map((traveler) => {
    if (
      !traveler || typeof traveler.id !== "string" || !/^person-[1-5]$/.test(traveler.id) ||
      travelerIds.has(traveler.id) || typeof traveler.name !== "string" || !traveler.name.trim()
    ) throw new Error("A lista privada de viajantes não é válida.");
    travelerIds.add(traveler.id);
    return { id: traveler.id, name: traveler.name.trim() };
  });

  const stayIds = new Set();
  const validatedStays = value.stays.map((stay) => {
    if (
      !stay || typeof stay.id !== "string" || !["san-marino", "loreto", "florence", "rome"].includes(stay.id) ||
      stayIds.has(stay.id) || typeof stay.name !== "string" || !stay.name.trim() ||
      typeof stay.detail !== "string" || typeof stay.dates !== "string" ||
      !Number.isSafeInteger(stay.amount) || stay.amount <= 0 ||
      (stay.cardholder !== null && typeof stay.cardholder !== "string") ||
      typeof stay.installments !== "string"
    ) throw new Error("A lista privada de hospedagens não é válida.");
    stayIds.add(stay.id);
    return { ...stay, name: stay.name.trim() };
  });

  const validatedGuides = value.shareGuides.map((guide) => {
    if (
      !guide || !stayIds.has(guide.stayId) ||
      !Number.isSafeInteger(guide.total) || guide.total <= 0 ||
      (guide.installments !== null && (!Number.isSafeInteger(guide.installments) || guide.installments <= 0)) ||
      (guide.monthly !== null && (!Number.isSafeInteger(guide.monthly) || guide.monthly <= 0)) ||
      typeof guide.payer !== "string"
    ) throw new Error("O guia de rateio privado não é válido.");
    return guide;
  });

  if (validatedStays.reduce((sum, stay) => sum + stay.amount, 0) <= 0) {
    throw new Error("O total das hospedagens não é válido.");
  }
  return { travelers: validatedTravelers, stays: validatedStays, shareGuides: validatedGuides };
}

async function enterGroup(code) {
  const accessMessage = document.querySelector("#access-message");
  const submit = document.querySelector("#access-form button[type='submit']");
  if (!window.TripSync.isConfigured()) {
    accessMessage.textContent = "O acesso compartilhado ainda não está configurado. Faltam os dados de conexão do Supabase.";
    return;
  }

  submit.disabled = true;
  accessMessage.textContent = "Verificando o código...";
  try {
    const remote = await window.TripSync.load(code);
    applyRemoteState(remote);
    activeCode = code;
    sessionStorage.setItem("andiamo-group-code", code);
    document.querySelector("#access-screen").hidden = true;
    document.querySelector("#trip-app").hidden = false;
    setSaveStatus("Sincronizado com o grupo");
    accessMessage.textContent = "";
  } catch (error) {
    sessionStorage.removeItem("andiamo-group-code");
    accessMessage.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
}

function startRemoteRefresh() {
  window.setInterval(async () => {
    if (!activeCode || pendingWrites > 0) return;
    try {
      const remote = await window.TripSync.load(activeCode);
      if (remote.revision !== serverRevision) {
        applyRemoteState(remote);
        setSaveStatus("Atualizado com o grupo");
      }
    } catch {
      setSaveStatus("Sem conexão com o servidor", true);
    }
  }, 30000);
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addPayment(event) {
  event.preventDefault();
  const from = document.querySelector("#payer-select").value;
  const to = document.querySelector("#recipient-select").value;
  const stayId = document.querySelector("#stay-select").value;
  const month = document.querySelector("#month-input").value;
  const amount = Math.round(Number(document.querySelector("#amount-input").value) * 100);
  if (to !== "hotel-provider" && from === to) {
    setMessage("Escolha duas pessoas diferentes para registrar o pagamento.", "error");
    return;
  }
  if (!month || !Number.isSafeInteger(amount) || amount <= 0) {
    setMessage("Informe o mês e um valor maior que zero.", "error");
    return;
  }
  if (stayId === "loreto" && to === "hotel-provider" && amount > getLoretoDue()) {
    setMessage(`O pagamento ultrapassa o saldo pendente de Loreto (${money(getLoretoDue())}).`, "error");
    return;
  }

  const payment = { id: makeId(), month, from, to, stayId, amount, createdAt: Date.now() };
  updateState({ version: 3, payments: [...state.payments, payment], visited: [...state.visited], checklist: [...state.checklist] }, "Pagamento registrado.")
    .then((saved) => {
      if (saved) document.querySelector("#amount-input").value = "";
    });
}

function toggleVisited(id) {
  const visited = state.visited.includes(id)
    ? state.visited.filter((placeId) => placeId !== id)
    : [...state.visited, id];
  updateState({ version: 3, payments: [...state.payments], visited, checklist: [...state.checklist] }, "Roteiro atualizado.");
}

function toggleChecklistItem(id) {
  const checklist = state.checklist.includes(id)
    ? state.checklist.filter((itemId) => itemId !== id)
    : [...state.checklist, id];
  updateState({ version: 3, payments: [...state.payments], visited: [...state.visited], checklist }, "Lista atualizada para o grupo.");
}

document.querySelector("#access-form").addEventListener("submit", (event) => {
  event.preventDefault();
  enterGroup(document.querySelector("#access-code").value.trim());
});
document.querySelector("#payment-form").addEventListener("submit", addPayment);
document.querySelector("#payments-body").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  const nextPayments = state.payments.filter((payment) => payment.id !== button.dataset.remove);
  updateState({ version: 3, payments: nextPayments, visited: [...state.visited], checklist: [...state.checklist] }, "Pagamento removido.");
});
document.querySelector("#itinerary-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-visit]");
  if (button) toggleVisited(button.dataset.visit);
});
document.querySelector("#checklist-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-check]");
  if (button) toggleChecklistItem(button.dataset.check);
});
document.querySelector(".tab-nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (button) activateTab(button.dataset.tab);
});
document.querySelector(".tab-nav").addEventListener("keydown", (event) => {
  const buttons = [...document.querySelectorAll(".tab-button")];
  const current = buttons.indexOf(event.target);
  if (current < 0) return;
  let next = current;
  if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
  else if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = buttons.length - 1;
  else return;
  event.preventDefault();
  buttons[next].focus();
  activateTab(buttons[next].dataset.tab, true);
});
document.querySelector(".hero-details a").addEventListener("click", () => activateTab("payments"));
document.querySelector(".italy-map").addEventListener("click", (event) => {
  const marker = event.target.closest("[data-place]");
  if (marker) toggleVisited(marker.dataset.place);
});
document.querySelector(".italy-map").addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".map-marker")) {
    event.preventDefault();
    toggleVisited(event.target.dataset.place);
  }
});
document.querySelector("#lock-button").addEventListener("click", () => {
  sessionStorage.removeItem("andiamo-group-code");
  window.location.reload();
});

const currentMonth = new Date();
document.querySelector("#month-input").value = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
startRemoteRefresh();
const savedCode = sessionStorage.getItem("andiamo-group-code");
if (savedCode) enterGroup(savedCode);

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.error("Não foi possível preparar a instalação do app.", error);
  });
}
