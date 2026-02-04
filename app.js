const API_URL = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

// Load dữ liệu
async function fetchProducts() {
  const res = await fetch(API_URL);
  products = await res.json();
  filtered = [...products];
  render();
}

function render() {
  renderTable();
  renderPagination();
}

// Render bảng
function renderTable() {
  const start = (currentPage - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach(p => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-desc", p.description);
    tr.onclick = () => openDetail(p);

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>${p.price.toLocaleString()} VNĐ</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="60"></td>
      <td>
        <button class="btn btn-danger btn-sm"
          onclick="event.stopPropagation(); deleteProduct(${p.id})">
          Xóa
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Phân trang
function renderPagination() {
  const total = Math.ceil(filtered.length / pageSize);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="gotoPage(${i})">${i}</button>
      </li>
    `;
  }
}

function gotoPage(p) {
  currentPage = p;
  render();
}

// Tìm kiếm realtime
searchInput.oninput = e => {
  const key = e.target.value.toLowerCase();
  filtered = products.filter(p => p.title.toLowerCase().includes(key));
  currentPage = 1;
  render();
};

// Đổi số dòng
pageSize.onchange = e => {
  pageSize = +e.target.value;
  currentPage = 1;
  render();
};

// Sắp xếp
function sortBy(field) {
  sortAsc = sortField === field ? !sortAsc : true;
  sortField = field;

  filtered.sort((a, b) =>
    sortAsc ? a[field] > b[field] ? 1 : -1
            : a[field] < b[field] ? 1 : -1
  );
  render();
}

// Export CSV
function exportCSV() {
  const rows = filtered.map(p =>
    `${p.id},"${p.title}",${p.price},"${p.category?.name}"`
  );
  const csv = "Mã,Tên sản phẩm,Giá,Danh mục\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "san_pham.csv";
  a.click();
}

// Mở modal chi tiết
function openDetail(p) {
  editId.value = p.id;
  editTitle.value = p.title;
  editPrice.value = p.price;
  editDescription.value = p.description;
  editImage.value = p.images[0];
  new bootstrap.Modal(detailModal).show();
}

// Update
async function updateProduct() {
  await fetch(`${API_URL}/${editId.value}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: editTitle.value,
      price: +editPrice.value,
      description: editDescription.value,
      images: [editImage.value]
    })
  });
  alert("Cập nhật thành công (Fake API)");
}

// Tạo
async function createProduct() {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: createTitle.value,
      price: +createPrice.value,
      description: createDescription.value,
      categoryId: 1,
      images: [createImage.value]
    })
  });
  alert("Tạo sản phẩm thành công (Fake API)");
}

// Xóa
async function deleteProduct(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  alert("Xóa thành công (Fake API)");
}

fetchProducts();
