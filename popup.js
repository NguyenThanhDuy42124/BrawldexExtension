// Brawldex Live Companion Engine (Dynamic Calling Card from API, Permanons, Ball Tiers, Shop, Wallet)
const DEFAULT_OWNER_ID = "";
const API_KEY = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
const BASE_API = "https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1";

const ANIMATED_TRAINERS = new Set(["CAITLIN", "GIOVANNI", "SKYLA"]);

function getTrainerSrc(trainerKey) {
  const k = (trainerKey || "BUGCATCHER").toUpperCase();
  const ext = ANIMATED_TRAINERS.has(k) ? "gif" : "png";
  return `https://www.brawldex.live/trainers/${k}.${ext}`;
}

let DEXDATA = {};
let HELD_ITEMS_DATA = {};
let currentHeldMap = [];
let allPokemon = [];
let activeFilter = "all";
let activeBallFilter = null;
let searchQuery = "";
let userFavoriteCodes = new Set();

let currentOwnerId = DEFAULT_OWNER_ID;
let currentToken = null;
let currentTrainerName = "Trainer";
let currentTiktok = "";
let currentTrainerKey = "BUGCATCHER";
let currentTrainerSprite = getTrainerSrc("BUGCATCHER");
let currentPartnerDex = "390";
let currentCoins = 0;
let currentCandies = 7;
let currentPatches = 0;
let currentNuggets = 0;
let currentLevel = 7;
let currentRating = 1008;
let currentTmDiscs = 0;
let currentShinyPotion = 0;
let currentShinyDust = 0;
let currentCapsules = 0;
let currentBagItems = [];
let currentInspectingMon = null;
let currentLang = "vi";

const I18N = {
  vi: {
    // Header & Tools
    tool_web_sync_title: "Tự động mở/quét brawldex.live để lấy Owner ID mới",
    tool_refresh_title: "Làm mới dữ liệu",
    tool_settings_title: "Cài đặt",
    tab_pokemon: "Đội Hình",
    tab_bag: "Balo",
    tab_shop: "Cửa Hàng",
    tab_stats: "Chỉ Số",
    tab_market: "Chợ Đen",

    // Settings
    settings_title: "Cấu hình tài khoản",
    owner_id_lbl: "Owner ID:",
    btn_save: "Lưu",
    btn_auto_fetch: "Chạy tới brawldex.live lấy ID mới",
    btn_auto_detect: "Quét từ tab brawldex đang mở",
    bubble_lbl: "Bong bóng nổi (Floating Bubble)",
    bubble_sub: "Hiện nút tròn hỗ trợ trên brawldex.live & TikTok",
    lang_lbl: "Ngôn ngữ (Language)",
    lang_sub: "Chuyển đổi giao diện Tiếng Việt / English",

    // Deck & Filter
    search_placeholder: "Tìm tên, Dex # hoặc Code...",
    filter_all: "Tất cả",
    filter_energy: "Đầy Energy",
    filter_wins: "Đã Thắng",
    sec_favourites: "FAVOURITES",
    sec_permanons: "PERMANONS",
    sec_perma_desc: "CAN'T BE STOLEN OR RELEASED",
    sec_everything_else: "EVERYTHING ELSE",
    no_fav_found: "Chưa có Pokémon nào được thêm vào Yêu Thích.",
    no_perma_found: "Không có Permanon nào phù hợp bộ lọc.",
    no_regular_found: "Không có Pokémon thường nào phù hợp bộ lọc.",

    // Cards
    card_empty_held: "Trống",
    card_fav_add: "Thêm vào yêu thích",
    card_fav_remove: "Bỏ yêu thích",
    card_inspect_btn: "Chi Tiết",
    card_inspect_title: "Xem chi tiết & Reroll Move (TM Disc)",
    card_code_title: "Chỉ copy mã",

    // Bag & Consumables
    bag_consumables_title: "Consumables",
    bag_consumables_sub: "candy · TMs · shiny · capsules",
    bag_rare_candy_desc: "Evolves a non-Permamon Pokémon. Permamon evolve by knocking Pokémon out instead.",
    bag_tm_disc_desc: "Not held — used. Spend one on a Permamon to reroll one of its four moves at random.",
    bag_shiny_potion_desc: "Makes one of your Permamon shiny forever: shiny art and the shiny stat boost in battle.",
    bag_shiny_dust_desc: "Trade 3 Shiny Dust for a Shiny Potion.",
    bag_you_have: "Bạn đang có",
    bag_capsule_desc: "Opens into one random held item you don't have yet.",
    btn_use: "Dùng",
    btn_trade_3: "Đổi 3",
    btn_open: "Mở",
    btn_opening: "Đang mở...",
    btn_trading: "Đang đổi...",
    bag_held_title: "Held Items & Plates",
    bag_held_sub: "Vật phẩm & đĩa hệ trang bị đang có trong túi",
    bag_held_empty: "Túi đồ trang bị hiện đang trống.<br>Hãy mua hoặc mở Capsule để nhận Item!",

    // Shop
    shop_wallet_title: "Số Dư Ví (Wallet)",
    shop_same_six: "Same six for everyone",
    shop_today_stock: "Hàng Ngày (Today's Stock)",
    shop_checking_stock: "Đang kiểm tra hàng khả dụng...",
    shop_always_stock: "Luôn Có Sẵn (Always in Stock)",
    shop_items: "Items",
    shop_random_ball_sub: "A random Pokémon — 72% Poké, 20% Great, 7% Ultra, 1% Master.",
    shop_tm_disc_sub: "Reroll one of a Pokémon's moves.",
    shop_tm_diamonds_sub: "The same TM Disc, paid in diamonds.",
    shop_candy_sub: "Evolves any non-Permamon Pokémon.",
    shop_patch_sub: "Choose the Ability a Pokémon fights with, hidden ones too.",
    shop_empty_stock: "Cửa hàng đang chuẩn bị nhập đợt hàng mới...",
    shop_owned_warehouse: "Đang có trong kho",
    shop_owned_bag: "Đã có trong túi",
    shop_status_avail: "Khả dụng",
    shop_status_bought: "Đã Mua",
    shop_status_lack: "Thiếu",
    shop_item_sub: "Vật phẩm",
    shop_restocking: "Đang nhập hàng...",
    shop_resets_in: "Làm mới sau",
    btn_buy: "Mua",

    // Stats
    stats_battle_title: "Thống Kê Chiến Đấu",
    stats_total_kos: "Tổng Hạ Gục (KOs)",
    stats_wins: "Trận Thắng",
    stats_losses: "Trận Thua",
    stats_win_rate: "Tỷ Lệ Thắng",
    stats_plates_title: "Plates & Vật Phẩm Đang Giữ",

    // Black Market
    market_title: "Chợ Đen (Black Market)",
    market_status_open: "Đang mở bán",
    market_status_closed: "Đang đóng",
    market_desc: "Vật phẩm thị trường đen đặc biệt:",
    market_item_sub: "Vật phẩm thị trường đen",

    // Inspector
    close: "Đóng",
    insp_copy_code_title: "Click để copy code",
    insp_held_items_title: "Trang Bị Đang Giữ (Held Items)",
    insp_slots_open: "Slot Mở",
    insp_unlock_star: "Mở khóa khi đạt",
    insp_empty_slot: "Trống (Empty)",
    insp_choose_bag_hint: "Chọn từ túi đồ bên dưới để trang bị ⬇",
    insp_bag_title: "Túi Đồ Trang Bị (Bấm để gán vào Pokémon)",
    insp_bag_items_count: "loại vật phẩm",
    insp_bag_empty: "Chưa có trang bị nào trong túi đồ. Hãy mua thêm từ Shop hoặc mở Capsule!",
    insp_item_active: "Trang bị đang kích hoạt",
    insp_btn_unequip: "Tháo",
    insp_unequip_title: "Tháo vật phẩm này về túi",
    insp_btn_equip: "Trang bị",
    insp_btn_equipped: "Đang giữ",
    insp_btn_slots_full: "Đầy slot",
    insp_moveset_title: "Moveset (Chiêu thức & TM Disc Reroll)",
    insp_btn_reroll_tm: "Reroll TM",
    insp_btn_reroll_no_tm: "Reroll (Hết TM)",
    insp_btn_rerolling: "⏳ Đang đổi...",
    insp_btn_ready_evolve: "✨ Sẵn Sàng Tiến Hóa (Evolve)",
    insp_btn_candy_evolve: "🍬 Dùng 1 Candy Tiến Hóa",
    insp_btn_evolving: "Đang tiến hóa...",

    // Toasts
    toast_owner_saved: "Đã lưu Owner ID",
    toast_not_logged_in: "Chưa mở hoặc chưa đăng nhập brawldex.live!",
    toast_synced: "Đã đồng bộ:",
    toast_scan_error: "Lỗi khi quét tab: ",
    toast_bubble_off: "Đã tắt bong bóng nổi",
    toast_bubble_on: "Đã bật bong bóng nổi",
    toast_no_capsules: "Bạn không có Item Capsule nào để mở!",
    toast_capsule_success: "🎉 Đã mở Capsule nhận vật phẩm!",
    toast_capsule_fail: "Không thể mở Capsule lúc này",
    toast_trade_dust_success: "✨ Đã đổi 3 Shiny Dust thành 1 Shiny Potion!",
    toast_trade_dust_fail: "Chưa thể đổi lúc này",
    toast_searching_tab: "🔍 Đang tìm tab brawldex.live...",
    toast_new_id_found: "🎉 Đã lấy Owner ID mới:",
    toast_opening_tab: "🚀 Đang mở brawldex.live để lấy ID mới...",
    toast_sync_id_success: "🎉 Đã đồng bộ ID mới:",
    toast_need_login: "⚠️ Vui lòng đăng nhập trên Brawldex rồi bấm Đồng bộ lại!",
    toast_no_perm_tab: "Không có quyền tabs để tự mở web",
    toast_sync_error: "Lỗi đồng bộ: ",
    toast_fav_removed: "Đã bỏ khỏi mục Yêu Thích",
    toast_fav_added: "⭐ Đã thêm vào mục Yêu Thích!",
    toast_copied: "Đã copy",
    toast_copied_code: "Đã copy mã",
    toast_cant_copy: "Không thể copy: ",
    toast_equipping: "Đang trang bị",
    toast_unequipping: "Đang tháo",
    toast_equip_success: "🎉 Đã trang bị thành công!",
    toast_unequip_success: "✓ Đã tháo trang bị!",
    toast_equip_fail: "Không thể cập nhật trang bị lúc này! Hãy kiểm tra tab Brawldex.",
    toast_reroll_success: "🎉 Đã đổi chiêu:",
    toast_reroll_fail: "Không thể reroll chiêu này!",
    toast_evolve_success: "🎉 Tiến hóa thành công!",
    toast_evolve_fail: "Không thể tiến hóa lúc này",
    toast_lack_coins: "Không đủ Coins! Bạn cần",
    toast_lack_diamonds: "Không đủ Diamonds! Bạn cần thêm",
    toast_buy_success: "🎉 Mua thành công",
    toast_buy_need_auth: "Cần mở tab brawldex.live (đã đăng nhập) để xác thực mua!",
    toast_buy_error: "Lỗi khi mua: "
  },
  en: {
    // Header & Tools
    tool_web_sync_title: "Auto open/scan brawldex.live to get new Owner ID",
    tool_refresh_title: "Refresh data",
    tool_settings_title: "Settings",
    tab_pokemon: "Deck",
    tab_bag: "Bag",
    tab_shop: "Shop",
    tab_stats: "Stats",
    tab_market: "Black Market",

    // Settings
    settings_title: "Account Settings",
    owner_id_lbl: "Owner ID:",
    btn_save: "Save",
    btn_auto_fetch: "Open brawldex.live & fetch new ID",
    btn_auto_detect: "Scan from open Brawldex tab",
    bubble_lbl: "Floating Bubble",
    bubble_sub: "Show helper floating button on brawldex.live & TikTok",
    lang_lbl: "Language (Ngôn ngữ)",
    lang_sub: "Switch interface between Vietnamese / English",

    // Deck & Filter
    search_placeholder: "Search name, Dex # or Code...",
    filter_all: "All",
    filter_energy: "Full Energy",
    filter_wins: "Has Wins",
    sec_favourites: "FAVORITES",
    sec_permanons: "PERMANONS",
    sec_perma_desc: "CAN'T BE STOLEN OR RELEASED",
    sec_everything_else: "EVERYTHING ELSE",
    no_fav_found: "No Pokémon added to Favorites yet.",
    no_perma_found: "No Permanons match current filter.",
    no_regular_found: "No regular Pokémon match current filter.",

    // Cards
    card_empty_held: "Empty",
    card_fav_add: "Add to favorites",
    card_fav_remove: "Remove from favorites",
    card_inspect_btn: "Details",
    card_inspect_title: "View details & Reroll Move (TM Disc)",
    card_code_title: "Copy code only",

    // Bag & Consumables
    bag_consumables_title: "Consumables",
    bag_consumables_sub: "candy · TMs · shiny · capsules",
    bag_rare_candy_desc: "Evolves a non-Permamon Pokémon. Permamon evolve by knocking Pokémon out instead.",
    bag_tm_disc_desc: "Not held — used. Spend one on a Permamon to reroll one of its four moves at random.",
    bag_shiny_potion_desc: "Makes one of your Permamon shiny forever: shiny art and the shiny stat boost in battle.",
    bag_shiny_dust_desc: "Trade 3 Shiny Dust for a Shiny Potion.",
    bag_you_have: "You have",
    bag_capsule_desc: "Opens into one random held item you don't have yet.",
    btn_use: "Use",
    btn_trade_3: "Trade 3",
    btn_open: "Open",
    btn_opening: "Opening...",
    btn_trading: "Trading...",
    bag_held_title: "Held Items & Plates",
    bag_held_sub: "Held items & plates currently in your bag",
    bag_held_empty: "Held item bag is currently empty.<br>Purchase or open Capsules to get Items!",

    // Shop
    shop_wallet_title: "Wallet Balance",
    shop_same_six: "Same six for everyone",
    shop_today_stock: "Today's Stock",
    shop_checking_stock: "Checking available stock...",
    shop_always_stock: "Always in Stock",
    shop_items: "Items",
    shop_random_ball_sub: "A random Pokémon — 72% Poké, 20% Great, 7% Ultra, 1% Master.",
    shop_tm_disc_sub: "Reroll one of a Pokémon's moves.",
    shop_tm_diamonds_sub: "The same TM Disc, paid in diamonds.",
    shop_candy_sub: "Evolves any non-Permamon Pokémon.",
    shop_patch_sub: "Choose the Ability a Pokémon fights with, hidden ones too.",
    shop_empty_stock: "Shop is preparing next stock rotation...",
    shop_owned_warehouse: "In Warehouse",
    shop_owned_bag: "In Bag",
    shop_status_avail: "Available",
    shop_status_bought: "Purchased",
    shop_status_lack: "Need",
    shop_item_sub: "Item",
    shop_restocking: "Restocking...",
    shop_resets_in: "Resets in",
    btn_buy: "Buy",

    // Stats
    stats_battle_title: "Battle Statistics",
    stats_total_kos: "Total KOs",
    stats_wins: "Wins",
    stats_losses: "Losses",
    stats_win_rate: "Win Rate",
    stats_plates_title: "Held Plates & Items",

    // Black Market
    market_title: "Black Market",
    market_status_open: "Open",
    market_status_closed: "Closed",
    market_desc: "Special black market goods:",
    market_item_sub: "Black market item",

    // Inspector
    close: "Close",
    insp_copy_code_title: "Click to copy code",
    insp_held_items_title: "Held Items",
    insp_slots_open: "Slots Open",
    insp_unlock_star: "Unlocks at",
    insp_empty_slot: "Empty",
    insp_choose_bag_hint: "Select from inventory below to equip ⬇",
    insp_bag_title: "Inventory Items (Click to equip to Pokémon)",
    insp_bag_items_count: "item types",
    insp_bag_empty: "No held items in bag. Purchase from Shop or open Capsules!",
    insp_item_active: "Item currently active",
    insp_btn_unequip: "Unequip",
    insp_unequip_title: "Unequip this item back to bag",
    insp_btn_equip: "Equip",
    insp_btn_equipped: "Equipped",
    insp_btn_slots_full: "Slots Full",
    insp_moveset_title: "Moveset (Moves & TM Disc Reroll)",
    insp_btn_reroll_tm: "Reroll TM",
    insp_btn_reroll_no_tm: "Reroll (No TM)",
    insp_btn_rerolling: "⏳ Rerolling...",
    insp_btn_ready_evolve: "✨ Ready to Evolve",
    insp_btn_candy_evolve: "🍬 Use 1 Candy to Evolve",
    insp_btn_evolving: "Evolving...",

    // Toasts
    toast_owner_saved: "Owner ID saved",
    toast_not_logged_in: "brawldex.live is not open or not logged in!",
    toast_synced: "Synchronized:",
    toast_scan_error: "Error scanning tab: ",
    toast_bubble_off: "Floating bubble disabled",
    toast_bubble_on: "Floating bubble enabled",
    toast_no_capsules: "You don't have any Item Capsules to open!",
    toast_capsule_success: "🎉 Capsule opened, item received!",
    toast_capsule_fail: "Cannot open Capsule right now",
    toast_trade_dust_success: "✨ Traded 3 Shiny Dust for 1 Shiny Potion!",
    toast_trade_dust_fail: "Cannot trade right now",
    toast_searching_tab: "🔍 Looking for brawldex.live tab...",
    toast_new_id_found: "🎉 Retrieved new Owner ID:",
    toast_opening_tab: "🚀 Opening brawldex.live to get new ID...",
    toast_sync_id_success: "🎉 Synchronized new ID:",
    toast_need_login: "⚠️ Please log in on Brawldex and sync again!",
    toast_no_perm_tab: "No tabs permission to open web",
    toast_sync_error: "Sync error: ",
    toast_fav_removed: "Removed from Favorites",
    toast_fav_added: "⭐ Added to Favorites!",
    toast_copied: "Copied",
    toast_copied_code: "Copied code",
    toast_cant_copy: "Could not copy: ",
    toast_equipping: "Equipping",
    toast_unequipping: "Unequipping",
    toast_equip_success: "🎉 Equipped successfully!",
    toast_unequip_success: "✓ Unequipped item!",
    toast_equip_fail: "Could not update item right now! Check Brawldex tab.",
    toast_reroll_success: "🎉 Move rerolled:",
    toast_reroll_fail: "Could not reroll this move!",
    toast_evolve_success: "🎉 Evolution successful!",
    toast_evolve_fail: "Could not evolve right now",
    toast_lack_coins: "Not enough Coins! You need",
    toast_lack_diamonds: "Not enough Diamonds! You need",
    toast_buy_success: "🎉 Purchased successfully",
    toast_buy_need_auth: "Open brawldex.live tab (logged in) to authenticate purchase!",
    toast_buy_error: "Purchase error: "
  }
};

