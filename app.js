const products = [
  {id:1,name:"Playera básica vintage",cat:"Playeras",brand:"Vintage",price:120,size:"M",condition:"Muy buen estado",seller:"Valeria",initial:"V",swap:true,created:8,badge:"Hallazgo vintage",img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85",desc:"Playera de algodón en color claro. Tiene poco uso y no presenta manchas ni daños."},
  {id:2,name:"Jeans rectos azul clásico",cat:"Pantalones",brand:"Denim",price:220,size:"28",condition:"Buen estado",seller:"Mariana",initial:"M",swap:false,created:7,badge:"Básico esencial",img:"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=85",desc:"Jeans de corte recto en mezclilla azul, cómodos para uso diario."},
  {id:3,name:"Chamarra de mezclilla",cat:"Chamarras",brand:"Denim",price:350,size:"L",condition:"Muy buen estado",seller:"Andrea",initial:"A",swap:true,created:6,badge:"Acepta intercambio",img:"https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=85",desc:"Chamarra de mezclilla azul, limpia y en muy buenas condiciones."},
  {id:4,name:"Tenis urbanos blancos",cat:"Calzado",brand:"Urbano",price:400,size:"24",condition:"Buen estado",seller:"Diego",initial:"D",swap:false,created:5,badge:"Precio especial",img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",desc:"Tenis de estilo urbano con señales normales de uso."},
  {id:5,name:"Bolsa casual color café",cat:"Accesorios",brand:"Accesorios",price:180,size:"Única",condition:"Muy buen estado",seller:"Fernanda",initial:"F",swap:true,created:4,badge:"Acepta intercambio",img:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",desc:"Bolsa casual en tono café, con cierres y asas en buen estado."},
  {id:6,name:"Suéter tejido beige",cat:"Playeras",brand:"Casual",price:190,size:"S",condition:"Como nuevo",seller:"Sofía",initial:"S",swap:false,created:3,badge:"Como nuevo",img:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=85",desc:"Suéter tejido beige, suave y cómodo, en excelentes condiciones."},
  {id:7,name:"Pantalón cargo verde",cat:"Pantalones",brand:"Streetwear",price:260,size:"30",condition:"Buen estado",seller:"Luis",initial:"L",swap:true,created:2,badge:"Estilo urbano",img:"https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=700&q=85",desc:"Pantalón cargo verde con bolsillos laterales, ideal para un estilo urbano."},
  {id:8,name:"Camisa oversize blanca",cat:"Playeras",brand:"Minimal",price:150,size:"XL",condition:"Muy buen estado",seller:"Camila",initial:"C",swap:false,created:1,badge:"Estilo minimal",img:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=85",desc:"Camisa blanca de corte amplio, versátil y en muy buenas condiciones."}
];

const USER_PRODUCTS_KEY = "revesti-user-products";
const FAVS_KEY = "revesti-favs";
const PURCHASES_KEY = "revesti-simulated-purchases";
const EXCHANGES_KEY = "revesti-exchange-proposals";
const $ = selector => document.querySelector(selector);
const state = {cat:"Todas",size:"Todas",price:1000,swap:false,search:"",sort:"recommended",favs:false,selected:null,exchangeTarget:null};
let toastTimer;

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function getFavs() { return readArray(FAVS_KEY); }
function getPurchases() { return readArray(PURCHASES_KEY); }
function getExchangeProposals() { return readArray(EXCHANGES_KEY); }
function isSold(product) { return getPurchases().some(record => String(record.productId) === String(product.id) && record.status === "confirmed"); }
function isExchanged(product) { return getExchangeProposals().some(record => String(record.productId) === String(product.id) && record.status === "accepted"); }
function isUnavailable(product) { return isSold(product) || isExchanged(product); }
function acceptsExchange(product) { return Boolean(product.swap || product.listingType === "swap" || product.listingType === "both"); }
function updateExchangeCount() {
  const count = getExchangeProposals().filter(record => record.status === "pending").length;
  const badge = $("#exchange-count");
  if (badge) badge.textContent = count;
}
function getUserProducts() { return readArray(USER_PRODUCTS_KEY); }
function getAllProducts() { return [...getUserProducts().slice().reverse(), ...products]; }
function money(n) {
  return new Intl.NumberFormat("es-MX", {style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function productPrice(product) {
  return product.listingType === "swap" ? "Solo intercambio" : money(product.price);
}
function productMode(product) {
  if (product.listingType === "swap") return "Solo intercambio";
  if (product.listingType === "both" || (!product.listingType && product.swap)) return "Venta o intercambio";
  return "Solo venta";
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2800);
}
function filtered() {
  const favs = getFavs();
  let list = getAllProducts().filter(product =>
    (state.cat === "Todas" || product.cat === state.cat) &&
    (state.size === "Todas" || product.size === state.size) &&
    (product.listingType === "swap" || product.price <= state.price) &&
    (!state.swap || product.swap) &&
    (!state.favs || favs.includes(product.id)) &&
    (!state.search || `${product.name} ${product.cat} ${product.brand} ${product.seller}`.toLowerCase().includes(state.search))
  );
  if (state.sort === "low") list.sort((a,b) => (a.listingType === "swap" ? 0 : a.price) - (b.listingType === "swap" ? 0 : b.price));
  if (state.sort === "high") list.sort((a,b) => (b.listingType === "swap" ? 0 : b.price) - (a.listingType === "swap" ? 0 : a.price));
  if (state.sort === "new") list.sort((a,b) => {
    if (a.isUserListing && b.isUserListing) return b.createdAt - a.createdAt;
    if (a.isUserListing) return -1;
    if (b.isUserListing) return 1;
    return a.created - b.created;
  });
  return list;
}
function render() {
  const list = filtered();
  const favs = getFavs();
  $("#grid").innerHTML = list.map(product => {
    const isFav = favs.includes(product.id);
    const sold = isSold(product);
    const exchanged = isExchanged(product);
    const unavailable = sold || exchanged;
    const badge = sold ? "Vendida" : exchanged ? "Intercambio acordado" : (product.badge || (product.isUserListing ? "Nueva publicación" : "Prenda disponible"));
    return `<article class="card ${unavailable ? "sold-card" : ""} ${exchanged ? "exchanged-card" : ""}">
      <div class="photo" data-open="${product.id}">
        <img src="${product.img}" alt="${escapeHTML(product.name)}" loading="lazy">
        <span class="badge ${unavailable ? "sold-badge" : ""}">${escapeHTML(badge)}</span>
        ${product.swap && !unavailable ? '<span class="swap-badge">↻ Acepta intercambio</span>' : ""}
        ${unavailable ? `<span class="sold-overlay">${sold ? "Prenda vendida" : "Intercambio acordado"}</span>` : ""}
        <button class="heart ${isFav ? "on" : ""}" data-fav="${product.id}" aria-label="Guardar favorito">${isFav ? "♥" : "♡"}</button>
      </div>
      <div class="meta"><span>${escapeHTML(product.cat)} · ${escapeHTML(product.brand || "Sin marca")}</span><span>Hermosillo</span></div>
      <h3>${escapeHTML(product.name)}</h3>
      <div class="price-row"><span class="price ${product.listingType === "swap" ? "trade-price" : ""} ${unavailable ? "sold-price" : ""}">${sold ? "Vendida" : exchanged ? "Intercambio acordado" : escapeHTML(productPrice(product))}</span><span class="size-label">Talla ${escapeHTML(product.size)}</span></div>
      <button class="view" data-open="${product.id}">${sold ? "Ver publicación ↗" : "Ver detalles ↗"}</button>
    </article>`;
  }).join("");
  $("#results").textContent = `Mostrando ${list.length} ${list.length === 1 ? "prenda" : "prendas"}`;
  $("#grid").classList.toggle("hidden", !list.length);
  $("#empty").classList.toggle("hidden", !!list.length);
  $("#fav-count").textContent = favs.length;
  $("#fav-filter").textContent = state.favs ? "♡ Ver catálogo" : "♡ Ver favoritos";
  updateExchangeCount();
}
function setCat(category) {
  state.cat = category;
  document.querySelectorAll("[data-cat]").forEach(button => button.classList.toggle("selected", button.dataset.cat === category));
  render();
}
function toggleFav(id) {
  let favs = getFavs();
  favs = favs.includes(id) ? favs.filter(item => item !== id) : [...favs, id];
  try { localStorage.setItem(FAVS_KEY, JSON.stringify(favs)); }
  catch { toast("No se pudo guardar el favorito en este navegador."); return; }
  render();
  if (state.selected === id) updateModalFav();
  toast(favs.includes(id) ? "Guardado en tus favoritos." : "Eliminado de tus favoritos.");
}
function updateModalFav() {
  $("#modal-fav").textContent = getFavs().includes(state.selected) ? "♥ Guardado" : "♡ Guardar";
}
function openProduct(id) {
  const product = getAllProducts().find(item => item.id === id);
  if (!product) return;
  state.selected = id;
  $("#modal-img").src = product.img;
  $("#modal-img").alt = product.name;
  $("#modal-cat").textContent = `${product.cat} · ${product.brand || "Sin marca"}`.toUpperCase();
  $("#modal-name").textContent = product.name;
  const sold = isSold(product);
  const exchanged = isExchanged(product);
  const unavailable = sold || exchanged;
  const exchangeOnly = product.listingType === "swap";
  const canExchange = acceptsExchange(product);
  $("#modal-price").textContent = sold ? "Prenda vendida" : exchanged ? "Intercambio acordado" : productPrice(product);
  $("#modal-tags").innerHTML = [
    `Talla ${product.size}`,
    product.condition,
    productMode(product),
    ...(sold ? ["No disponible"] : exchanged ? ["Intercambio acordado"] : [])
  ].map(tag => `<span>${escapeHTML(tag)}</span>`).join("");
  $("#modal-desc").textContent = product.desc;
  $("#seller-name").textContent = product.seller;
  $("#seller-initial").textContent = product.initial;
  $("#modal-availability").textContent = sold
    ? "Esta publicación ya fue marcada como vendida y no está disponible."
    : exchanged
      ? "El propietario ya aceptó una propuesta de intercambio. Esta publicación dejó de estar disponible."
      : exchangeOnly
        ? "Esta prenda se ofrece únicamente para intercambio. Puedes enviar una propuesta con los detalles de la prenda que ofreces."
        : canExchange
          ? "Disponible para compra o intercambio. Puedes simular una compra o enviar una propuesta de intercambio."
          : "Disponible para compra. La confirmación es una simulación académica, sin pagos reales.";
  $("#interest").classList.toggle("hidden", unavailable || exchangeOnly);
  $("#interest").disabled = exchangeOnly || unavailable;
  $("#interest").textContent = "Simular compra ↗";
  $("#propose-exchange").classList.toggle("hidden", unavailable || !canExchange);
  $("#reactivate").classList.toggle("hidden", !unavailable);
  updateModalFav();
  $("#modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#modal").classList.add("hidden");
  document.body.style.overflow = "";
  state.selected = null;
}
function openPurchaseModal() {
  const product = getAllProducts().find(item => item.id === state.selected);
  if (!product) return;
  if (isSold(product) || isExchanged(product)) { toast("Esta prenda ya no está disponible."); return; }
  if (product.listingType === "swap") { toast("Esta publicación es únicamente para intercambio."); return; }
  $("#purchase-product-name").textContent = product.name;
  $("#purchase-product-price").textContent = productPrice(product);
  $("#purchase-product-seller").textContent = product.seller;
  $("#purchase-buyer").value = "";
  $("#purchase-modal").classList.remove("hidden");
  $("#purchase-buyer").focus();
}
function closePurchaseModal() {
  $("#purchase-modal").classList.add("hidden");
  if (!$("#modal").classList.contains("hidden")) document.body.style.overflow = "hidden";
  else document.body.style.overflow = "";
}
function reactivateSelectedProduct() {
  const product = getAllProducts().find(item => item.id === state.selected);
  if (!product || !isUnavailable(product)) return;
  try {
    const purchases = getPurchases().map(record =>
      String(record.productId) === String(product.id) && record.status === "confirmed"
        ? {...record, status:"reactivated", reactivatedAt:Date.now()}
        : record
    );
    const exchanges = getExchangeProposals().map(record =>
      String(record.productId) === String(product.id) && record.status === "accepted"
        ? {...record, status:"reactivated", reactivatedAt:Date.now()}
        : record
    );
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(exchanges));
    closeModal();
    render();
    toast("La publicación volvió a estar disponible.");
  } catch {
    toast("No se pudo reactivar la publicación en este navegador.");
  }
}

function openExchangeModal() {
  const product = getAllProducts().find(item => item.id === state.selected);
  if (!product || !acceptsExchange(product) || isUnavailable(product)) return;
  state.exchangeTarget = product.id;
  $("#exchange-target-name").textContent = product.name;
  $("#exchange-target-seller").textContent = `Publicada por ${product.seller} · Hermosillo`;
  $("#exchange-form").reset();
  $("#exchange-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  $("#exchange-proposer").focus();
}
function closeExchangeModal() {
  $("#exchange-modal").classList.add("hidden");
  document.body.style.overflow = $("#modal").classList.contains("hidden") ? "" : "hidden";
  state.exchangeTarget = null;
}
function renderExchangeInbox() {
  const proposals = getExchangeProposals().slice().sort((a,b) => b.createdAt - a.createdAt);
  const container = $("#exchange-inbox-list");
  if (!proposals.length) {
    container.innerHTML = `<div class="exchange-empty"><span>↻</span><h3>Aún no hay propuestas</h3><p>Cuando alguien proponga intercambiar una prenda, aparecerá aquí para que puedas revisarla.</p></div>`;
    return;
  }
  container.innerHTML = proposals.map(proposal => {
    const product = getAllProducts().find(item => String(item.id) === String(proposal.productId));
    const unavailable = !product || isUnavailable(product);
    const status = proposal.status === "accepted" ? "Aceptada" : proposal.status === "rejected" ? "Rechazada" : proposal.status === "reactivated" ? "Reactivada" : unavailable ? "Prenda no disponible" : "Pendiente";
    const statusClass = proposal.status === "accepted" ? "accepted" : proposal.status === "rejected" ? "rejected" : proposal.status === "reactivated" ? "reactivated" : "pending";
    const date = proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString("es-MX", {day:"numeric",month:"short",year:"numeric"}) : "";
    const canDecide = proposal.status === "pending" && !unavailable;
    const note = proposal.decisionNote ? `<p class="exchange-decision-note">${escapeHTML(proposal.decisionNote)}</p>` : "";
    return `<article class="exchange-card">
      <div class="exchange-card-head"><div><p class="eyebrow">PROPUESTA PARA</p><h3>${escapeHTML(proposal.productName)}</h3><small>Publicada por ${escapeHTML(proposal.productSeller)}</small></div><span class="exchange-status ${statusClass}">${status}</span></div>
      <div class="exchange-offer"><span>Prenda que ofrecen a cambio</span><strong>${escapeHTML(proposal.offerName)}</strong><small>${escapeHTML(proposal.offerCategory)} · Talla ${escapeHTML(proposal.offerSize)} · ${escapeHTML(proposal.offerCondition)}</small><p>${escapeHTML(proposal.offerDescription)}</p></div>
      <div class="exchange-card-meta"><span>Propuesta de <b>${escapeHTML(proposal.proposer)}</b></span><span>${date}</span></div>
      ${note}
      ${canDecide ? `<div class="exchange-card-actions"><button class="btn dark" data-exchange-accept="${proposal.id}">Aceptar intercambio</button><button class="btn outline" data-exchange-reject="${proposal.id}">Rechazar</button></div>` : ""}
      ${proposal.status === "pending" && unavailable ? `<p class="exchange-decision-note">La publicación ya no está disponible para aceptar esta propuesta.</p>` : ""}
    </article>`;
  }).join("");
}
function openExchangeInbox() {
  renderExchangeInbox();
  $("#exchange-inbox-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeExchangeInbox() {
  $("#exchange-inbox-modal").classList.add("hidden");
  document.body.style.overflow = "";
}
function acceptExchangeProposal(id) {
  const proposals = getExchangeProposals();
  const proposal = proposals.find(item => String(item.id) === String(id));
  if (!proposal || proposal.status !== "pending") return;
  const product = getAllProducts().find(item => String(item.id) === String(proposal.productId));
  if (!product || isUnavailable(product)) { toast("Esta publicación ya no está disponible."); renderExchangeInbox(); return; }
  const updated = proposals.map(item => {
    if (String(item.id) === String(id)) return {...item, status:"accepted", decidedAt:Date.now()};
    if (String(item.productId) === String(proposal.productId) && item.status === "pending") {
      return {...item, status:"rejected", decidedAt:Date.now(), decisionNote:"La prenda ya fue comprometida en otro intercambio."};
    }
    return item;
  });
  try {
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(updated));
    render();
    renderExchangeInbox();
    toast("¡Intercambio aceptado! La publicación ya no está disponible.");
  } catch {
    toast("No se pudo guardar la decisión en este navegador.");
  }
}
function rejectExchangeProposal(id) {
  const updated = getExchangeProposals().map(item => String(item.id) === String(id) && item.status === "pending"
    ? {...item, status:"rejected", decidedAt:Date.now(), decisionNote:"El propietario rechazó esta propuesta."}
    : item);
  try {
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(updated));
    renderExchangeInbox();
    updateExchangeCount();
    toast("La propuesta fue rechazada.");
  } catch {
    toast("No se pudo guardar la decisión en este navegador.");
  }
}
function clearFilters() {
  state.cat = "Todas";
  state.size = "Todas";
  state.price = 1000;
  state.swap = false;
  state.search = "";
  state.sort = "recommended";
  state.favs = false;
  $("#search").value = "";
  $("#size").value = "Todas";
  $("#price").value = 1000;
  $("#price-label").textContent = "$1,000+";
  $("#swap").checked = false;
  $("#sort").value = "recommended";
  setCat("Todas");
}

function openPublishModal() {
  $("#publish-modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  $("#listing-name").focus();
}
function closePublishModal() {
  $("#publish-modal").classList.add("hidden");
  document.body.style.overflow = "";
}
function resetPublishForm() {
  $("#publish-form").reset();
  $("#publish-preview").classList.add("hidden");
  $("#publish-preview-img").removeAttribute("src");
  updatePriceRequirement();
}
function updatePriceRequirement() {
  const exchangeOnly = $("#listing-type").value === "swap";
  const priceInput = $("#listing-price");
  priceInput.disabled = exchangeOnly;
  priceInput.required = !exchangeOnly;
  priceInput.placeholder = exchangeOnly ? "No aplica" : "Ej. 150";
  if (exchangeOnly) priceInput.value = "";
  $("#price-help").textContent = exchangeOnly ? "Para intercambio no necesitas indicar un precio." : "Indica el precio en pesos mexicanos.";
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}
async function compressImage(file) {
  const dataUrl = await readImage(file);
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error("El archivo seleccionado no es una imagen válida."));
    image.src = dataUrl;
  });
  const maxSide = 1000;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No fue posible procesar la imagen en este navegador.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-cat]");
  if (button) setCat(button.dataset.cat);
});
$("#search").addEventListener("input", event => { state.search = event.target.value.toLowerCase().trim(); render(); });
$("#size").addEventListener("change", event => { state.size = event.target.value; render(); });
$("#price").addEventListener("input", event => {
  state.price = Number(event.target.value);
  $("#price-label").textContent = state.price === 1000 ? "$1,000+" : money(state.price);
  render();
});
$("#swap").addEventListener("change", event => { state.swap = event.target.checked; render(); });
$("#sort").addEventListener("change", event => { state.sort = event.target.value; render(); });
$("#clear").addEventListener("click", clearFilters);
$("#empty-clear").addEventListener("click", clearFilters);
$("#fav-filter").addEventListener("click", () => { state.favs = !state.favs; render(); });
$("#show-favs").addEventListener("click", () => { state.favs = true; render(); $("#catalogo").scrollIntoView({behavior:"smooth"}); });
$("#grid").addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-fav]");
  if (favoriteButton) { event.stopPropagation(); toggleFav(Number(favoriteButton.dataset.fav)); return; }
  const openButton = event.target.closest("[data-open]");
  if (openButton) openProduct(Number(openButton.dataset.open));
});
$("#close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", event => { if (event.target === $("#modal")) closeModal(); });
$("#modal-fav").addEventListener("click", () => { if (state.selected !== null) toggleFav(state.selected); });
$("#interest").addEventListener("click", openPurchaseModal);
$("#reactivate").addEventListener("click", reactivateSelectedProduct);
$("#purchase-close").addEventListener("click", closePurchaseModal);
$("#purchase-cancel").addEventListener("click", closePurchaseModal);
$("#purchase-modal").addEventListener("click", event => {
  if (event.target === $("#purchase-modal")) closePurchaseModal();
});
$("#purchase-form").addEventListener("submit", event => {
  event.preventDefault();
  const product = getAllProducts().find(item => item.id === state.selected);
  if (!product) { closePurchaseModal(); return; }
  if (isSold(product) || isExchanged(product)) { closePurchaseModal(); toast("Esta prenda ya no está disponible."); return; }
  if (product.listingType === "swap") { closePurchaseModal(); toast("Esta publicación es únicamente para intercambio."); return; }
  const buyer = $("#purchase-buyer").value.trim();
  if (!buyer) { $("#purchase-buyer").focus(); return; }
  try {
    const records = getPurchases();
    records.push({
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      price: product.price,
      seller: product.seller,
      buyer,
      status: "confirmed",
      createdAt: Date.now()
    });
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(records));
    const remainingProposals = getExchangeProposals().map(record =>
      String(record.productId) === String(product.id) && record.status === "pending"
        ? {...record, status:"rejected", decidedAt:Date.now(), decisionNote:"La publicación fue vendida y ya no está disponible para intercambio."}
        : record
    );
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(remainingProposals));
    closePurchaseModal();
    closeModal();
    render();
    toast("Compra simulada confirmada. La publicación ahora aparece como vendida.");
  } catch (error) {
    console.error(error);
    toast("No se pudo guardar la simulación. Inténtalo de nuevo.");
  }
});

