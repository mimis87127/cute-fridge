
const SUPABASE_URL = "https://dktjynncesewccybefel.supabase.co";
const SUPABASE_KEY = "sb_publishable_agT4GAPO_nFlNWe8YO-VPQ_EkMiswzY";

const HOUSEHOLD_ID = "4a0e22e1-c1e4-4f24-9f67-658e4667f36c";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const sectionTitle = document.getElementById("sectionTitle");
const itemsList = document.getElementById("itemsList");
const zoneButtons = document.querySelectorAll(".fridge-zone");
const itemForm = document.getElementById("itemForm");

let fridgeSections = [];
let currentSection = null;
let editingItemId = null;

const submitButton = itemForm.querySelector(
  'button[type="submit"]'
);

// 建立取消編輯按鈕
const cancelButton = document.createElement("button");
cancelButton.type = "button";
cancelButton.textContent = "取消編輯";
cancelButton.hidden = true;
itemForm.appendChild(cancelButton);

cancelButton.addEventListener("click", resetForm);

function resetForm() {
  editingItemId = null;
  itemForm.reset();

  document.getElementById("itemQuantity").value = 1;
  document.getElementById("itemUnit").value = "個";

  submitButton.textContent = "儲存物品";
  cancelButton.hidden = true;
}

async function loadFridgeSections() {
  sectionTitle.textContent = "正在讀取冰箱資料...";
  itemsList.textContent = "請稍候";
  itemForm.hidden = true;

  const { data, error } = await db
    .from("fridge_sections")
    .select("id, name, storage_type, sort_order")
    .eq("household_id", HOUSEHOLD_ID)
    .order("sort_order", { ascending: true });

  if (error) {
    sectionTitle.textContent = "讀取失敗";
    itemsList.textContent = error.message;
    return;
  }

  fridgeSections = data || [];

  if (fridgeSections.length !== 5) {
    sectionTitle.textContent = "冰箱區域數量異常";
    itemsList.textContent =
      `目前讀取到 ${fridgeSections.length} 個區域，預期為 5 個。`;
    return;
  }

  sectionTitle.textContent = "我的冰箱";
  itemsList.textContent = "請選擇一個冰箱區域查看物品。";

  zoneButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectSection(button.dataset.section);
    });
  });
}

async function selectSection(sectionName) {
  const section = fridgeSections.find(
    item => item.name === sectionName
  );

  if (!section) {
    sectionTitle.textContent = "找不到冰箱區域";
    itemsList.textContent = "請確認區域名稱是否正確。";
    itemForm.hidden = true;
    return;
  }

  currentSection = section;
  resetForm();

  sectionTitle.textContent = section.name;
  itemForm.hidden = false;

  await loadItems();
}

async function loadItems() {
  if (!currentSection) return;

  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("household_id", HOUSEHOLD_ID)
    .eq("section_id", currentSection.id)
    .order("expires_at", {
      ascending: true,
      nullsFirst: false
    });

  if (error) {
    itemsList.textContent = "物品讀取失敗：" + error.message;
    return;
  }

  renderItems(data || []);
}

function renderItems(items) {
  itemsList.innerHTML = "";

  if (items.length === 0) {
    itemsList.textContent = "這個區域目前沒有登記物品。";
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const details = document.createElement("p");
    details.textContent =
      `數量：${item.quantity} ${item.unit}`;

    const purchased = document.createElement("p");
    purchased.textContent =
      `購買日期：${item.purchased_at || "未填寫"}`;

    const expires = document.createElement("p");
    expires.textContent =
      `到期日：${item.expires_at || "未填寫"}`;

    const opened = document.createElement("p");
    opened.textContent =
      `開封日期：${item.opened_at || "未填寫"}`;

    const notes = document.createElement("p");
    notes.textContent =
      `備註：${item.notes || "無"}`;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "編輯";
    editButton.addEventListener("click", () => {
      startEdit(item);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.addEventListener("click", () => {
      deleteItem(item);
    });

    card.append(
      name,
      details,
      purchased,
      expires,
      opened,
      notes,
      editButton,
      deleteButton
    );

    itemsList.appendChild(card);
  });
}

function startEdit(item) {
  editingItemId = item.id;

  document.getElementById("itemName").value = item.name;
  document.getElementById("itemQuantity").value = item.quantity;
  document.getElementById("itemUnit").value = item.unit;
  document.getElementById("itemPurchasedAt").value =
    item.purchased_at || "";
  document.getElementById("itemExpiresAt").value =
    item.expires_at || "";
  document.getElementById("itemOpenedAt").value =
    item.opened_at || "";
  document.getElementById("itemNotes").value =
    item.notes || "";

  submitButton.textContent = "更新物品";
  cancelButton.hidden = false;

  itemForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function deleteItem(item) {
  const confirmed = confirm(
    `確定要刪除「${item.name}」嗎？此操作無法復原。`
  );

  if (!confirmed) return;

  const { error } = await db
    .from("items")
    .delete()
    .eq("id", item.id)
    .eq("household_id", HOUSEHOLD_ID);

  if (error) {
    alert("刪除失敗：" + error.message);
    return;
  }

  if (editingItemId === item.id) {
    resetForm();
  }

  alert("物品已刪除。");
  await loadItems();
}

itemForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentSection) {
    alert("請先選擇冰箱區域。");
    return;
  }

  submitButton.disabled = true;
  cancelButton.disabled = true;

  const newItem = {
    household_id: HOUSEHOLD_ID,
    section_id: currentSection.id,
    name: document.getElementById("itemName").value.trim(),
    quantity: Number(
      document.getElementById("itemQuantity").value
    ),
    unit: document.getElementById("itemUnit").value.trim(),
    purchased_at:
      document.getElementById("itemPurchasedAt").value || null,
    expires_at:
      document.getElementById("itemExpiresAt").value || null,
    opened_at:
      document.getElementById("itemOpenedAt").value || null,
    notes:
      document.getElementById("itemNotes").value.trim() || null,
    updated_at: new Date().toISOString()
  };

  if (
    !newItem.name ||
    !newItem.unit ||
    !Number.isFinite(newItem.quantity) ||
    newItem.quantity <= 0
  ) {
    alert("請確認物品名稱、數量及單位。");
    submitButton.disabled = false;
    cancelButton.disabled = false;
    return;
  }

  let error;

  if (editingItemId) {
    const result = await db
      .from("items")
      .update(newItem)
      .eq("id", editingItemId)
      .eq("household_id", HOUSEHOLD_ID);

    error = result.error;
  } else {
    const result = await db
      .from("items")
      .insert(newItem);

    error = result.error;
  }

  if (error) {
    alert("儲存失敗：" + error.message);
  } else {
    alert(editingItemId ? "物品更新成功！" : "物品新增成功！");
    resetForm();
    await loadItems();
  }

  submitButton.disabled = false;
  cancelButton.disabled = false;
});

loadFridgeSections();