function t(key, fallback = "") {
  if (I18N[currentLang] && I18N[currentLang][key] !== undefined) {
    return I18N[currentLang][key];
  }
  if (I18N.vi && I18N.vi[key] !== undefined) {
    return I18N.vi[key];
  }
  return fallback || key;
}

function applyLanguage(lang, save = true) {
  if (lang !== "vi" && lang !== "en") lang = "vi";
  currentLang = lang;
  document.documentElement.lang = lang;

  const selectLanguage = document.getElementById("selectLanguage");
  if (selectLanguage && selectLanguage.value !== lang) {
    selectLanguage.value = lang;
  }

  // Update elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (k) el.textContent = t(k, el.textContent);
  });

  // Update elements with data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (k) el.placeholder = t(k, el.placeholder);
  });

  // Update elements with data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const k = el.getAttribute("data-i18n-title");
    if (k) el.title = t(k, el.title);
  });

  // Re-render components with dynamic strings
  filterAndRenderDeck();
  renderBagTab();
  if (todayStockItems && todayStockItems.length > 0) {
    renderTodayStock(todayStockItems);
  }
  updateAlwaysInStock();
  updateShopResetTimer();

  if (currentInspectingMon) {
    openPokemonInspector(currentInspectingMon);
  }

  renderLucide();

  if (save && chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ brawldex_lang: currentLang });
  }
}

const SHOP_WINDOW_MS = 8 * 60 * 60 * 1000;
const getShopWindowStart = () => new Date(Math.floor(Date.now() / SHOP_WINDOW_MS) * SHOP_WINDOW_MS).toISOString();
let boughtSlots = new Set();
let userOwnedItems = new Set();
let todayStockItems = [];

// DOM Elements
const searchInput = document.getElementById("searchInput");
const btnClearSearch = document.getElementById("btnClearSearch");
const toastEl = document.getElementById("toast");
const toastMessageEl = document.getElementById("toastMessage");
const settingsPanel = document.getElementById("settingsPanel");
const inputOwnerId = document.getElementById("inputOwnerId");
const btnWebSync = document.getElementById("btnWebSync");
const btnAutoFetchId = document.getElementById("btnAutoFetchId");
const toggleBubble = document.getElementById("toggleBubble");

// Header Calling Card Elements
const trainerSpriteEl = document.getElementById("trainerSprite");
const partnerSpriteEl = document.getElementById("partnerSprite");
const ccTrainerName = document.getElementById("ccTrainerName");
const ccLevel = document.getElementById("ccLevel");
const ccTiktok = document.getElementById("ccTiktok");
const headerCoins = document.getElementById("headerCoins");
const headerCandies = document.getElementById("headerCandies");
const headerRating = document.getElementById("headerRating");

// Pokemon Deck Elements
const permaList = document.getElementById("permaList");
const regularList = document.getElementById("regularList");
const permaCountEl = document.getElementById("permaCount");
const regularCountEl = document.getElementById("regularCount");

// Shop & Wallet Elements
const shopWalletCoins = document.getElementById("shopWalletCoins");
const shopWalletCandies = document.getElementById("shopWalletCandies");
const shopWalletNuggets = document.getElementById("shopWalletNuggets");
const todayStockList = document.getElementById("todayStockList");

// Stats Elements
const tabTrainerName = document.getElementById("tabTrainerName");
const statLevel = document.getElementById("statLevel");
const statRating = document.getElementById("statRating");
const statKos = document.getElementById("statKos");
const statWins = document.getElementById("statWins");
const statLosses = document.getElementById("statLosses");
const statWinRate = document.getElementById("statWinRate");
const platesList = document.getElementById("platesList");

// Black market Elements
const marketStatus = document.getElementById("marketStatus");
const marketDot = document.getElementById("marketDot");
const marketStockList = document.getElementById("marketStockList");

