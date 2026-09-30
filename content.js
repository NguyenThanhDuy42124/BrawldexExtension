// Brawldex Live Account Auto-Detector & Floating Chat Bubble (Manifest V3)
(function() {
  // Prevent duplicate execution
  if (window.__brawldex_helper_injected) return;
  window.__brawldex_helper_injected = true;

  const isTikTok = location.hostname.includes("tiktok.com");
  const isBrawldexLive = location.hostname.includes("brawldex.live");

  // Main-world Bridge: Access window.SHOP and window.__bdxSb directly on brawldex.live
  if (isBrawldexLive) {
    try {
      const script = document.createElement("script");
      script.textContent = `
        (function() {
          window.addEventListener("message", async (e) => {
            if (!e.data || e.data.source !== "brawldex_ext_cs") return;
            const { action, requestId, payload } = e.data;
            if (action === "get_live_shop") {
              let bought = [];
              try {
                if (window.SHOP && window.SHOP.bought && window.SHOP.bought.size > 0) {
                  bought = Array.from(window.SHOP.bought);
                }
              } catch(err) {}

              let token = null;
              try {
                if (window.__bdxSb && window.__bdxSb.auth) {
                  const sess = await window.__bdxSb.auth.getSession();
                  if (sess && sess.data && sess.data.session) {
                    token = sess.data.session.access_token;
                  }
                }
              } catch(err) {}

              if (bought.length === 0 && window.__bdxSb && payload && payload.ownerId) {
                try {
                  const { data } = await window.__bdxSb.from("shop_purchases").select("slot,window_start").eq("profile_id", payload.ownerId).order("created_at", { ascending: false }).limit(20);
                  if (data && Array.isArray(data)) {
                    const targetTime = payload.win ? new Date(payload.win).getTime() : NaN;
                    data.forEach(r => {
                      const rTime = new Date(r.window_start).getTime();
                      if (!payload.win || r.window_start === payload.win || (!isNaN(targetTime) && !isNaN(rTime) && Math.abs(targetTime - rTime) < 3600000)) {
                        bought.push(Number(r.slot));
                      }
                    });
                  }
                } catch(err) {}
              }

              window.postMessage({
                source: "brawldex_ext_page",
                action: "get_live_shop_res",
                requestId,
                bought,
                token
              }, "*");
            }
          });
        })();
      `;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch(e) {}
  }

  function queryPageBridge(action, payload) {
    if (!isBrawldexLive) return Promise.resolve(null);
    return new Promise((resolve) => {
      const requestId = "req_" + Math.random().toString(36).slice(2);
      const listener = (event) => {
        if (event.data && event.data.source === "brawldex_ext_page" && event.data.requestId === requestId) {
          window.removeEventListener("message", listener);
          resolve(event.data);
        }
      };
      window.addEventListener("message", listener);
      window.postMessage({
        source: "brawldex_ext_cs",
        action,
        requestId,
        payload
      }, "*");
      setTimeout(() => {
        window.removeEventListener("message", listener);
        resolve(null);
      }, 1500);
    });
  }

  // ==========================================
  // 1. DATA EXTRACTION & AUTH SYNC
  // ==========================================
  function extractConsumablesFromDOM() {
    const data = {};
    const text = document.body ? document.body.innerText : "";

    // 1. Quét DOM .invrow (chuẩn Season 2 Brawldex)
    document.querySelectorAll(".invrow").forEach(row => {
      const b = row.querySelector("b");
      const qtyEl = row.querySelector(".qty");
      if (b && qtyEl) {
        const name = b.textContent.trim().toLowerCase();
        const qty = parseInt(qtyEl.textContent.replace(/\D/g, ""), 10) || 0;
        if (name.includes("rare candy")) data.candies = qty;
        else if (name.includes("tm disc")) data.tm_discs = qty;
        else if (name.includes("shiny potion")) data.shiny_potion = qty;
        else if (name.includes("shiny dust")) data.shiny_dust = qty;
        else if (name.includes("item capsule") || name.includes("capsule")) data.item_capsule = qty;
      }
    });

    if (text) {
      if (data.candies === undefined) {
        const candyMatch = text.match(/Rare Candy[\s\S]*?[×x](\d+)/i) || text.match(/You have (\d+)/i);
        if (candyMatch) data.candies = parseInt(candyMatch[1], 10);
      }
      if (data.tm_discs === undefined) {
        const tmMatch = text.match(/TM Disc[\s\S]*?[×x](\d+)/i);
        if (tmMatch) data.tm_discs = parseInt(tmMatch[1], 10);
      }
      if (data.shiny_potion === undefined) {
        const potionMatch = text.match(/Shiny Potion[\s\S]*?[×x](\d+)/i);
        if (potionMatch) data.shiny_potion = parseInt(potionMatch[1], 10);
      }
      if (data.shiny_dust === undefined) {
        const dustMatch = text.match(/Shiny Dust[\s\S]*?[×x](\d+)/i) || text.match(/(\d+)\s*of\s*3/i);
        if (dustMatch) data.shiny_dust = parseInt(dustMatch[1], 10);
      }
      if (data.item_capsule === undefined) {
        const capMatch = text.match(/Item Capsule[\s\S]*?[×x](\d+)/i);
        if (capMatch) data.item_capsule = parseInt(capMatch[1], 10);
      }
    }

    const coinEl = document.querySelector(".w2coin, .wallet-coins, [data-coins], .c-coins, #w2Coins, .sh2-pill, .sh2-wallet");
    if (coinEl && coinEl.textContent) {
      const c = parseInt(coinEl.textContent.replace(/\D/g, ""), 10);
      if (!isNaN(c) && c > 0) data.coins = c;
    }

    return data;
  }

  function extractAuthData() {
    if (isTikTok) return null; // On TikTok, data is loaded via chrome.storage.local

    let ownerId = null;
    let userName = null;
    let tiktokUser = null;
    let avatarUrl = null;
    let partnerDex = null;
    let token = null;
    let email = null;
    let cachedMons = null;
    let bagItems = [];
    let heldMap = [];

    // 1. Scan localStorage for Supabase Auth, Brawldex Pokemons & Profile Cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Extract cached Pokémon roster from bdx_mons_<user>
      if (key.startsWith("bdx_mons_")) {
        const u = key.replace("bdx_mons_", "");
        if (u) tiktokUser = u;
        try {
          const mons = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(mons) && mons.length > 0) {
            cachedMons = mons;
            if (!ownerId && mons[0].owner_id) ownerId = mons[0].owner_id;
          }
        } catch (e) {}
      }

      // Extract owner_id from bdx_rotom_day_<owner_id>
      if (key.startsWith("bdx_rotom_day_")) {
        const idPart = key.replace("bdx_rotom_day_", "");
        if (idPart && idPart !== "guest" && idPart.includes("-")) {
          if (!ownerId) ownerId = idPart;
        }
      }

      // Extract TikTok handle, Bag Items & Held Map from bdx_items_<user>
      if (key.startsWith("bdx_items_")) {
        const u = key.replace("bdx_items_", "");
        if (u && !tiktokUser) tiktokUser = u;
        try {
          const rawItems = localStorage.getItem(key);
          const parsedItems = JSON.parse(rawItems);
          if (parsedItems) {
            if (Array.isArray(parsedItems.items)) bagItems = parsedItems.items;
            if (Array.isArray(parsedItems.held)) heldMap = parsedItems.held;
          }
        } catch (e) {}
      }

      // Extract Supabase Session & Token
      if (key.includes("auth-token") || key.includes("supabase") || key.startsWith("sb-")) {
        try {
          const raw = localStorage.getItem(key);
          const parsed = JSON.parse(raw);
          if (parsed) {
            const user = parsed.user || (parsed.currentSession && parsed.currentSession.user);
            if (user && user.id && !ownerId) {
              ownerId = user.id;
            }
            if (user && user.email) email = user.email;
            const tk = parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token);
            if (tk) token = tk;
            if (!userName && user && user.user_metadata) {
              userName = user.user_metadata.full_name || user.user_metadata.name || null;
            }
          }
        } catch (e) {}
      }
    }

    // Merge held item mappings from bdx_items onto cached Pokémon
    if (Array.isArray(cachedMons) && Array.isArray(heldMap)) {
      for (const h of heldMap) {
        if (!h || !h.code) continue;
        const m = cachedMons.find(x => x.code === h.code);
        if (m && h.item) {
          m.item = h.item;
          if (!Array.isArray(m.items) || m.items.length === 0) {
            m.items = [h.item];
          } else if (!m.items.includes(h.item)) {
            m.items.unshift(h.item);
          }
        }
      }
    }

    // 2. Exact DOM Matching based on Brawldex Calling Card (#w2Card or .cod)
    const w2Card = document.getElementById("w2Card") || document.querySelector(".w2only[title*='profile']") || document.querySelector(".cod[data-ccuser]");
    if (w2Card) {
      const trImg = w2Card.querySelector(".c-tr") || document.querySelector(".cod .c-tr");
      if (trImg) avatarUrl = trImg.src;

      const monImg = w2Card.querySelector(".c-mon") || document.querySelector(".cod .c-mon");
      if (monImg && monImg.src) {
        const match = monImg.src.match(/(\d+)\.png/);
        if (match) partnerDex = match[1];
      }

      const nmEl = w2Card.querySelector(".nm");
      if (nmEl && nmEl.textContent) userName = nmEl.textContent.trim();

      const codEl = w2Card.classList.contains("cod") ? w2Card : w2Card.querySelector(".cod");
      if (codEl) {
        if (codEl.dataset.ccname) userName = codEl.dataset.ccname;
        if (codEl.dataset.ccuser) tiktokUser = codEl.dataset.ccuser;
      }
    }

    // 3. Quét DOM tìm Held Items & Plates (trang Held Items / Hub / Roster)
    document.querySelectorAll(".hubcell.have[data-item], [data-item], .bag-held-card[data-item], .irow[data-item]").forEach(el => {
      const it = el.dataset.item;
      if (it && it !== "Empty" && it !== "null" && !bagItems.includes(it)) {
        bagItems.push(it);
      }
    });

    if (Array.isArray(cachedMons)) {
      cachedMons.forEach(m => {
        if (m.item && m.item !== "Empty" && !bagItems.includes(m.item)) bagItems.push(m.item);
        if (Array.isArray(m.items)) {
          m.items.forEach(k => {
            if (k && k !== "Empty" && !bagItems.includes(k)) bagItems.push(k);
          });
        }
      });
    }

    if (!avatarUrl) {
      avatarUrl = "https://www.brawldex.live/trainers/BUGCATCHER.png";
    }

    const consumables = extractConsumablesFromDOM();

    // Default fallbacks to guarantee non-empty responses
    const payload = {
      brawldex_owner_id: ownerId || "",
      brawldex_user_name: userName || "Trainer",
      brawldex_tiktok: tiktokUser || "",
      brawldex_avatar: avatarUrl,
      brawldex_partner_dex: partnerDex || "390",
      brawldex_token: token,
      brawldex_email: email,
      cached_mons: cachedMons,
      brawldex_bag_items: bagItems,
      brawldex_held_map: heldMap,
      brawldex_synced_at: Date.now()
    };

    if (consumables.candies !== undefined) payload.brawldex_candies = consumables.candies;
    if (consumables.tm_discs !== undefined) payload.brawldex_tm_discs = consumables.tm_discs;
    if (consumables.shiny_potion !== undefined) payload.brawldex_shiny_potion = consumables.shiny_potion;
    if (consumables.shiny_dust !== undefined) payload.brawldex_shiny_dust = consumables.shiny_dust;
    if (consumables.item_capsule !== undefined) payload.brawldex_item_capsule = consumables.item_capsule;
    if (consumables.coins !== undefined) payload.brawldex_coins = consumables.coins;

    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(payload);
    }
    return payload;
  }

  // Initial detection if on brawldex
  if (isBrawldexLive) {
    extractAuthData();

    // Monitor DOM mutations for live profile changes
    let scanDebounce = null;
    const observer = new MutationObserver(() => {
      if (scanDebounce) clearTimeout(scanDebounce);
      scanDebounce = setTimeout(extractAuthData, 800);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  // ==========================================
  // 2. CENTRAL ACTION HANDLER (For Tab & Iframe)
  // ==========================================
  async function handleAction(request) {
    if (!request || !request.action) return { ok: false, error: "Yêu cầu không hợp lệ" };

    if (request.action === "detect_user") {
      const res = extractAuthData();
      return res || { ok: false, error: "Chưa tìm thấy thông tin tài khoản" };
    }

    if (request.action === "buy_shop_slot" || request.action === "call_rpc") {
      try {
        const authData = extractAuthData() || {};
        const token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const rpc = request.rpcName || request.rpc;
        const rpcUrl = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/rpc/${rpc}`;

        const resp = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "apikey": apiKey,
            "Authorization": token ? `Bearer ${token}` : `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify(request.body || {})
        });

        const resJson = await resp.json();
        if (resp.ok) {
          return { ok: true, data: resJson };
        } else {
          return { ok: false, error: resJson.message || resJson.error || "Giao dịch thất bại" };
        }
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    if (request.action === "get_shop_purchases") {
      try {
        const authData = extractAuthData() || {};
        let token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const win = request.window_start;
        const ownerId = request.owner_id || authData.brawldex_owner_id;

        const domBought = new Set();

        // 1. Query Page Bridge directly (reads window.SHOP.bought and window.__bdxSb)
        try {
          const bridgeRes = await queryPageBridge("get_live_shop", { win, ownerId });
          if (bridgeRes && Array.isArray(bridgeRes.bought)) {
            bridgeRes.bought.forEach(s => {
              const num = Number(s);
              if (!isNaN(num)) domBought.add(num);
            });
          }
          if (bridgeRes && bridgeRes.token) {
            token = bridgeRes.token;
            if (chrome && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ brawldex_token: token });
            }
          }
        } catch (e) {}

        // 2. Check live DOM on shop purchase buttons
        document.querySelectorAll("button.shop-buy, button.shop-buyitem, button[data-slot]").forEach((btn) => {
          const slotAttr = btn.dataset.slot;
          if (slotAttr === undefined || slotAttr === null || slotAttr === "") return;
          const slot = parseInt(slotAttr, 10);
          if (isNaN(slot)) return;
          const txt = (btn.textContent || "").trim().toLowerCase();
          const isBought = btn.classList.contains("quiet") ||
                           btn.classList.contains("bought") ||
                           btn.classList.contains("is-bought") ||
                           txt.includes("bought") ||
                           txt.includes("đã mua");
          if (isBought) {
            domBought.add(slot);
          }
        });

        // 3. Query Supabase shop_purchases table if token & owner available
        if (token && ownerId) {
          try {
            const url = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/shop_purchases?select=slot,window_start&profile_id=eq.${encodeURIComponent(ownerId)}&order=created_at.desc&limit=20`;
            const resp = await fetch(url, {
              headers: {
                "apikey": apiKey,
                "Authorization": `Bearer ${token}`,
                "Accept": "*/*"
              }
            });
            if (resp.ok) {
              const rows = await resp.json();
              if (Array.isArray(rows)) {
                const targetTime = win ? new Date(win).getTime() : NaN;
                rows.forEach(r => {
                  const rTime = new Date(r.window_start).getTime();
                  if (!win || r.window_start === win || (!isNaN(targetTime) && !isNaN(rTime) && Math.abs(targetTime - rTime) < 3600000)) {
                    const num = Number(r.slot);
                    if (!isNaN(num)) domBought.add(num);
                  }
                });
              }
            }
          } catch (e) {}
        }

        // 4. Merge with stored slots if current search yielded empty
        let boughtList = Array.from(domBought);
        if (chrome && chrome.storage && chrome.storage.local) {
          if (boughtList.length > 0) {
            chrome.storage.local.set({
              brawldex_bought_slots: boughtList,
              brawldex_bought_window: win
            });
          } else {
            // Preserve stored slots if same window
            try {
              const st = await chrome.storage.local.get(["brawldex_bought_slots", "brawldex_bought_window"]);
              if (st && Array.isArray(st.brawldex_bought_slots)) {
                const stWin = st.brawldex_bought_window;
                if (!stWin || !win || stWin === win || Math.abs(new Date(stWin).getTime() - new Date(win).getTime()) < 3600000) {
                  st.brawldex_bought_slots.forEach(s => domBought.add(Number(s)));
                  boughtList = Array.from(domBought);
                }
              }
            } catch(e) {}
          }
        }

        return { ok: true, bought: boughtList, token };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    if (request.action === "get_cached_pokemon") {
      const auth = extractAuthData() || {};
      return {
        ok: true,
        mons: auth.cached_mons || [],
        items: auth.brawldex_bag_items || [],
        held: auth.brawldex_held_map || []
      };
    }

    if (request.action === "save_held_item") {
      try {
        const authData = extractAuthData() || {};
        const token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const pokemonId = request.pokemon_id;
        const monCode = request.code;
        const itemKey = request.item;
        const mode = request.mode || "equip"; // "equip" or "unequip"
        const tiktokUser = authData.brawldex_tiktok || "";

        // 1. Read existing bdx_items_<user>
        let itemsData = { items: [], held: [] };
        try {
          const raw = localStorage.getItem("bdx_items_" + tiktokUser);
          if (raw) itemsData = JSON.parse(raw) || { items: [], held: [] };
        } catch (e) {}
        if (!Array.isArray(itemsData.items)) itemsData.items = [];
        if (!Array.isArray(itemsData.held)) itemsData.held = [];

        // 2. Read existing bdx_mons_<user>
        let monsData = [];
        try {
          const rawM = localStorage.getItem("bdx_mons_" + tiktokUser);
          if (rawM) monsData = JSON.parse(rawM) || [];
        } catch (e) {}

        const targetMon = monsData.find(m => (pokemonId && m.id === pokemonId) || (monCode && m.code === monCode));

        let newHeldList = [];
        if (targetMon) {
          const curHeld = Array.isArray(targetMon.items) ? [...targetMon.items] : (targetMon.item ? [targetMon.item] : []);
          if (mode === "equip") {
            if (!curHeld.includes(itemKey)) curHeld.push(itemKey);
          } else {
            const idx = curHeld.indexOf(itemKey);
            if (idx >= 0) curHeld.splice(idx, 1);
          }
          newHeldList = curHeld;
          targetMon.items = newHeldList;
          targetMon.item = newHeldList[0] || null;
        } else {
          newHeldList = mode === "equip" ? [itemKey] : [];
        }

        // Update held array in bdx_items_
        const existingHeldEntry = itemsData.held.find(h => h.code === monCode);
        if (existingHeldEntry) {
          existingHeldEntry.item = newHeldList[0] || null;
        } else if (newHeldList[0]) {
          itemsData.held.push({ code: monCode, item: newHeldList[0] });
        }

        // Save back to localStorage
        try {
          localStorage.setItem("bdx_items_" + tiktokUser, JSON.stringify(itemsData));
          if (monsData.length > 0) {
            localStorage.setItem("bdx_mons_" + tiktokUser, JSON.stringify(monsData));
          }
        } catch (e) {}

        // 3. Save to Supabase pokemon table if id exists
        if (pokemonId) {
          const patchUrl = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/pokemon?id=eq.${encodeURIComponent(pokemonId)}`;
          await fetch(patchUrl, {
            method: "PATCH",
            headers: {
              "apikey": apiKey,
              "Authorization": token ? `Bearer ${token}` : `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify({
              item: newHeldList[0] || null,
              items: newHeldList
            })
          });
        }

        // Re-extract to keep sync
        const updatedAuth = extractAuthData();

        return {
          ok: true,
          item: newHeldList[0] || null,
          items: newHeldList,
          bag_items: itemsData.items,
          cached_mons: updatedAuth.cached_mons
        };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    if (request.action === "reroll_move") {
      try {
        const authData = extractAuthData() || {};
        const token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const rpcUrl = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/rpc/tm_reroll`;

        const resp = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "apikey": apiKey,
            "Authorization": token ? `Bearer ${token}` : `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify({
            p_pokemon: request.pokemon_id,
            p_slot: request.slot
          })
        });

        const resJson = await resp.json();
        if (resp.ok) {
          return { ok: true, data: resJson };
        } else {
          return { ok: false, error: resJson.message || resJson.error || "Reroll chiêu thất bại" };
        }
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    if (request.action === "evolve_pokemon") {
      try {
        const authData = extractAuthData() || {};
        const token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const rpcUrl = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/rpc/evolve_pokemon`;

        const resp = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "apikey": apiKey,
            "Authorization": token ? `Bearer ${token}` : `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify({
            p_pokemon: request.pokemon_id,
            p_target: request.target_dex
          })
        });

        const resJson = await resp.json();
        if (resp.ok) {
          return { ok: true, data: resJson };
        } else {
          return { ok: false, error: resJson.message || resJson.error || "Tiến hóa thất bại" };
        }
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    if (request.action === "use_ability_patch") {
      try {
        const authData = extractAuthData() || {};
        const token = authData.brawldex_token;
        const apiKey = "sb_publishable_yWdgRcBzBs93ZgGjKMMQDQ_9xsFDiVI";
        const rpcUrl = `https://vtyruyozcxwkxrchzbth.supabase.co/rest/v1/rpc/use_ability_patch`;

        const resp = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "apikey": apiKey,
            "Authorization": token ? `Bearer ${token}` : `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "*/*"
          },
          body: JSON.stringify({
            p_pokemon: request.pokemon_id,
            p_ability: request.ability
          })
        });

        const resJson = await resp.json();
        if (resp.ok) {
          return { ok: true, data: resJson };
        } else {
          return { ok: false, error: resJson.message || resJson.error || "Đổi Ability thất bại" };
        }
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }

    return { ok: false, error: "Action không hỗ trợ" };
  }

  // 1. Chrome extension runtime listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleAction(request).then(sendResponse);
    return true;
  });

  // 2. Iframe postMessage listener
  window.addEventListener("message", async (event) => {
    if (!event.data || !event.data.brawldex_action) return;
    const { brawldex_action, payload, channelId } = event.data;

    if (brawldex_action === "close_window") {
      toggleFloatWindow(false);
      return;
    }

    if (brawldex_action === "toggle_window") {
      toggleFloatWindow();
      return;
    }

    const response = await handleAction(payload || { action: brawldex_action });
    if (channelId && event.source) {
      event.source.postMessage({ channelId, response }, "*");
    }
  });

  // ==========================================
  // 3. FLOATING CHAT BUBBLE WIDGET (UI)
  // ==========================================
  function injectBubbleUI() {
    if (document.getElementById("brawldex-float-root")) return;

    // 1. Inject Styles
    const styleEl = document.createElement("style");
    styleEl.id = "brawldex-float-styles";
    styleEl.textContent = `
      #brawldex-float-root {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        z-index: 2147483645;
      }

      /* Floating Bubble */
      #brawldex-chat-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: linear-gradient(135deg, #141124 0%, #262B40 100%);
        border: 2.5px solid #FFD56E;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 18px rgba(255, 213, 110, 0.45);
        cursor: grab;
        user-select: none;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        touch-action: none;
      }

      #brawldex-chat-bubble:active {
        cursor: grabbing;
      }

      #brawldex-chat-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 138, 61, 0.7);
      }

      .brawldex-bubble-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .brawldex-bubble-ball {
        width: 36px;
        height: 36px;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
        transition: transform 0.3s ease;
      }

      #brawldex-chat-bubble:hover .brawldex-bubble-ball {
        transform: rotate(25deg);
      }

      .brawldex-bubble-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        background: linear-gradient(135deg, #FF8A3D, #C8562A);
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 5px;
        border-radius: 10px;
        border: 1.5px solid #141124;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      }

      .brawldex-bubble-pulse {
        position: absolute;
        inset: -5px;
        border-radius: 50%;
        border: 2px solid rgba(255, 213, 110, 0.4);
        animation: brawldexPulse 2.4s infinite;
        pointer-events: none;
      }

      @keyframes brawldexPulse {
        0% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.22); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }

      /* Floating Window / Frame Container */
      #brawldex-float-window {
        position: fixed;
        bottom: 92px;
        right: 24px;
        width: 445px;
        height: 640px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 110px);
        background: #0E0C18;
        border: 1.5px solid rgba(255, 213, 110, 0.45);
        border-radius: 16px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.88), 0 0 35px rgba(91, 63, 160, 0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
        transform-origin: bottom right;
        transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;
      }

      #brawldex-float-window.brawldex-hidden {
        opacity: 0;
        transform: translateY(18px) scale(0.95);
        visibility: hidden;
        pointer-events: none;
      }

      .brawldex-win-header {
        height: 38px;
        background: linear-gradient(90deg, #141124 0%, #1c1833 100%);
        border-bottom: 1px solid rgba(255, 232, 190, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        user-select: none;
      }

      .brawldex-win-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #FFD56E;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .brawldex-win-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .brawldex-win-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #FBF3E4;
        border-radius: 6px;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }

      .brawldex-win-btn:hover {
        background: rgba(255, 213, 110, 0.25);
        color: #FFD56E;
      }

      .brawldex-win-btn.close:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #FF6B6B;
        border-color: rgba(239, 68, 68, 0.5);
      }

      .brawldex-bubble-dismiss {
        position: absolute;
        top: -6px;
        left: -6px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #C8562A;
        color: #FFFFFF;
        border: 1.5px solid #141124;
        font-size: 10px;
        font-weight: 800;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: transform 0.15s, background 0.15s;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
      }

      #brawldex-chat-bubble:hover .brawldex-bubble-dismiss {
        display: flex;
      }

      .brawldex-bubble-dismiss:hover {
        background: #EF4444;
        transform: scale(1.15);
      }

      #brawldex-frame {
        flex: 1;
        width: 100%;
        border: none;
        background: #0E0C18;
      }
    `;
    document.head.appendChild(styleEl);

    // 2. Inject DOM Elements
    const rootEl = document.createElement("div");
    rootEl.id = "brawldex-float-root";
    rootEl.innerHTML = `
      <!-- Draggable Chat Bubble -->
      <div id="brawldex-chat-bubble" title="Brawldex Companion S2 (Nhấn để bật/tắt)">
        <button id="brawldexBubbleDismiss" class="brawldex-bubble-dismiss" title="Tắt bong bóng nổi (Bật lại trong Cài đặt Extension)">✕</button>
        <div class="brawldex-bubble-inner">
          <svg class="brawldex-bubble-ball" viewBox="0 0 100 100">
            <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill="#FF8A3D" />
            <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill="#FBF3E4" />
            <rect x="5" y="46" width="90" height="8" fill="#141124" />
            <circle cx="50" cy="50" r="15" fill="#141124" />
            <circle cx="50" cy="50" r="10" fill="#FFD56E" stroke="#141124" stroke-width="2" />
            <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
          </svg>
          <span class="brawldex-bubble-pulse"></span>
          <span class="brawldex-bubble-badge">S2</span>
        </div>
      </div>

      <!-- Floating Window -->
      <div id="brawldex-float-window" class="brawldex-hidden">
        <div class="brawldex-win-header">
          <div class="brawldex-win-title">
            <span>⚔️ BRAWLDEX COMPANION S2</span>
          </div>
          <div class="brawldex-win-controls">
            <button id="brawldexBtnReload" class="brawldex-win-btn" title="Làm mới cửa sổ">↻</button>
            <button id="brawldexBtnClose" class="brawldex-win-btn close" title="Thu nhỏ / Đóng">✕</button>
          </div>
        </div>
        <iframe id="brawldex-frame" allow="clipboard-read; clipboard-write"></iframe>
      </div>
    `;
    document.body.appendChild(rootEl);

    // Check if user has hidden the bubble in settings
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("brawldex_bubble_hidden", (data) => {
        if (data && data.brawldex_bubble_hidden) {
          rootEl.style.display = "none";
        }
      });
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.brawldex_bubble_hidden) {
          rootEl.style.display = changes.brawldex_bubble_hidden.newValue ? "none" : "block";
        }
      });
    }

    setupBubbleInteractions();
  }

  // ==========================================
  // 4. BUBBLE DRAG & TOGGLE LOGIC
  // ==========================================
  let isWindowOpen = false;

  function toggleFloatWindow(forcedState) {
    const win = document.getElementById("brawldex-float-window");
    const frame = document.getElementById("brawldex-frame");
    const bubble = document.getElementById("brawldex-chat-bubble");
    if (!win || !frame) return;

    if (typeof forcedState === "boolean") {
      isWindowOpen = forcedState;
    } else {
      isWindowOpen = !isWindowOpen;
    }

    if (isWindowOpen) {
      // Lazy load iframe on first open
      if (!frame.src || frame.src === "about:blank") {
        frame.src = chrome.runtime.getURL("popup.html");
      }
      
      // Smart positioning: dock near bubble if possible
      if (bubble) {
        const bubbleRect = bubble.getBoundingClientRect();
        const winWidth = Math.min(445, window.innerWidth - 32);
        const winHeight = Math.min(640, window.innerHeight - 110);
        
        let targetRight = window.innerWidth - bubbleRect.right;
        let targetBottom = window.innerHeight - bubbleRect.top + 12;

        if (targetRight + winWidth > window.innerWidth - 16) {
          targetRight = 16;
        }
        if (targetBottom + winHeight > window.innerHeight - 16) {
          targetBottom = 16;
        }

        win.style.right = `${Math.max(16, targetRight)}px`;
        win.style.bottom = `${Math.max(16, targetBottom)}px`;
      }

      win.classList.remove("brawldex-hidden");
    } else {
      win.classList.add("brawldex-hidden");
    }
  }

  function setupBubbleInteractions() {
    const bubble = document.getElementById("brawldex-chat-bubble");
    const btnClose = document.getElementById("brawldexBtnClose");
    const btnReload = document.getElementById("brawldexBtnReload");
    const frame = document.getElementById("brawldex-frame");

    if (!bubble) return;

    const dismissBtn = document.getElementById("brawldexBubbleDismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ brawldex_bubble_hidden: true });
        }
        const root = document.getElementById("brawldex-float-root");
        if (root) root.style.display = "none";
      });
    }

    // Close & Reload controls
    if (btnClose) {
      btnClose.addEventListener("click", () => toggleFloatWindow(false));
    }
    if (btnReload && frame) {
      btnReload.addEventListener("click", () => {
        frame.src = chrome.runtime.getURL("popup.html");
      });
    }

    // ESC key closes window
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isWindowOpen) {
        toggleFloatWindow(false);
      }
    });

    // Restore saved position
    try {
      const savedPos = localStorage.getItem("brawldex_bubble_pos");
      if (savedPos) {
        const { left, top } = JSON.parse(savedPos);
        const maxL = window.innerWidth - 65;
        const maxT = window.innerHeight - 65;
        if (left >= 10 && left <= maxL && top >= 10 && top <= maxT) {
          bubble.style.left = `${left}px`;
          bubble.style.top = `${top}px`;
          bubble.style.right = "auto";
          bubble.style.bottom = "auto";
        }
      }
    } catch (e) {}

    // Drag & Drop handlers (Mouse & Touch)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let dragThresholdPassed = false;

    function onPointerDown(e) {
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;

      const rect = bubble.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      isDragging = true;
      dragThresholdPassed = false;

      document.addEventListener("mousemove", onPointerMove, { passive: false });
      document.addEventListener("mouseup", onPointerUp);
      document.addEventListener("touchmove", onPointerMove, { passive: false });
      document.addEventListener("touchend", onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;

      if (!dragThresholdPassed && Math.hypot(dx, dy) > 6) {
        dragThresholdPassed = true;
      }

      if (dragThresholdPassed) {
        if (e.cancelable) e.preventDefault();
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Boundaries clamp
        const pad = 12;
        const maxLeft = window.innerWidth - bubble.offsetWidth - pad;
        const maxTop = window.innerHeight - bubble.offsetHeight - pad;

        newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
        newTop = Math.max(pad, Math.min(newTop, maxTop));

        bubble.style.left = `${newLeft}px`;
        bubble.style.top = `${newTop}px`;
        bubble.style.right = "auto";
        bubble.style.bottom = "auto";
      }
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;

      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("touchend", onPointerUp);

      if (dragThresholdPassed) {
        // Save new position
        const rect = bubble.getBoundingClientRect();
        try {
          localStorage.setItem("brawldex_bubble_pos", JSON.stringify({
            left: Math.round(rect.left),
            top: Math.round(rect.top)
          }));
        } catch (e) {}
      } else {
        // Simple click -> Toggle window
        toggleFloatWindow();
      }
    }

    bubble.addEventListener("mousedown", onPointerDown);
    bubble.addEventListener("touchstart", onPointerDown, { passive: true });
  }

  // Inject UI once DOM is available
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBubbleUI);
  } else {
    injectBubbleUI();
  }
})();
