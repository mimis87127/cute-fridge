
/* =========================
   1. Supabase 連線設定
========================= */

// 將下面兩個範例值換成你自己的資料
const SUPABASE_URL = "https://dktjynncesewccybefel.supabase.co";
const SUPABASE_KEY = "sb_publishable_agT4GAPO_nFlNWe8YO-VPQ_EkMiswzY";

// 建立 Supabase 連線
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================
   2. 網頁元素
========================= */

const zoneButtons = document.querySelectorAll(".fridge-zone");
const sectionTitle = document.getElementById("sectionTitle");
const itemsList = document.getElementById("itemsList");
const settingsBtn = document.getElementById("settingsBtn");

let fridgeSections = [];
let currentSection = null;

/* =========================
   3. 從雲端讀取冰箱區域
========================= */

async function loadFridgeSections() {

  sectionTitle.textContent = "正在讀取冰箱資料...";
  itemsList.textContent = "請稍候";

  const { data, error } = await db
    .from("fridge_sections")
    .select("id, name, storage_type, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {

    console.error("讀取冰箱資料失敗：", error);

    sectionTitle.textContent = "資料讀取失敗";

    itemsList.textContent =
      "請檢查 Supabase 連線及資料庫權限。";

    return;
  }

  fridgeSections = data;

  console.log("成功讀取冰箱區域：", fridgeSections);

  if (fridgeSections.length !== 5) {
    sectionTitle.textContent = "冰箱區域數量不正確";
    itemsList.textContent =
      `目前讀取到 ${fridgeSections.length} 個區域，預期為 5 個。`;
    return;
  }

  sectionTitle.textContent = "冰箱資料讀取成功";

  itemsList.textContent =
    "已成功連接雲端，共讀取到五個冰箱區域。";

}

/* =========================
   4. 選取冰箱區域
========================= */

function selectSection(sectionName) {

  const section = fridgeSections.find(
    item => item.name === sectionName
  );

  if (!section) return;

  currentSection = section;

  zoneButtons.forEach(button => {

    button.classList.toggle(
      "selected",
      button.dataset.section === sectionName
    );

  });

  sectionTitle.textContent =
    `${section.name}（${section.storage_type}）`;

  itemsList.textContent =
    "此區目前尚未載入物品資料。";

  console.log("目前選取區域：", section);

}

/* =========================
   5. 區域點擊事件
========================= */

zoneButtons.forEach(button => {

  button.addEventListener("click", () => {

    selectSection(button.dataset.section);

  });

});

/* =========================
   6. 設定按鈕
========================= */

if (settingsBtn) {

  settingsBtn.addEventListener("click", () => {

    alert("設定功能將於後續版本加入。");

  });

}

/* =========================
   7. 啟動
========================= */

console.log("冰箱工具開始啟動");

loadFridgeSections();