async function initApp() {
  setupTabs();
  setupEventListeners();
  updateShopResetTimer();
  setInterval(updateShopResetTimer, 1000);
  renderLucide();
  await Promise.all([
    loadDexData(),
    loadHeldItemsDatabase()
  ]);
  await loadStoredUserData();
  await refreshAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function updateShopResetTimer() {
  const badge = document.getElementById("shopResetBadge");
  if (!badge) return;
  const winStart = Math.floor(Date.now() / SHOP_WINDOW_MS) * SHOP_WINDOW_MS;
  const ms = (winStart + SHOP_WINDOW_MS) - Date.now();
  if (ms <= 0) {
    badge.textContent = t("shop_restocking", "Restocking...");
    return;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  badge.textContent = `${t("shop_resets_in", "Resets in")} ${h}h ${m}m`;
}

function renderLucide() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Dual-channel communication helper (supports both in-page floating iframe and browser popup)
async function sendTabMessage(payload) {
  // 1. If running inside iframe on Brawldex page
  if (window.parent && window.parent !== window) {
    return new Promise((resolve) => {
      const channelId = "bdx_msg_" + Math.random().toString(36).slice(2);
      const listener = (event) => {
        if (event.data && event.data.channelId === channelId) {
          window.removeEventListener("message", listener);
          resolve(event.data.response);
        }
      };
      window.addEventListener("message", listener);
      window.parent.postMessage({ brawldex_action: payload.action, payload, channelId }, "*");
      setTimeout(() => {
        window.removeEventListener("message", listener);
        resolve(null);
      }, 4000);
    });
  }

  // 2. Otherwise query active browser tab via chrome.tabs
  try {
    if (chrome && chrome.tabs && chrome.tabs.query) {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.url.includes("brawldex.live")) {
        const bdxTabs = await chrome.tabs.query({ url: "*://*.brawldex.live/*" });
        if (bdxTabs && bdxTabs.length > 0) {
          tab = bdxTabs[0];
        }
      }
      if (tab && tab.id) {
        return new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, payload, (res) => {
            if (chrome.runtime.lastError || !res) resolve(null);
            else resolve(res);
          });
        });
      }
    }
  } catch (e) {}
  return null;
}

async function loadDexData() {
  try {
    const resp = await fetch("dexdata.json");
    if (resp.ok) {
      DEXDATA = await resp.json();
    }
  } catch (e) {
    console.warn("Could not load local dexdata.json:", e);
  }
}

async function loadHeldItemsDatabase() {
  try {
    const url = (chrome && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL("helditems.json") : "helditems.json";
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      HELD_ITEMS_DATA = data.items || data || {};
    }
  } catch (e) {
    console.warn("Could not load helditems.json:", e);
  }
}

function applyHeldMapToMons(heldList) {
  if (!Array.isArray(heldList) || heldList.length === 0) return;
  heldList.forEach((h) => {
    if (!h || !h.code || !h.item) return;
    const m = allPokemon.find((x) => x.code === h.code);
    if (m) {
      m.item = h.item;
      if (!Array.isArray(m.items) || m.items.length === 0) {
        m.items = [h.item];
      } else if (!m.items.includes(h.item)) {
        m.items.unshift(h.item);
      }
    }
  });
}

function getDexInfo(dex) {
  const d = String(dex);
  if (DEXDATA && DEXDATA[d]) {
    return DEXDATA[d];
  }
  const fallbackName = typeof getPokemonName === "function" ? getPokemonName(dex) : `Dex #${dex}`;
  return { n: fallbackName, b: "poke", t: [] };
}

function isPermamon(mon) {
  if (!mon) return false;
  return (
    mon.obtained === "starter" ||
    mon.obtained === "quest" ||
    mon.obtained === "perma" ||
    mon.obtained === "follow_perma" ||
    mon.is_perma === true ||
    mon.perma === true ||
    mon.stays === true ||
    mon.code === "NUM-PDU"
  );
}

function setupTabs() {
  document.querySelectorAll(".nav-tabs .nav-tab").forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      document.querySelectorAll(".nav-tabs .nav-tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      tabBtn.classList.add("active");
      const targetId = tabBtn.dataset.tab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add("active");
      renderLucide();
    });
  });
}

function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    btnClearSearch.classList.toggle("hidden", !searchQuery);
    filterAndRenderDeck();
  });

  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    btnClearSearch.classList.add("hidden");
    filterAndRenderDeck();
  });

  // Filter Pills (Ball & General)
  document.querySelectorAll(".pills-scroll .filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pills-scroll .filter-pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.ball) {
        activeBallFilter = btn.dataset.ball;
        activeFilter = "ball";
      } else {
        activeBallFilter = null;
        activeFilter = btn.dataset.filter || "all";
      }

      filterAndRenderDeck();
    });
  });

  // Settings Panel
  document.getElementById("btnSettings").addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
    renderLucide();
  });

  document.getElementById("btnCloseSettings").addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
  });

  // Inspector Close Handlers
  const btnInspectClose = document.getElementById("btnInspectClose");
  if (btnInspectClose) {
    btnInspectClose.addEventListener("click", () => {
      document.getElementById("monInspectorModal").classList.add("hidden");
      currentInspectingMon = null;
    });
  }
  const btnInspectCloseBackdrop = document.getElementById("btnInspectCloseBackdrop");
  if (btnInspectCloseBackdrop) {
    btnInspectCloseBackdrop.addEventListener("click", () => {
      document.getElementById("monInspectorModal").classList.add("hidden");
      currentInspectingMon = null;
    });
  }

  // Language Selector
  const selectLanguage = document.getElementById("selectLanguage");
  if (selectLanguage) {
    selectLanguage.value = currentLang;
    selectLanguage.addEventListener("change", (e) => {
      applyLanguage(e.target.value, true);
    });
  }

  document.getElementById("btnSaveOwner").addEventListener("click", async () => {
    const val = inputOwnerId.value.trim();
    if (val) {
      currentOwnerId = val;
      if (chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ brawldex_owner_id: currentOwnerId });
      }
      showToast(t("toast_owner_saved", "Đã lưu Owner ID"));
      settingsPanel.classList.add("hidden");
      await refreshAll();
    }
  });

  // Auto Detect from Tab / Page
  document.getElementById("btnAutoDetect").addEventListener("click", async () => {
    try {
      const response = await sendTabMessage({ action: "detect_user" });
      if (!response || !response.brawldex_owner_id) {
        showToast(t("toast_not_logged_in", "Chưa mở hoặc chưa đăng nhập brawldex.live!"), true);
      } else {
        applyExtractedAuth(response);
        showToast(`${t("toast_synced", "Đã đồng bộ:")} ${currentTrainerName}!`);
        settingsPanel.classList.add("hidden");
        refreshAll();
      }
    } catch (e) {
      showToast(t("toast_scan_error", "Lỗi khi quét tab: ") + e.message, true);
    }
  });

  if (btnWebSync) {
    btnWebSync.addEventListener("click", syncOwnerIdFromWeb);
  }
  if (btnAutoFetchId) {
    btnAutoFetchId.addEventListener("click", syncOwnerIdFromWeb);
  }

  if (toggleBubble) {
    toggleBubble.addEventListener("change", async (e) => {
      const isHidden = !e.target.checked;
      if (chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ brawldex_bubble_hidden: isHidden });
      }
      showToast(isHidden ? t("toast_bubble_off", "Đã tắt bong bóng nổi") : t("toast_bubble_on", "Đã bật bong bóng nổi"));
    });
  }

  // Hook up Balo Actions
  const btnOpenCapsule = document.getElementById("btnOpenCapsule");
  if (btnOpenCapsule) {
    btnOpenCapsule.addEventListener("click", async () => {
      if (currentCapsules <= 0) {
        showToast(t("toast_no_capsules", "Bạn không có Item Capsule nào để mở!"), true);
        btnOpenCapsule.disabled = true;
        return;
      }
      btnOpenCapsule.disabled = true;
      btnOpenCapsule.textContent = t("btn_opening", "Đang mở...");
      const res = await sendTabMessage({ action: "call_rpc", rpc: "open_item_capsule", body: {} });
      if (res && res.ok) {
        showToast(t("toast_capsule_success", "🎉 Đã mở Capsule nhận vật phẩm!"));
        currentCapsules = Math.max(0, currentCapsules - 1);
        await refreshAll();
      } else {
        showToast((res && res.error) || t("toast_capsule_fail", "Không thể mở Capsule lúc này"), true);
        btnOpenCapsule.disabled = currentCapsules <= 0;
        btnOpenCapsule.textContent = t("btn_open", "Mở");
      }
    });
  }

  const btnTradeShinyDust = document.getElementById("btnTradeShinyDust");
  if (btnTradeShinyDust) {
    btnTradeShinyDust.addEventListener("click", async () => {
      if (currentShinyDust < 3) return;
      btnTradeShinyDust.disabled = true;
      btnTradeShinyDust.textContent = t("btn_trading", "Đang đổi...");
      const res = await sendTabMessage({ action: "buy_shop_slot", rpcName: "trade_shiny_dust", body: {} });
      if (res && res.ok) {
        showToast(t("toast_trade_dust_success", "✨ Đã đổi 3 Shiny Dust thành 1 Shiny Potion!"));
        currentShinyDust -= 3;
        currentShinyPotion += 1;
        renderBagTab();
      } else {
        showToast((res && res.error) || t("toast_trade_dust_fail", "Chưa thể đổi lúc này"), true);
        btnTradeShinyDust.disabled = false;
        btnTradeShinyDust.textContent = t("btn_trade_3", "Đổi 3");
      }
    });
  }

  // If running inside floating iframe on brawldex.live, auto-detect immediately
  if (window.parent && window.parent !== window) {
    sendTabMessage({ action: "detect_user" }).then((response) => {
      if (response && response.brawldex_owner_id) {
        applyExtractedAuth(response);
      }
    });
  }

  // Refresh
  document.getElementById("btnRefresh").addEventListener("click", refreshAll);

  // Hook up Always in stock (Items)
  document.querySelectorAll(".btn-buy-static").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.item;
      const price = parseInt(btn.dataset.price, 10);
      if (item === "random_ball") {
        buyStaticItem("normal", "ball", price, "Random Ball", btn);
      } else if (item === "tm_disc") {
        buyStaticItem(1, "tm", price, "TM Disc", btn);
      } else if (item === "tm_diamonds") {
        buyStaticItem(1, "tm_diamonds", price, "TM Disc (Diamonds)", btn);
      } else if (item === "rare_candy") {
        buyStaticItem(1, "candy", price, "Rare Candy", btn);
      } else if (item === "ability_patch") {
        buyStaticItem(1, "ability_patch", price, "Ability Patch", btn);
      }
    });
  });
}

function applyExtractedAuth(response) {
  if (!response) return;
  if (response.brawldex_owner_id) currentOwnerId = response.brawldex_owner_id;
  if (response.brawldex_user_name) currentTrainerName = response.brawldex_user_name;
  if (response.brawldex_tiktok) currentTiktok = response.brawldex_tiktok;
  if (response.brawldex_avatar) currentTrainerSprite = response.brawldex_avatar;
  if (response.brawldex_partner_dex) currentPartnerDex = response.brawldex_partner_dex;
  if (response.brawldex_token) currentToken = response.brawldex_token;
  if (response.brawldex_coins !== undefined && response.brawldex_coins > 0) currentCoins = response.brawldex_coins;
  if (response.brawldex_candies !== undefined) currentCandies = response.brawldex_candies;
  if (response.brawldex_tm_discs !== undefined) currentTmDiscs = response.brawldex_tm_discs;
  if (response.brawldex_shiny_potion !== undefined) currentShinyPotion = response.brawldex_shiny_potion;
  if (response.brawldex_shiny_dust !== undefined) currentShinyDust = response.brawldex_shiny_dust;

  if (Array.isArray(response.brawldex_bag_items)) {
    currentBagItems = response.brawldex_bag_items;
    response.brawldex_bag_items.forEach((it) => userOwnedItems.add(it));
  }
  if (Array.isArray(response.brawldex_held_map)) {
    currentHeldMap = response.brawldex_held_map;
    applyHeldMapToMons(currentHeldMap);
  }
  if (Array.isArray(response.cached_mons) && response.cached_mons.length > 0) {
    allPokemon = response.cached_mons;
    applyHeldMapToMons(currentHeldMap);
  }

  inputOwnerId.value = currentOwnerId;
  updateHeaderUI();
}

