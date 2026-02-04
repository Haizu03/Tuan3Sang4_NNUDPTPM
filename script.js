let products = [];
let filtered = [];
let pagedData = [];
let page = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;
let selectedId = null;

async function loadProducts() {
  const res = await fetch("https://api.escuelajs.co/api/v1/products");
  products = await res.json();
  filtered = [...products];
  render();
}

function render() {
  pageSize = +document.getElementById("pageSize").value;
  const start = (page - 1) * pageSize;
  pagedData = filtered.slice(start, start + pageSize);

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  pagedData.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description;

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || ""}</td>
      <td><img src="${p.images?.[0]}"></td>
      <td>
        <button class="btn btn-sm btn-info" onclick="openView(${p.id})">Xem</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageInfo").innerText =
    `Trang ${page} / ${Math.ceil(filtered.length / pageSize)}`;
}

document.getElementById("search").oninput = e => {
  filtered = products.filter(p =>
    p.title.toLowerCase().includes(e.target.value.toLowerCase())
  );
  page = 1;
  render();
};

function sortBy(field) {
  sortAsc = field === sortField ? !sortAsc : true;
  sortField = field;

  filtered.sort((a, b) =>
    sortAsc ? a[field] > b[field] : a[field] < b[field]
  );
  render();
}

function prevPage() {
  if (page > 1) page--;
  render();
}

function nextPage() {
  if (page * pageSize < filtered.length) page++;
  render();
}

function exportCSV() {
  if (!pagedData.length) return alert("Không có dữ liệu");

  let csv = "ID,Title,Price,Category,Image\n";
  pagedData.forEach(p => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}","${p.images?.[0]}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}

function openView(id) {
  selectedId = id;
  const p = products.find(x => x.id === id);
  editTitle.value = p.title;
  editPrice.value = p.price;
  editDesc.value = p.description;
  new bootstrap.Modal(viewModal).show();
}

async function updateProduct() {
  await fetch(`https://api.escuelajs.co/api/v1/products/${selectedId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: editTitle.value,
      price: +editPrice.value,
      description: editDesc.value
    })
  });
  alert("API fake – reload sẽ mất");
}

async function createProduct() {
  const res = await fetch("https://api.escuelajs.co/api/v1/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle.value,
      price: +newPrice.value,
      description: newDesc.value,
      categoryId: 1,
      images: ["https://placeimg.com/640/480/any"]
    })
  });

  const p = await res.json();
  products.unshift(p);
  filtered.unshift(p);
  render();
  bootstrap.Modal.getInstance(createModal).hide();
}

function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm?")) return;
  products = products.filter(p => p.id !== id);
  filtered = filtered.filter(p => p.id !== id);
  render();
}

loadProducts();