$("#propose-exchange").addEventListener("click", openExchangeModal);
$("#exchange-close").addEventListener("click", closeExchangeModal);
$("#exchange-cancel").addEventListener("click", closeExchangeModal);
$("#exchange-modal").addEventListener("click", event => { if (event.target === $("#exchange-modal")) closeExchangeModal(); });
$("#exchange-form").addEventListener("submit", event => {
  event.preventDefault();
  const product = getAllProducts().find(item => String(item.id) === String(state.exchangeTarget));
  if (!product || isUnavailable(product) || !acceptsExchange(product)) { toast("Esta prenda ya no está disponible para intercambio."); closeExchangeModal(); return; }
  const proposal = {
    id: Date.now(),
    productId: product.id,
    productName: product.name,
    productSeller: product.seller,
    proposer: $("#exchange-proposer").value.trim(),
    offerName: $("#exchange-offer-name").value.trim(),
    offerCategory: $("#exchange-offer-category").value,
    offerSize: $("#exchange-offer-size").value,
    offerCondition: $("#exchange-offer-condition").value,
    offerDescription: $("#exchange-offer-description").value.trim(),
    status: "pending",
    createdAt: Date.now()
  };
  try {
    const proposals = getExchangeProposals();
    proposals.push(proposal);
    localStorage.setItem(EXCHANGES_KEY, JSON.stringify(proposals));
    closeExchangeModal();
    closeModal();
    render();
    toast("¡Propuesta enviada! Puedes revisarla desde Intercambios.");
  } catch {
    toast("No se pudo guardar la propuesta en este navegador.");
  }
});
$("#show-exchanges").addEventListener("click", openExchangeInbox);
$("#exchange-inbox-close").addEventListener("click", closeExchangeInbox);
$("#exchange-inbox-modal").addEventListener("click", event => { if (event.target === $("#exchange-inbox-modal")) closeExchangeInbox(); });
$("#exchange-inbox-list").addEventListener("click", event => {
  const acceptButton = event.target.closest("[data-exchange-accept]");
  if (acceptButton) { acceptExchangeProposal(acceptButton.dataset.exchangeAccept); return; }
  const rejectButton = event.target.closest("[data-exchange-reject]");
  if (rejectButton) rejectExchangeProposal(rejectButton.dataset.exchangeReject);
});