async function syncOwnerIdFromWeb() {
  const btn = document.getElementById("btnWebSync");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<i data-lucide="loader" class="spin"></i>`;
    renderLucide();
  }

  showToast("🔍 Đang tìm tab brawldex.live...");

  try {
    // 1. Query for open brawldex.live tab
    if (chrome && chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({ url: "*://*.brawldex.live/*" });
      if (tabs && tabs.length > 0) {
        const activeBrawlTab = tabs[0];
        const res = await new Promise((resolve) => {
          chrome.tabs.sendMessage(activeBrawlTab.id, { action: "detect_user" }, (resp) => {
            if (chrome.runtime.lastError) resolve(null);
            else resolve(resp);
          });
        });

        if (res && res.brawldex_owner_id) {
          applyExtractedAuth(res);
          showToast(`🎉 Đã lấy Owner ID mới: ${res.brawldex_owner_id.slice(0, 8)}...`);
          if (settingsPanel) settingsPanel.classList.add("hidden");
          await refreshAll();
          if (btn) btn.innerHTML = origHtml;
          renderLucide();
          return;
        }
      }

      // 2. If no tab or failed to detect, open brawldex.live and auto-fetch
      showToast("🚀 Đang mở brawldex.live để lấy ID mới...");
      chrome.tabs.create({ url: "https://www.brawldex.live/", active: true }, (newTab) => {
        setTimeout(() => {
          chrome.tabs.sendMessage(newTab.id, { action: "detect_user" }, (res) => {
            if (res && res.brawldex_owner_id) {
              applyExtractedAuth(res);
              showToast(`🎉 Đã đồng bộ ID mới: ${res.brawldex_owner_id.slice(0, 8)}...`);
              if (settingsPanel) settingsPanel.classList.add("hidden");
              refreshAll();
            } else {
              showToast("⚠️ Vui lòng đăng nhập trên Brawldex rồi bấm Đồng bộ lại!", true);
            }
            if (btn) btn.innerHTML = origHtml;
            renderLucide();
          });
        }, 3000);
      });
    } else {
      showToast("Không có quyền tabs để tự mở web", true);
    }
  } catch (err) {
    showToast("Lỗi đồng bộ: " + err.message, true);
    if (btn) btn.innerHTML = origHtml;
    renderLucide();
  }
}

async function loadStoredUserData() {
  if (chrome && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get([
      "brawldex_lang",
      "brawldex_owner_id",
      "brawldex_user_name",
      "brawldex_tiktok",
      "brawldex_avatar",
      "brawldex_partner_dex",
      "brawldex_token",
      "brawldex_bought_slots",
      "brawldex_bought_window",
      "brawldex_bag_items",
      "brawldex_held_map",
      "brawldex_candies",
      "brawldex_tm_discs",
      "brawldex_shiny_potion",
      "brawldex_shiny_dust",
      "brawldex_item_capsule",
      "brawldex_coins",
      "brawldex_bubble_hidden",
      "brawldex_favorites",
      "cached_mons"
    ]);
    if (data.brawldex_lang) {
      applyLanguage(data.brawldex_lang, false);
    } else {
      applyLanguage("vi", false);
    }
    if (data.brawldex_owner_id) currentOwnerId = data.brawldex_owner_id;
    if (data.brawldex_user_name) currentTrainerName = data.brawldex_user_name;
    if (data.brawldex_tiktok) currentTiktok = data.brawldex_tiktok;
    if (data.brawldex_avatar) currentTrainerSprite = data.brawldex_avatar;
    if (data.brawldex_partner_dex) currentPartnerDex = data.brawldex_partner_dex;
    if (data.brawldex_token) currentToken = data.brawldex_token;
    if (data.brawldex_coins !== undefined && data.brawldex_coins > 0) currentCoins = data.brawldex_coins;
    if (data.brawldex_candies !== undefined) currentCandies = data.brawldex_candies;
    if (data.brawldex_tm_discs !== undefined) currentTmDiscs = data.brawldex_tm_discs;
    if (data.brawldex_shiny_potion !== undefined) currentShinyPotion = data.brawldex_shiny_potion;
    if (data.brawldex_shiny_dust !== undefined) currentShinyDust = data.brawldex_shiny_dust;
    if (data.brawldex_item_capsule !== undefined) currentCapsules = data.brawldex_item_capsule;
    if (toggleBubble) toggleBubble.checked = !data.brawldex_bubble_hidden;

    if (data.brawldex_bought_slots && Array.isArray(data.brawldex_bought_slots)) {
      const savedWin = data.brawldex_bought_window;
      const curWin = getShopWindowStart();
      const isSameWin = !savedWin || savedWin === curWin || (
        Math.abs(new Date(savedWin).getTime() - new Date(curWin).getTime()) < 3600000
      );
      if (isSameWin) {
        data.brawldex_bought_slots.forEach((s) => {
          const n = Number(s);
          if (!isNaN(n)) boughtSlots.add(n);
        });
      }
    }

    if (data.brawldex_favorites && Array.isArray(data.brawldex_favorites)) {
      data.brawldex_favorites.forEach((c) => userFavoriteCodes.add(c));
    }

    if (data.brawldex_bag_items && Array.isArray(data.brawldex_bag_items)) {
      currentBagItems = data.brawldex_bag_items;
      data.brawldex_bag_items.forEach((it) => userOwnedItems.add(it));
    }
    if (data.brawldex_held_map && Array.isArray(data.brawldex_held_map)) {
      currentHeldMap = data.brawldex_held_map;
    }
    if (Array.isArray(data.cached_mons) && data.cached_mons.length > 0) {
      allPokemon = data.cached_mons;
      if (currentHeldMap.length > 0) applyHeldMapToMons(currentHeldMap);
    }
  }
  if (inputOwnerId) inputOwnerId.value = currentOwnerId;
  updateHeaderUI();
}

function updateHeaderUI() {
  if (ccTrainerName) ccTrainerName.textContent = currentTrainerName || "Trainer";
  if (ccLevel) ccLevel.textContent = currentLevel;
  if (ccTiktok) ccTiktok.textContent = currentTiktok ? "@" + currentTiktok : "";

  if (trainerSpriteEl) trainerSpriteEl.src = currentTrainerSprite || getTrainerSrc(currentTrainerKey);
  if (partnerSpriteEl) partnerSpriteEl.src = `https://www.brawldex.live/front/${currentPartnerDex || 390}.png`;

  if (headerCoins) headerCoins.textContent = currentCoins;
  if (headerCandies) headerCandies.textContent = currentCandies;
  if (headerRating) headerRating.textContent = currentRating;

  if (tabTrainerName) tabTrainerName.textContent = currentTrainerName || "Trainer";
  if (statLevel) statLevel.textContent = currentLevel;
  if (statRating) statRating.textContent = currentRating;

  if (shopWalletCoins) shopWalletCoins.textContent = currentCoins;
  if (shopWalletCandies) shopWalletCandies.textContent = currentCandies;
  if (shopWalletNuggets) shopWalletNuggets.textContent = currentNuggets;

  const candyCountEl = document.getElementById("shopCandyCount");
  if (candyCountEl) candyCountEl.textContent = currentCandies;

  const patchCountEl = document.getElementById("shopPatchCount");
  if (patchCountEl) patchCountEl.textContent = currentPatches;

  updateAlwaysInStock();
}

async function refreshAll() {
  await fetchPokemonDeck();
  await Promise.all([
    fetchShopStock(),
    fetchTrainerProfile(),
    fetchBlackMarket()
  ]);
  renderBagTab();
  updateAlwaysInStock();
  renderLucide();
}

async function fetchPokemonDeck() {
  try {
    const url = `${BASE_API}/pokemon?select=*&owner_id=eq.${encodeURIComponent(currentOwnerId)}&order=created_at.asc`;
    const resp = await fetch(url, {
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "*/*"
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        allPokemon = data;
        allPokemon.forEach((m) => {
          if (m.item && m.item !== "Empty" && m.item !== "null") userOwnedItems.add(m.item);
          if (Array.isArray(m.items)) {
            m.items.forEach((k) => {
              if (k && k !== "Empty" && k !== "null") userOwnedItems.add(k);
            });
          }
        });
      }
    }
  } catch (err) {
    console.error("fetchPokemonDeck REST error:", err);
  }

  // Sync with tab/content script for held items, bag items & cached mons
  try {
    const tabRes = await sendTabMessage({ action: "get_cached_pokemon" });
    if (tabRes) {
      if (Array.isArray(tabRes.held)) {
        currentHeldMap = tabRes.held;
      }
      if (Array.isArray(tabRes.items)) {
        tabRes.items.forEach((it) => userOwnedItems.add(it));
      }
      if ((!allPokemon || allPokemon.length === 0) && Array.isArray(tabRes.mons) && tabRes.mons.length > 0) {
        allPokemon = tabRes.mons;
      }
    }
  } catch (e) {}

  if (currentHeldMap.length > 0) {
    applyHeldMapToMons(currentHeldMap);
  }

  filterAndRenderDeck();
}

