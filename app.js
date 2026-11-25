
/* =========================
   1. 冰箱區域設定
========================= */

const fridgeSections = [
  {
    name: "上層冷藏室",
    type: "冷藏",
    description: "存放日常冷藏食品"
  },
  {
    name: "左中小抽屜",
    type: "製冰",
    description: "存放冰塊及製冰用品"
  },
  {
    name: "右中小抽屜",
    type: "冷凍",
    description: "存放冷凍食品"
  },
  {
    name: "中層抽屜",
    type: "冷凍",
    description: "存放冷凍食品"
  },
  {
    name: "下層抽屜",
    type: "冷藏",
    description: "存放蔬菜及其他冷藏食品"
  }
];

/* =========================
   2. 取得網頁元素
========================= */

const zoneButtons = document.querySelectorAll(".fridge-zone");

const sectionTitle = document.getElementById("sectionTitle");

const itemsList = document.getElementById("itemsList");

const settingsBtn = document.getElementById("settingsBtn");

/* =========================
   3. 目前選取的區域
========================= */

let currentSection = null;

/* =========================
   4. 顯示冰箱區域
========================= */

function selectSection(sectionName) {

  const section = fridgeSections.find(
    item => item.name === sectionName
  );

  if (!section) return;

  currentSection = section;

  // 移除所有區域的選取狀態
  zoneButtons.forEach(button => {

    button.classList.remove("selected");

    if (button.dataset.section === sectionName) {
      button.classList.add("selected");
    }

  });

  // 顯示區域名稱
  sectionTitle.textContent =
    `${section.name}（${section.type}）`;

  // 顯示區域說明
  itemsList.replaceChildren();

  const description = document.createElement("p");

  description.textContent = section.description;

  itemsList.appendChild(description);

  // 尚未連接資料庫時的提示
  const emptyMessage = document.createElement("p");

  emptyMessage.textContent =
    "目前尚無登記物品，之後可以在這裡新增物品。";

  itemsList.appendChild(emptyMessage);

}

/* =========================
   5. 冰箱區域點擊事件
========================= */

zoneButtons.forEach(button => {

  button.addEventListener("click", () => {

    const sectionName = button.dataset.section;

    selectSection(sectionName);

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
   7. 初始化
========================= */

console.log("冰箱工具已載入");

console.log("目前共有", fridgeSections.length, "個冰箱區域");