$("#publish").addEventListener("click", openPublishModal);
$("#publish-bottom").addEventListener("click", openPublishModal);
$("#publish-close").addEventListener("click", () => { closePublishModal(); resetPublishForm(); });
$("#publish-cancel").addEventListener("click", () => { closePublishModal(); resetPublishForm(); });
$("#publish-modal").addEventListener("click", event => {
  if (event.target === $("#publish-modal")) { closePublishModal(); resetPublishForm(); }
});
$("#listing-type").addEventListener("change", updatePriceRequirement);
$("#listing-image").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) { $("#publish-preview").classList.add("hidden"); return; }
  if (!file.type.startsWith("image/")) {
    event.target.value = "";
    $("#publish-preview").classList.add("hidden");
    $("#publish-preview-img").removeAttribute("src");
    toast("Selecciona un archivo de imagen.");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    event.target.value = "";
    $("#publish-preview").classList.add("hidden");
    $("#publish-preview-img").removeAttribute("src");
    toast("La imagen debe pesar menos de 8 MB.");
    return;
  }
  try {
    $("#publish-preview-img").src = await readImage(file);
    $("#publish-preview").classList.remove("hidden");
  } catch {
    event.target.value = "";
    toast("No se pudo mostrar la imagen seleccionada.");
  }
});
$("#publish-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const file = $("#listing-image").files[0];
  if (!file) { toast("Agrega una fotografía de la prenda para publicarla."); return; }
  const submitButton = $("#publish-submit");
  submitButton.disabled = true;
  submitButton.textContent = "Publicando...";
  try {
    const imageData = await compressImage(file);
    const seller = $("#listing-seller").value.trim();
    const listingType = $("#listing-type").value;
    const listing = {
      id: Date.now(),
      name: $("#listing-name").value.trim(),
      cat: $("#listing-category").value,
      brand: $("#listing-brand").value.trim() || "Sin marca",
      price: listingType === "swap" ? 0 : Number($("#listing-price").value),
      size: $("#listing-size").value,
      condition: $("#listing-condition").value,
      seller,
      initial: seller.charAt(0).toUpperCase(),
      swap: listingType !== "sale",
      listingType,
      created: 0,
      createdAt: Date.now(),
      badge: "Nueva publicación",
      img: imageData,
      desc: $("#listing-description").value.trim(),
      isUserListing: true
    };
    const savedListings = getUserProducts();
    savedListings.push(listing);
    localStorage.setItem(USER_PRODUCTS_KEY, JSON.stringify(savedListings));
    closePublishModal();
    resetPublishForm();
    clearFilters();
    $("#catalogo").scrollIntoView({behavior:"smooth"});
    toast("¡Tu prenda ya está publicada en el catálogo de este navegador!");
  } catch (error) {
    console.error(error);
    toast(error && error.name === "QuotaExceededError"
      ? "El almacenamiento del navegador está lleno. Prueba con otra imagen más pequeña o elimina datos del sitio."
      : "No se pudo guardar la publicación. Inténtalo de nuevo.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Publicar prenda";
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!$("#exchange-inbox-modal").classList.contains("hidden")) closeExchangeInbox();
    else if (!$("#exchange-modal").classList.contains("hidden")) closeExchangeModal();
    else if (!$("#purchase-modal").classList.contains("hidden")) closePurchaseModal();
    else if (!$("#publish-modal").classList.contains("hidden")) { closePublishModal(); resetPublishForm(); }
    else if (!$("#modal").classList.contains("hidden")) closeModal();
  }
});

updatePriceRequirement();
render();