function getFilteredDeck() {
  return allPokemon.filter((mon) => {
    const info = getDexInfo(mon.dex);

    // Ball filter
    if (activeBallFilter && info.b !== activeBallFilter) {
      return false;
    }

    // General filter
    if (activeFilter === "full_energy" && (mon.energy ?? 0) < 3) return false;
    if (activeFilter === "has_wins" && (mon.wins ?? 0) <= 0) return false;

    // Search query
    if (searchQuery) {
      const name = (info.n || "").toLowerCase();
      const code = (mon.code || "").toLowerCase();
      const dex = String(mon.dex);
      if (!name.includes(searchQuery) && !code.includes(searchQuery) && !dex.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });
}

function filterAndRenderDeck() {
  const filtered = getFilteredDeck();

  // Split into Favourites, Permanons and Everything Else
  const favMons = filtered.filter((m) => userFavoriteCodes.has(m.code) || m.favorite || m.fav);
  const remaining = filtered.filter((m) => !userFavoriteCodes.has(m.code) && !m.favorite && !m.fav);
  const permaMons = remaining.filter(isPermamon);
  const regularMons = remaining.filter((m) => !isPermamon(m));

  const favSection = document.getElementById("favSection");
  const favList = document.getElementById("favList");
  const favCountEl = document.getElementById("favCount");

  if (favSection && favCountEl && favList) {
    favCountEl.textContent = favMons.length;
    favSection.style.display = favMons.length > 0 ? "flex" : "none";
    favList.innerHTML = "";
    favMons.forEach((mon) => {
      try {
        const card = buildPokemonCard(mon, isPermamon(mon), true);
        if (card) favList.appendChild(card);
      } catch (err) {
        console.error("Error building fav card:", mon, err);
      }
    });
  }

  if (permaCountEl) permaCountEl.textContent = `${permaMons.length} · ${t("sec_perma_desc", "CAN'T BE STOLEN OR RELEASED")}`;
  if (regularCountEl) regularCountEl.textContent = regularMons.length;

  // Render Permanons
  permaList.innerHTML = "";
  if (permaMons.length === 0) {
    permaList.innerHTML = `<p style="font-size: 11px; color: var(--s2-faint); padding: 6px 10px;">${t("no_perma_found", "Không có Permanon nào phù hợp bộ lọc.")}</p>`;
  } else {
    permaMons.forEach((mon) => {
      try {
        const card = buildPokemonCard(mon, true, false);
        if (card) permaList.appendChild(card);
      } catch (err) {
        console.error("Error building perma card:", mon, err);
      }
    });
  }

  // Render Regulars (Everything else)
  regularList.innerHTML = "";
  if (regularMons.length === 0) {
    regularList.innerHTML = `<p style="font-size: 11px; color: var(--s2-faint); padding: 6px 10px;">${t("no_regular_found", "Không có Pokémon thường nào phù hợp bộ lọc.")}</p>`;
  } else {
    regularMons.forEach((mon) => {
      try {
        const card = buildPokemonCard(mon, false, false);
        if (card) regularList.appendChild(card);
      } catch (err) {
        console.error("Error building regular card:", mon, err);
      }
    });
  }

  renderLucide();
}

function buildPokemonCard(mon, isPerma, isFav) {
  const card = document.createElement("div");
  card.className = "brawl-card";

  const dex = mon.dex;
  const info = getDexInfo(dex);
  const name = info.n;
  const ballTier = info.b || "poke";
  const code = mon.code || "N/A";
  const energy = mon.energy ?? 0;
  const wins = mon.wins ?? 0;
  const battles = mon.battles ?? 0;
  const kos = mon.kos ?? 0;
  const shiny = !!mon.shiny;
  const spriteUrl = `https://www.brawldex.live/front/${dex}.png`;
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

  // Gender & Types
  const genderMark = mon.gender === "F" ? `<span class="gend f" title="Female">♀</span>` : mon.gender === "M" ? `<span class="gend m" title="Male">♂</span>` : "";
  const typesHtml = (info.t || ["NORMAL"]).map(t => `<span class="type-badge ${String(t).toLowerCase()}">${t}</span>`).join(" ");

  // Origin Badge
  let originBadge = "";
  if (mon.obtained === "starter") {
    originBadge = `<span class="origin-badge starter"><i data-lucide="heart"></i> Partner</span>`;
  } else if (isPerma) {
    originBadge = `<span class="origin-badge"><i data-lucide="shield-check"></i> Stays</span>`;
  }

  // Held Item & Winrate
  const heldKey = (mon.item || (Array.isArray(mon.items) && mon.items[0])) || null;
  let heldChipHtml = `<span class="held-chip empty"><i data-lucide="backpack"></i> ${t("card_empty_held", "Trống")}</span>`;
  if (heldKey && heldKey !== "Empty" && heldKey !== "null") {
    const itData = HELD_ITEMS_DATA[heldKey];
    const itName = itData ? itData.name : heldKey;
    const itImg = itData && itData.img ? `https://www.brawldex.live/${itData.img}` : `https://www.brawldex.live/items/${heldKey}.png`;
    const itDesc = itData ? (itData.boost || itData.desc || itData.name) : heldKey;
    heldChipHtml = `<span class="held-chip" title="${itDesc}">
      <img src="${itImg}" alt="${itName}" onerror="this.style.display='none'">
      <span>${itName}</span>
    </span>`;
  }
  const winRate = Math.round((wins / Math.max(1, battles)) * 100);

  // Evolution & KO Requirement
  const evoNeed = isPerma ? 30 : 1;
  const evoText = isPerma ? `<i data-lucide="zap"></i> ${kos}/${evoNeed} KOs` : `<i data-lucide="package"></i> 1 Candy`;

  let movesTxt = "";
  if (Array.isArray(mon.moves) && mon.moves.length > 0) {
    movesTxt = mon.moves.slice(0, 2).map((m) => m.n || m.id).join(", ");
  }

  card.innerHTML = `
    <!-- Top-Left Corner Favorite Button -->
    <button class="card-fav-btn ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? t("card_fav_remove", "Bỏ yêu thích") : t("card_fav_add", "Thêm vào yêu thích")}">
      <i data-lucide="star"></i>
    </button>

    <div class="card-sprite-wrap">
      <img class="mon-pixel-art" src="${spriteUrl}" alt="${name}" onerror="this.onerror=null;this.src='${fallbackUrl}'">
      ${shiny ? '<span class="shiny-star" title="Shiny">✨</span>' : ""}
    </div>
    <div class="card-core">
      <div class="card-title-row">
        <span class="mon-heading">${name}${genderMark}</span>
        <span class="mon-dex-tag">#${dex}</span>
        ${typesHtml}
        <span class="ball-badge ${ballTier}" title="Cấp bóng: ${ballTier.toUpperCase()} BALL">${ballTier.toUpperCase()}</span>
        ${originBadge}
      </div>
      <div class="card-chips-row">
        ${heldChipHtml}
        <span class="winrate-chip">${winRate}% WR</span>
        <span class="evo-chip">${evoText}</span>
      </div>
      <div class="card-status-row">
        <div class="energy-cluster" title="Năng lượng: ${energy}/3">
          <span class="energy-pip ${energy >= 1 ? 'active' : ''}"></span>
          <span class="energy-pip ${energy >= 2 ? 'active' : ''}"></span>
          <span class="energy-pip ${energy >= 3 ? 'active' : ''}"></span>
        </div>
        ${movesTxt ? `<span class="mon-moves-preview">${movesTxt}</span>` : ""}
      </div>
      <div class="card-meta-row">
        <span class="meta-item"><i data-lucide="swords"></i> ${wins}W / ${battles}B</span>
        <span class="meta-item"><i data-lucide="crosshair"></i> ${kos} KOs</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="brawl-codechip" data-action="join" title="Copy !join ${code}">
        <span class="tick tl"></span>
        <span class="tick br"></span>
        <span class="chip-code-text">${code}</span>
        <i data-lucide="copy" class="chip-icon"></i>
      </button>

      <div class="mini-actions">
        <button class="mini-btn inspect" data-action="inspect" title="${t("card_inspect_title", "Xem chi tiết & Reroll Move (TM Disc)")}">
          <i data-lucide="info"></i> ${t("card_inspect_btn", "Chi Tiết")}
        </button>
        <button class="mini-btn" data-action="code" title="${t("card_code_title", "Chỉ copy mã")} ${code}">Code</button>
        <button class="mini-btn" data-action="party" title="Copy !party ${code}">!party</button>
      </div>
    </div>
  `;

  // Bind Actions
  const btnFav = card.querySelector('[data-action="fav"]');
  if (btnFav) {
    btnFav.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (userFavoriteCodes.has(code)) {
        userFavoriteCodes.delete(code);
        showToast(currentLang === "en" ? `Removed ${name} from Favorites` : `Đã bỏ ${name} khỏi mục Yêu Thích`);
      } else {
        userFavoriteCodes.add(code);
        showToast(currentLang === "en" ? `⭐ Added ${name} to Favorites!` : `⭐ Đã thêm ${name} vào mục Yêu Thích!`);
      }
      if (chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ brawldex_favorites: Array.from(userFavoriteCodes) });
      }
      filterAndRenderDeck();
    });
  }

  const btnInspect = card.querySelector('[data-action="inspect"]');
  btnInspect.addEventListener("click", (e) => {
    e.stopPropagation();
    openPokemonInspector(mon);
  });

  const chipBtn = card.querySelector('[data-action="join"]');
  chipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyText(`!join ${code}`, `${t("toast_copied", "Đã copy")} !join ${code}`, chipBtn, "Copied ✓");
  });

  const btnCode = card.querySelector('[data-action="code"]');
  btnCode.addEventListener("click", (e) => {
    e.stopPropagation();
    copyText(code, `${t("toast_copied_code", "Đã copy mã")} ${code}`, btnCode, "✓");
  });

  const btnParty = card.querySelector('[data-action="party"]');
  btnParty.addEventListener("click", (e) => {
    e.stopPropagation();
    copyText(`!party ${code}`, `${t("toast_copied", "Đã copy")} !party ${code}`, btnParty, "✓");
  });

  return card;
}

function openPokemonInspector(mon) {
  const modal = document.getElementById("monInspectorModal");
  if (!modal) return;
  currentInspectingMon = mon;

  const dex = mon.dex;
  const info = getDexInfo(dex);
  const name = info.n;
  const ballTier = info.b || "poke";
  const code = mon.code || "N/A";
  const energy = mon.energy ?? 0;
  const wins = mon.wins ?? 0;
  const battles = mon.battles ?? 0;
  const kos = mon.kos ?? 0;
  const shiny = !!mon.shiny;
  const winRate = Math.round((wins / Math.max(1, battles)) * 100);
  const spriteUrl = `https://www.brawldex.live/front/${dex}.png`;
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;
  const isPerma = isPermamon(mon);

  // 1. Header & Title Box
  document.getElementById("inspDexTag").textContent = `#${dex}`;
  document.getElementById("inspMonName").textContent = name;
  const genderEl = document.getElementById("inspGender");
  if (mon.gender === "F") {
    genderEl.textContent = "♀";
    genderEl.className = "insp-gender f";
  } else if (mon.gender === "M") {
    genderEl.textContent = "♂";
    genderEl.className = "insp-gender m";
  } else {
    genderEl.textContent = "";
  }

  const ballEl = document.getElementById("inspBallBadge");
  ballEl.textContent = `${ballTier.toUpperCase()} BALL`;
  ballEl.className = `ball-badge ${ballTier}`;

  // 2. Sprite & Shiny
  const spriteEl = document.getElementById("inspSprite");
  spriteEl.src = spriteUrl;
  spriteEl.onerror = () => { spriteEl.src = fallbackUrl; };
  const shinyEl = document.getElementById("inspShinyStar");
  shinyEl.classList.toggle("hidden", !shiny);

  // 3. Types
  const typesEl = document.getElementById("inspTypes");
  typesEl.innerHTML = (info.t || ["NORMAL"]).map(t => `<span class="type-badge ${String(t).toLowerCase()}">${t}</span>`).join(" ");

  // 4. Origin
  const originEl = document.getElementById("inspOrigin");
  if (mon.obtained === "starter") {
    originEl.textContent = "♥ First Partner";
    originEl.className = "insp-origin-pill starter";
  } else if (isPerma) {
    originEl.textContent = "⭐ Stays (Permanon)";
    originEl.className = "insp-origin-pill perma";
  } else {
    originEl.textContent = "📦 Regular Pokémon";
    originEl.className = "insp-origin-pill";
  }

  // 5. Code Button
  const codeTextEl = document.getElementById("inspCodeText");
  codeTextEl.textContent = code;
  const btnCopyCode = document.getElementById("inspBtnCopyCode");
  btnCopyCode.onclick = () => copyText(code, `${t("toast_copied_code", "Đã copy mã")} ${code}`);

  // 6. Combat Records
  document.getElementById("inspStatKos").textContent = kos;
  document.getElementById("inspStatWins").textContent = wins;
  document.getElementById("inspStatBattles").textContent = battles;
  document.getElementById("inspStatWinRate").textContent = `${winRate}%`;

  // 7. Ability
  const abilityName = mon.ability || (info.a && info.a[0]) || "Rolls each battle";
  document.getElementById("inspAbilityName").textContent = abilityName;
  document.getElementById("inspAbilityDesc").textContent = (info.a && info.a[1]) || "Rolls each battle randomly";

  // 8. Held Items & Inventory Bag
  function renderInspectorItems() {
    const heldItemsBox = document.getElementById("inspHeldItems");
    const bagListBox = document.getElementById("inspBagList");
    const slotsCountEl = document.getElementById("inspItemSlotsCount");
    const bagCountEl = document.getElementById("inspBagCount");

    const heldList = [];
    if (mon.item) heldList.push(mon.item);
    if (Array.isArray(mon.items)) {
      mon.items.forEach((it) => { if (it && !heldList.includes(it)) heldList.push(it); });
    }

    const openSlots = isPerma ? 3 : Math.min(3, Math.max(1, (mon.stars || 1)));
    if (slotsCountEl) slotsCountEl.textContent = `${openSlots} ${t("insp_slots_open", "Slot Mở")} (${heldList.length}/${openSlots})`;

    // 1. Render Equipped Slots
    heldItemsBox.innerHTML = "";
    for (let slotIdx = 0; slotIdx < Math.max(3, openSlots); slotIdx++) {
      const slotNum = slotIdx + 1;
      const isOpen = slotNum <= openSlots;
      const itemKey = heldList[slotIdx];

      if (!isOpen) {
        const lockedEl = document.createElement("div");
        lockedEl.className = "held-slot-locked";
        lockedEl.innerHTML = `
          <span>🔒 Slot ${slotNum}</span>
          <span>${t("insp_unlock_star", "Mở khóa khi đạt")} ${slotNum}★</span>
        `;
        heldItemsBox.appendChild(lockedEl);
      } else if (itemKey) {
        const itData = HELD_ITEMS_DATA[itemKey] || { name: itemKey, desc: "", img: `items/${itemKey}.png` };
        const itImg = itData.img ? `https://www.brawldex.live/${itData.img}` : `https://www.brawldex.live/items/${itemKey}.png`;
        const slotEl = document.createElement("div");
        slotEl.className = "held-slot-card";
        slotEl.innerHTML = `
          <div class="held-slot-left">
            <span class="held-slot-num">Slot ${slotNum}</span>
            <img class="held-slot-icon" src="${itImg}" alt="${itData.name}" onerror="this.src='icons/icon16.png'">
            <div class="held-slot-details">
              <span class="held-slot-name">${itData.name}</span>
              <span class="held-slot-desc">${itData.boost || itData.desc || t("insp_item_active", "Trang bị đang kích hoạt")}</span>
            </div>
          </div>
          <button class="btn-unequip-item" data-item="${itemKey}" title="${t("insp_unequip_title", "Tháo vật phẩm này về túi")}">
            ${t("insp_btn_unequip", "Tháo")}
          </button>
        `;

        slotEl.querySelector(".btn-unequip-item").addEventListener("click", async () => {
          await handleEquipUnequip(itemKey, "unequip");
        });
        heldItemsBox.appendChild(slotEl);
      } else {
        const emptyEl = document.createElement("div");
        emptyEl.className = "held-slot-empty";
        emptyEl.innerHTML = `
          <span>Slot ${slotNum}: <b style="color:var(--s2-faint);">${t("insp_empty_slot", "Trống (Empty)")}</b></span>
          <span style="font-size:10px; color:var(--s2-gold);">${t("insp_choose_bag_hint", "Chọn từ túi đồ bên dưới để trang bị ⬇")}</span>
        `;
        heldItemsBox.appendChild(emptyEl);
      }
    }

    // 2. Render Bag Items (Player's inventory)
    bagListBox.innerHTML = "";
    const allBagItems = Array.from(userOwnedItems).filter(
      (k) => k && k !== "TMDISC" && k !== "RARECANDY" && k !== "ABILITYPATCH" && k !== "COIN"
    );
    if (bagCountEl) bagCountEl.textContent = `${allBagItems.length} ${t("insp_bag_items_count", "loại vật phẩm")}`;

    if (allBagItems.length === 0) {
      bagListBox.innerHTML = `<p style="font-size:10.5px; color:var(--s2-faint); padding:6px;">${t("insp_bag_empty", "Chưa có trang bị nào trong túi đồ. Hãy mua thêm từ Shop hoặc mở Capsule!")}</p>`;
    } else {
      allBagItems.forEach((k) => {
        const itData = HELD_ITEMS_DATA[k] || { name: k, desc: "", img: `items/${k}.png` };
        const itImg = itData.img ? `https://www.brawldex.live/${itData.img}` : `https://www.brawldex.live/items/${k}.png`;
        const isEquippedHere = heldList.includes(k);
        const canEquip = !isEquippedHere && heldList.length < openSlots;

        const row = document.createElement("div");
        row.className = "bag-item-card";
        row.innerHTML = `
          <div class="bag-item-left">
            <img class="bag-item-icon" src="${itImg}" alt="${itData.name}" onerror="this.src='icons/icon16.png'">
            <div class="bag-item-details">
              <span class="bag-item-name">
                ${itData.name}
                ${isEquippedHere ? `<span style="color:var(--s2-gold); font-size:9.5px; font-weight:normal;">(${t("insp_btn_equipped", "Đang giữ")})</span>` : ''}
              </span>
              <span class="bag-item-desc">${itData.boost || itData.desc || ""}</span>
            </div>
          </div>
          <button class="btn-equip-item" data-item="${k}" ${canEquip ? "" : "disabled"}>
            ${isEquippedHere ? t("insp_btn_equipped", "Đang giữ") : (heldList.length >= openSlots ? t("insp_btn_slots_full", "Đầy slot") : t("insp_btn_equip", "Trang bị"))}
          </button>
        `;

        if (canEquip) {
          row.querySelector(".btn-equip-item").addEventListener("click", async () => {
            await handleEquipUnequip(k, "equip");
          });
        }
        bagListBox.appendChild(row);
      });
    }
  }

  async function handleEquipUnequip(itemKey, mode) {
    showToast(mode === "equip" ? `${t("toast_equipping", "Đang trang bị")} ${itemKey}...` : `${t("toast_unequipping", "Đang tháo")} ${itemKey}...`);

    let success = false;
    let resData = null;

    // 1. Send action to tab/content script
    const tabRes = await sendTabMessage({
      action: "save_held_item",
      pokemon_id: mon.id,
      code: mon.code,
      item: itemKey,
      mode: mode
    });

    if (tabRes && tabRes.ok) {
      success = true;
      resData = tabRes;
    } else {
      // 2. Direct Supabase REST fallback if token available
      try {
        let curHeld = Array.isArray(mon.items) ? [...mon.items] : (mon.item ? [mon.item] : []);
        if (mode === "equip") {
          if (!curHeld.includes(itemKey)) curHeld.push(itemKey);
        } else {
          curHeld = curHeld.filter((x) => x !== itemKey);
        }
        const authHeader = currentToken ? `Bearer ${currentToken}` : `Bearer ${API_KEY}`;
        const resp = await fetch(`${BASE_API}/pokemon?id=eq.${encodeURIComponent(mon.id)}`, {
          method: "PATCH",
          headers: {
            "apikey": API_KEY,
            "Authorization": authHeader,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            item: curHeld[0] || null,
            items: curHeld
          })
        });
        if (resp.ok) {
          success = true;
          resData = { item: curHeld[0] || null, items: curHeld };
        }
      } catch (e) {}
    }

    if (success && resData) {
      mon.items = resData.items;
      mon.item = resData.item;
      // Update in allPokemon
      const pMon = allPokemon.find((x) => x.code === mon.code || (mon.id && x.id === mon.id));
      if (pMon) {
        pMon.items = resData.items;
        pMon.item = resData.item;
      }
      showToast(mode === "equip" ? t("toast_equip_success", "🎉 Đã trang bị thành công!") : t("toast_unequip_success", "✓ Đã tháo trang bị!"));
      renderInspectorItems();
      filterAndRenderDeck();
    } else {
      showToast(t("toast_equip_fail", "Không thể cập nhật trang bị lúc này! Hãy kiểm tra tab Brawldex."), true);
    }
  }

  renderInspectorItems();

  // 9. Moveset & TM Reroll
  function renderMoves() {
    const movesList = document.getElementById("inspMovesList");
    const canReroll = currentTmDiscs > 0;

    movesList.innerHTML = (mon.moves || []).map((mv, idx) => `
      <div class="move-slot-card">
        <div class="move-slot-info">
          <span class="type-badge ${String(mv.t || 'normal').toLowerCase()}">${mv.t || 'NORMAL'}</span>
          <div>
            <span class="move-name">${mv.n || mv.id}</span>
            <span class="move-meta">${mv.c || ''} · Power: ${mv.p ?? '-'}</span>
          </div>
        </div>
        <button class="btn-reroll-tm ${canReroll ? '' : 'disabled'}" data-slot="${idx}" ${canReroll ? '' : 'disabled'} title="${canReroll ? (currentLang === 'en' ? `Reroll this move with 1 TM Disc (Have: ${currentTmDiscs})` : `Reroll chiêu này bằng 1 TM Disc (Hiện có: ${currentTmDiscs})`) : (currentLang === 'en' ? `No TM Discs left (Have: 0)` : `Bạn không có TM Disc để đổi chiêu (Hiện có: 0)`)}">
          🎲 ${canReroll ? t("insp_btn_reroll_tm", "Reroll TM") : t("insp_btn_reroll_no_tm", "Reroll (Hết TM)")}
        </button>
      </div>
    `).join("");

    movesList.querySelectorAll(".btn-reroll-tm:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const slotIdx = parseInt(btn.dataset.slot, 10);
        btn.disabled = true;
        btn.textContent = t("insp_btn_rerolling", "⏳ Đang đổi...");

        const res = await sendTabMessage({
          action: "reroll_move",
          pokemon_id: mon.id,
          slot: slotIdx
        });

        if (res && res.ok && res.data) {
          showToast(currentLang === 'en' ? `🎉 Move rerolled: ${res.data.old?.n || ''} ➜ ${res.data.new?.n || ''}!` : `🎉 Đã đổi chiêu: ${res.data.old?.n || ''} ➜ ${res.data.new?.n || ''}!`);
          if (Array.isArray(res.data.moves)) {
            mon.moves = res.data.moves;
          }
          if (currentTmDiscs > 0) currentTmDiscs--;
          renderMoves();
          renderBagTab();
          filterAndRenderDeck();
        } else {
          showToast((res && res.error) || t("toast_reroll_fail", "Không thể reroll chiêu này!"), true);
          btn.disabled = false;
          btn.textContent = `🎲 ${t("insp_btn_reroll_tm", "Reroll TM")}`;
        }
      });
    });
  }
  renderMoves();

  // 10. Base Stats (HP, ATK, DEF, SPE, SPA, SPD)
  const baseStats = info.s || [44, 44, 44, 44, 44, 44];
  const statLabels = ["HP", "ATK", "DEF", "SPE", "SPA", "SPD"];
  const statClasses = ["hp", "atk", "def", "spe", "spa", "spd"];
  const totalStats = baseStats.reduce((a, b) => a + b, 0);
  document.getElementById("inspStatsTotal").textContent = totalStats;

  const statBarsList = document.getElementById("inspStatBars");
  statBarsList.innerHTML = baseStats.map((val, idx) => {
    const lbl = statLabels[idx];
    const cls = statClasses[idx];
    const pct = Math.min(100, Math.round((val / 160) * 100));
    return `
      <div class="stat-bar-row">
        <span class="stat-lbl">${lbl}</span>
        <span class="stat-val">${val}</span>
        <div class="stat-meter">
          <div class="stat-meter-fill ${cls}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join("");

  // 11. Evolution Tracker
  const evoReqBadge = document.getElementById("inspEvoReq");
  const evoBar = document.getElementById("inspEvoBar");
  const evoActionRow = document.getElementById("inspEvoActionRow");
  evoActionRow.innerHTML = "";

  if (isPerma) {
    const needKos = 30;
    evoReqBadge.textContent = `${kos} / ${needKos} KOs`;
    const pct = Math.min(100, Math.round((kos / needKos) * 100));
    evoBar.style.width = `${pct}%`;

    if (kos >= needKos) {
      const btnEvolve = document.createElement("button");
      btnEvolve.className = "btn-evolve";
      btnEvolve.textContent = t("insp_btn_ready_evolve", "✨ Sẵn Sàng Tiến Hóa (Evolve)");
      btnEvolve.onclick = async () => {
        btnEvolve.disabled = true;
        btnEvolve.textContent = t("insp_btn_evolving", "Đang tiến hóa...");
        const res = await sendTabMessage({ action: "evolve_pokemon", pokemon_id: mon.id });
        if (res && res.ok) {
          showToast(t("toast_evolve_success", "🎉 Tiến hóa thành công!"));
          modal.classList.add("hidden");
          currentInspectingMon = null;
          await refreshAll();
        } else {
          showToast((res && res.error) || t("toast_evolve_fail", "Không thể tiến hóa lúc này"), true);
          btnEvolve.disabled = false;
        }
      };
      evoActionRow.appendChild(btnEvolve);
    }
  } else {
    evoReqBadge.textContent = currentLang === 'en' ? `1 Rare Candy (Have: ${currentCandies})` : `1 Rare Candy (Có: ${currentCandies})`;
    evoBar.style.width = currentCandies >= 1 ? "100%" : "0%";
    if (currentCandies >= 1) {
      const btnEvolve = document.createElement("button");
      btnEvolve.className = "btn-evolve";
      btnEvolve.textContent = t("insp_btn_candy_evolve", "🍬 Dùng 1 Candy Tiến Hóa");
      btnEvolve.onclick = async () => {
        btnEvolve.disabled = true;
        btnEvolve.textContent = t("insp_btn_evolving", "Đang tiến hóa...");
        const res = await sendTabMessage({ action: "evolve_pokemon", pokemon_id: mon.id });
        if (res && res.ok) {
          showToast(t("toast_evolve_success", "🎉 Tiến hóa thành công!"));
          modal.classList.add("hidden");
          currentInspectingMon = null;
          await refreshAll();
        } else {
          showToast((res && res.error) || t("toast_evolve_fail", "Không thể tiến hóa lúc này"), true);
          btnEvolve.disabled = false;
        }
      };
      evoActionRow.appendChild(btnEvolve);
    }
  }

  // 12. Stays Badge
  const staysBadge = document.getElementById("inspStaysBadge");
  staysBadge.style.display = isPerma ? "inline-block" : "none";

  modal.classList.remove("hidden");
  renderLucide();
}

// ==========================================
// SHOP & TODAY STOCK ENGINE
// ==========================================
async function fetchShopStock() {
  try {
    const url = `${BASE_API}/shop_stock?select=*&order=window_start.desc,slot.asc&limit=7`;
    const resp = await fetch(url, {
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "*/*"
      }
    });

    if (resp.ok) {
      todayStockItems = await resp.json();
      await fetchShopPurchases();
      renderTodayStock(todayStockItems);
    }
  } catch (err) {
    console.error("fetchShopStock error:", err);
  }
}

let lastKnownWindow = null;

async function fetchShopPurchases() {
  const stockWin = (todayStockItems && todayStockItems[0] && todayStockItems[0].window_start) || getShopWindowStart();

  // If the 8-hour window has genuinely shifted to a new window (by > 1 hour), reset old slots
  if (lastKnownWindow && stockWin) {
    const tOld = new Date(lastKnownWindow).getTime();
    const tNew = new Date(stockWin).getTime();
    if (!isNaN(tOld) && !isNaN(tNew) && Math.abs(tNew - tOld) > 3600000) {
      boughtSlots.clear();
    }
  }
  lastKnownWindow = stockWin;

  // 1. Query active Brawldex tab (reads page bridge window.SHOP + __bdxSb + live DOM)
  try {
    const tabRes = await sendTabMessage({
      action: "get_shop_purchases",
      window_start: stockWin,
      owner_id: currentOwnerId
    });
    if (tabRes && Array.isArray(tabRes.bought)) {
      tabRes.bought.forEach((s) => {
        const n = Number(s);
        if (!isNaN(n)) boughtSlots.add(n);
      });
    }
    if (tabRes && tabRes.token) {
      currentToken = tabRes.token;
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ brawldex_token: currentToken });
      }
    }
  } catch (e) {}

  // 2. Query shop_purchases REST endpoint with token
  if (currentToken && currentOwnerId) {
    try {
      const pUrl = `${BASE_API}/shop_purchases?select=slot,window_start&profile_id=eq.${encodeURIComponent(currentOwnerId)}&order=created_at.desc&limit=20`;
      const pResp = await fetch(pUrl, {
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${currentToken}`,
          "Accept": "*/*"
        }
      });
      if (pResp.ok) {
        const rows = await pResp.json();
        if (Array.isArray(rows)) {
          const targetTime = new Date(stockWin).getTime();
          rows.forEach((r) => {
            const rTime = new Date(r.window_start).getTime();
            if (r.window_start === stockWin || (!isNaN(targetTime) && !isNaN(rTime) && Math.abs(targetTime - rTime) < 3600000)) {
              const n = Number(r.slot);
              if (!isNaN(n)) boughtSlots.add(n);
            }
          });
        }
      }
    } catch (e) {}
  }

  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({
      brawldex_bought_slots: Array.from(boughtSlots),
      brawldex_bought_window: stockWin
    });
  }
}

function renderTodayStock(items) {
  if (!items || items.length === 0) {
    todayStockList.innerHTML = `<p style="font-size: 11px; color: var(--s2-faint); padding: 10px;">${t("shop_empty_stock", "Cửa hàng đang chuẩn bị nhập đợt hàng mới...")}</p>`;
    return;
  }

  todayStockList.innerHTML = "";
  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "shop-mon-card";

    let title = "";
    let sub = "";
    let spriteUrl = "";
    let ballTier = it.ball || "poke";

    if (it.item) {
      title = it.item;
      sub = `${t("shop_item_sub", "Vật phẩm")} (${it.item})`;
      spriteUrl = `https://www.brawldex.live/items/${it.item}.png`;
    } else {
      const dex = it.dex;
      const dexInfo = getDexInfo(dex);
      title = dexInfo.n || `Dex #${dex}`;
      sub = `#${dex} · ${ballTier.toUpperCase()} BALL`;
      spriteUrl = `https://www.brawldex.live/front/${dex}.png`;
    }

    const price = it.price || 0;
    const canAfford = currentCoins >= price;

    // Chỉ tính là Đã Mua khi slot đó thực sự nằm trong danh sách mua của ca 8 tiếng
    const slotNum = Number(it.slot);
    const isBought = boughtSlots.has(it.slot) || (!isNaN(slotNum) && boughtSlots.has(slotNum));
    const alreadyOwnsDex = it.dex && allPokemon.some((m) => String(m.dex) === String(it.dex));
    const alreadyOwnsItem = it.item && userOwnedItems.has(it.item);

    const ownedNote = alreadyOwnsDex ? `<span class="owned-tag">${t("shop_owned_warehouse", "Đang có trong kho")}</span>` : (alreadyOwnsItem ? `<span class="owned-tag">${t("shop_owned_bag", "Đã có trong túi")}</span>` : "");
    let badgeHtml = ownedNote;
    let buttonHtml = "";

    if (isBought) {
      buttonHtml = `<div class="btn-slot-placeholder"><span class="stock-badge owned"><i data-lucide="check"></i> ${t("shop_status_bought", "Đã Mua")}</span></div>`;
    } else if (canAfford) {
      badgeHtml = `<span class="stock-badge avail"><i data-lucide="check-circle-2"></i> ${t("shop_status_avail", "Khả dụng")}</span> ${ownedNote}`;
      buttonHtml = `<button class="btn-buy-slot" data-slot="${it.slot}" data-type="${it.item ? 'item' : 'mon'}" data-price="${price}" data-name="${title}">
        <i data-lucide="coins"></i> ${t("btn_buy", "Mua")} (${price}🪙)
      </button>`;
    } else {
      const diff = price - currentCoins;
      // ẨN NÚT MUA khi không đủ tiền - hiển thị thẻ trạng thái duy nhất ở bên phải
      buttonHtml = `<div class="btn-slot-placeholder"><span class="stock-badge lack"><i data-lucide="alert-circle"></i> ${t("shop_status_lack", "Thiếu")} ${diff}🪙</span></div>`;
    }

    row.innerHTML = `
      <div class="sm-left">
        <img class="sm-sprite" src="${spriteUrl}" alt="${title}" onerror="this.src='https://www.brawldex.live/emblems/POKEBALL.png'">
        <div class="sm-info">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="sm-name">${title}</span>
            ${badgeHtml}
          </div>
          <span class="sm-sub">${sub}</span>
        </div>
      </div>
      <div class="sm-right">
        ${buttonHtml}
      </div>
    `;

    const buyBtn = row.querySelector(".btn-buy-slot:not([disabled])");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        buyShopItem(it.slot, it.item ? "item" : "mon", price, title, buyBtn);
      });
    }

    todayStockList.appendChild(row);
  });
}

function updateAlwaysInStock() {
  document.querySelectorAll(".static-item-row").forEach((row) => {
    const btn = row.querySelector(".btn-buy-static");
    if (!btn) return;
    const item = btn.dataset.item;
    const price = parseInt(btn.dataset.price, 10) || 0;
    const isDiamond = btn.classList.contains("diamond") || item === "tm_diamonds";

    let canAfford = false;
    let diff = 0;

    if (isDiamond) {
      canAfford = currentNuggets >= price;
      diff = price - currentNuggets;
    } else {
      canAfford = currentCoins >= price;
      diff = price - currentCoins;
    }

    let lackBadge = row.querySelector(".static-lack-badge");

    if (canAfford) {
      btn.style.display = "inline-flex";
      btn.disabled = false;
      btn.classList.remove("disabled");
      btn.innerHTML = isDiamond ? `<i data-lucide="gem"></i> ${price}` : `<i data-lucide="coins"></i> ${price}`;
      btn.title = currentLang === 'en' ? `Buy for ${price} ${isDiamond ? 'Diamonds' : 'Coins'}` : `Mua với giá ${price} ${isDiamond ? 'Diamonds' : 'Coins'}`;
      if (lackBadge) lackBadge.style.display = "none";
    } else {
      // Ẩn nút đi nếu không đủ tiền theo yêu cầu người dùng
      btn.style.display = "none";
      if (!lackBadge) {
        lackBadge = document.createElement("span");
        lackBadge.className = "static-lack-badge stock-badge lack";
        const actionWrap = row.querySelector(".si-action") || row;
        actionWrap.appendChild(lackBadge);
      }
      lackBadge.style.display = "inline-flex";
      lackBadge.innerHTML = `<i data-lucide="alert-circle"></i> ${t("shop_status_lack", "Thiếu")} ${diff}${isDiamond ? '💎' : '🪙'}`;
    }
  });

  const candyEl = document.getElementById("shopCandyCount");
  if (candyEl) candyEl.textContent = currentCandies;

  const patchEl = document.getElementById("shopPatchCount");
  if (patchEl) patchEl.textContent = currentPatches;
}

function renderBagTab() {
  const bagRareCandyCount = document.getElementById("bagRareCandyCount");
  if (bagRareCandyCount) bagRareCandyCount.textContent = `×${currentCandies}`;

  const bagTmDiscCount = document.getElementById("bagTmDiscCount");
  if (bagTmDiscCount) bagTmDiscCount.textContent = `×${currentTmDiscs}`;

  const bagShinyPotionCount = document.getElementById("bagShinyPotionCount");
  if (bagShinyPotionCount) bagShinyPotionCount.textContent = `×${currentShinyPotion}`;

  const bagShinyDustCount = document.getElementById("bagShinyDustCount");
  if (bagShinyDustCount) bagShinyDustCount.textContent = `×${currentShinyDust}`;

  const bagShinyDustRatio = document.getElementById("bagShinyDustRatio");
  if (bagShinyDustRatio) bagShinyDustRatio.textContent = `${currentShinyDust} of 3`;

  const btnUseShinyPotion = document.getElementById("btnUseShinyPotion");
  if (btnUseShinyPotion) btnUseShinyPotion.disabled = currentShinyPotion <= 0;

  const btnTradeShinyDust = document.getElementById("btnTradeShinyDust");
  if (btnTradeShinyDust) btnTradeShinyDust.disabled = currentShinyDust < 3;

  const bagItemCapsuleCount = document.getElementById("bagItemCapsuleCount");
  if (bagItemCapsuleCount) bagItemCapsuleCount.textContent = `×${currentCapsules}`;

  const btnOpenCapsule = document.getElementById("btnOpenCapsule");
  if (btnOpenCapsule) btnOpenCapsule.disabled = currentCapsules <= 0;

  const bagHeldGrid = document.getElementById("bagHeldItemsGrid");
  const bagCountEl = document.getElementById("bagHeldItemsCount");
  if (!bagHeldGrid) return;

  const items = Array.from(userOwnedItems);
  if (bagCountEl) bagCountEl.textContent = items.length;

  if (items.length === 0) {
    bagHeldGrid.innerHTML = `
      <div style="grid-column: span 2; padding: 16px; text-align: center; color: var(--s2-faint); font-size: 11px;">
        ${t("bag_held_empty", "Túi đồ trang bị hiện đang trống.<br>Hãy mua hoặc mở Capsule để nhận Item!")}
      </div>
    `;
    return;
  }

  bagHeldGrid.innerHTML = items.map((itKey) => {
    const meta = HELD_ITEMS_DATA[itKey] || {};
    const name = meta.n || itKey;
    const desc = meta.d || (currentLang === "en" ? "Held item for Pokémon" : "Vật phẩm trang bị cho Pokémon");
    const imgUrl = `https://www.brawldex.live/items/${itKey}.png`;
    return `
      <div class="bag-held-card">
        <img class="bag-held-img" src="${imgUrl}" alt="${name}" onerror="this.src='https://www.brawldex.live/items/COIN.png'">
        <div class="bag-held-info">
          <span class="bag-held-name">${name}</span>
          <span class="bag-held-sub">${desc}</span>
        </div>
      </div>
    `;
  }).join("");
}

async function buyShopItem(slot, type, price, title, targetBtn) {
  if (currentCoins < price) {
    showToast(`${t("toast_lack_coins", "Không đủ Coins! Bạn cần")} ${price}🪙.`, true);
    return;
  }

  const origText = targetBtn ? targetBtn.innerHTML : "";
  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.textContent = t("shop_buying", "Đang mua...");
  }

  try {
    let rpcName = "buy_shop_mon";
    let body = { p_slot: slot };

    if (type === "item") {
      rpcName = "buy_shop_item";
      const win = getShopWindowStart();
      body = { p_slot: slot, p_profile: currentOwnerId, p_window: win };
    }

    let success = false;
    let errorMsg = "";

    // 1. Direct fetch if JWT token is available
    if (currentToken) {
      const resp = await fetch(`${BASE_API}/rpc/${rpcName}`, {
        method: "POST",
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const resJson = await resp.json();
      if (resp.ok && resJson && resJson.ok !== false) {
        success = true;
      } else {
        errorMsg = resJson.message || resJson.error || "Giao dịch không thành công";
      }
    }

    // 2. Fallback to active browser tab / page via content script
    if (!success) {
      const tabRes = await sendTabMessage({
        action: "buy_shop_slot",
        rpcName,
        body
      });

      if (tabRes && tabRes.ok) {
        success = true;
      } else if (tabRes && tabRes.error) {
        errorMsg = tabRes.error;
      }
    }

    if (success) {
      currentCoins -= price;
      const nSlot = Number(slot);
      if (!isNaN(nSlot)) boughtSlots.add(nSlot);
      boughtSlots.add(slot);

      const curWin = (todayStockItems && todayStockItems[0] && todayStockItems[0].window_start) || getShopWindowStart();
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          brawldex_bought_slots: Array.from(boughtSlots),
          brawldex_bought_window: curWin
        });
      }
      updateHeaderUI();
      if (todayStockItems && todayStockItems.length > 0) {
        renderTodayStock(todayStockItems);
      }
      showToast(`${t("toast_buy_success", "🎉 Mua thành công")} ${title}!`);
      await refreshAll();
    } else {
      showToast(errorMsg || t("toast_buy_need_auth", "Cần mở tab brawldex.live (đã đăng nhập) để xác thực mua!"), true);
      if (targetBtn) {
        targetBtn.disabled = false;
        targetBtn.innerHTML = origText;
      }
    }
  } catch (err) {
    showToast(t("toast_buy_error", "Lỗi khi mua: ") + err.message, true);
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.innerHTML = origText;
    }
  }
}

async function buyStaticItem(val, type, price, title, targetBtn) {
  const isDiamond = type === "tm_diamonds";
  if (isDiamond && currentNuggets < price) {
    showToast(`${t("toast_lack_diamonds", "Không đủ Diamonds! Bạn cần thêm")} ${price - currentNuggets}💎.`, true);
    return;
  } else if (!isDiamond && currentCoins < price) {
    showToast(`${t("toast_lack_coins", "Không đủ Coins! Bạn cần thêm")} ${price - currentCoins}🪙.`, true);
    return;
  }

  const origText = targetBtn ? targetBtn.innerHTML : "";
  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.textContent = t("shop_buying", "Đang mua...");
  }

  try {
    let rpcName = "buy_ball";
    let body = {};

    if (type === "ball") {
      rpcName = val === "volt" ? "buy_volt_ball" : "buy_ball";
      body = {};
    } else if (type === "tm") {
      rpcName = "buy_tm";
      body = { p_profile: currentOwnerId, p_qty: val || 1 };
    } else if (type === "tm_diamonds") {
      rpcName = "buy_tm_diamonds";
      body = { p_qty: val || 1 };
    } else if (type === "candy") {
      rpcName = "buy_candy";
      body = { p_qty: val || 1 };
    } else if (type === "ability_patch") {
      rpcName = "buy_ability_patch";
      body = {};
    }

    let success = false;
    let errorMsg = "";

    // 1. Direct fetch if JWT token is available
    if (currentToken) {
      const resp = await fetch(`${BASE_API}/rpc/${rpcName}`, {
        method: "POST",
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const resJson = await resp.json();
      if (resp.ok && resJson && resJson.ok !== false) {
        success = true;
      } else {
        errorMsg = resJson.message || resJson.error || "Giao dịch không thành công";
      }
    }

    // 2. Tab / Page fallback
    if (!success) {
      const tabRes = await sendTabMessage({
        action: "buy_shop_slot",
        rpcName,
        body
      });

      if (tabRes && tabRes.ok) {
        success = true;
      } else if (tabRes && tabRes.error) {
        errorMsg = tabRes.error;
      }
    }

    if (success) {
      if (isDiamond) {
        currentNuggets -= price;
      } else {
        currentCoins -= price;
      }
      if (type === "candy") currentCandies += val;
      if (type === "tm" || type === "tm_diamonds") currentTmDiscs += val;
      if (type === "ability_patch") currentPatches += val;

      updateHeaderUI();
      renderBagTab();
      updateAlwaysInStock();
      showToast(`${t("toast_buy_success", "🎉 Mua thành công")} ${title}!`);
      await refreshAll();
    } else {
      showToast(errorMsg || t("toast_buy_need_auth", "Cần mở tab brawldex.live (đã đăng nhập) để xác thực mua!"), true);
      if (targetBtn) {
        targetBtn.disabled = false;
        targetBtn.innerHTML = origText;
      }
    }
  } catch (err) {
    showToast(t("toast_buy_error", "Lỗi khi mua: ") + err.message, true);
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.innerHTML = origText;
    }
  }
}

// ==========================================
// TRAINER PROFILE & BLACK MARKET
// ==========================================
async function fetchTrainerProfile() {
  try {
    const authHeader = currentToken ? `Bearer ${currentToken}` : `Bearer ${API_KEY}`;
    // Select essential profile and stats fields
    const url = `${BASE_API}/profiles?select=coins,items,xp,level,candies,nuggets,id,display_name,tiktok_user,calling_card,trainer,skin,emblem_mon,starter_dex,rating,stats&id=eq.${encodeURIComponent(currentOwnerId)}`;
    const resp = await fetch(url, {
      headers: {
        "apikey": API_KEY,
        "Authorization": authHeader,
        "Accept": "*/*"
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const p = data[0];
        if (p.coins != null) currentCoins = p.coins;
        if (p.candies != null) currentCandies = p.candies;
        if (p.nuggets != null) currentNuggets = p.nuggets;
        if (p.level != null) currentLevel = p.level;
        if (p.rating != null) currentRating = p.rating;
        if (p.display_name) currentTrainerName = p.display_name;
        if (p.tiktok_user) currentTiktok = p.tiktok_user;

        // DYNAMIC TRAINER & PARTNER FROM API PROFILES!
        if (p.trainer) {
          currentTrainerKey = p.trainer;
          currentTrainerSprite = getTrainerSrc(currentTrainerKey);
        }

        if (p.emblem_mon || p.starter_dex) {
          currentPartnerDex = String(p.emblem_mon || p.starter_dex);
        }

        updateHeaderUI();

        if (p.stats) {
          if (p.stats.kos != null) statKos.textContent = p.stats.kos;
          if (p.stats.wins != null) statWins.textContent = p.stats.wins;
          if (p.stats.losses != null) statLosses.textContent = p.stats.losses;
          if (p.stats.win_rate != null) statWinRate.textContent = `${p.stats.win_rate}%`;
        }

        if (Array.isArray(p.items)) {
          const tmCount = p.items.filter(x => x === "TMDISC").length;
          const potCount = p.items.filter(x => x === "SHINYPOTION").length;
          const dustCount = p.items.filter(x => x === "SHINYDUST").length;
          const capCount = p.items.filter(x => x === "ITEMCAPSULE").length;

          if (tmCount > 0) currentTmDiscs = tmCount;
          if (potCount > 0) currentShinyPotion = potCount;
          if (dustCount > 0) currentShinyDust = dustCount;
          if (capCount > 0) currentCapsules = capCount;

          p.items.forEach((it) => {
            if (it && it !== "TMDISC" && it !== "SHINYPOTION" && it !== "SHINYDUST" && it !== "ITEMCAPSULE" && it !== "RARECANDY" && it !== "COIN") {
              userOwnedItems.add(it);
            }
          });
        }
        if (userOwnedItems.size > 0 && platesList) {
          platesList.innerHTML = Array.from(userOwnedItems).map((it) => {
            const itData = HELD_ITEMS_DATA[it];
            const itName = itData ? itData.name : it;
            const itImg = itData && itData.img ? `https://www.brawldex.live/${itData.img}` : `https://www.brawldex.live/items/${it}.png`;
            return `<span class="plate-pill"><img src="${itImg}" style="width:14px;height:14px;vertical-align:-2px;image-rendering:pixelated;" onerror="this.style.display='none'"> ${itName}</span>`;
          }).join("");
        }
      }
    }
  } catch (e) {
    console.warn("fetchTrainerProfile error:", e);
  }
}

async function fetchBlackMarket() {
  try {
    const url = `${BASE_API}/rpc/bm_window_get`;
    const resp = await fetch(url, {
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "*/*"
      }
    });

    if (resp.ok) {
      const bm = await resp.json();
      if (bm) {
        const isLive = !!bm.live;
        marketDot.classList.toggle("on", isLive);
        marketStatus.textContent = isLive ? t("market_status_open", "Đang mở bán") : t("market_status_closed", "Đang đóng");
        marketStatus.style.color = isLive ? "var(--neon-green)" : "var(--s2-faint)";

        if (Array.isArray(bm.stock) && bm.stock.length > 0) {
          marketStockList.innerHTML = bm.stock.map((stk) => `
            <div class="stock-item">
              <i data-lucide="sparkles" class="stock-ico"></i>
              <div class="stock-info">
                <span class="stock-name">${stk}</span>
                <span class="stock-detail">${t("market_item_sub", "Vật phẩm thị trường đen")}</span>
              </div>
            </div>
          `).join("");
        }
      }
    }
  } catch (e) {
    console.warn("fetchBlackMarket error:", e);
  }
}

function copyText(text, toastMsg, targetBtn = null, btnCopiedText = "Copied ✓") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(toastMsg);
    if (targetBtn) {
      const origHtml = targetBtn.innerHTML;
      targetBtn.classList.add("copied");
      targetBtn.innerHTML = btnCopiedText;
      setTimeout(() => {
        targetBtn.classList.remove("copied");
        targetBtn.innerHTML = origHtml;
        renderLucide();
      }, 1200);
    }
  }).catch((err) => {
    showToast("Không thể copy: " + err.message, true);
  });
}

let toastTimer = null;
function showToast(msg, isError = false) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessageEl.textContent = msg;
  toastEl.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 1800);
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
