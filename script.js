const STORAGE_KEY = "dataPengeluaran";

const rupiah = new Intl.NumberFormat("id", {
  minimumFractionDigits: 0,
});

function muatDataDariStorage() {
  const dataBerseri = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataBerseri);

  if (!data || !Array.isArray(data)) {
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  // Render data setelah dipastikan bahwa data adalah array
  renderData(data);

  // Mengambil nilai total uang dari localStorage
  const totalUang = parseFloat(localStorage.getItem("totalUang"));

  // Memastikan totalUang tidak undefined atau NaN
  if (!isNaN(totalUang)) {
    // Memperbarui tampilan total uang
    updateTotalUangUI(totalUang);
  }

  // Hitung dan tampilkan total pengeluaran semua hari
  totalSemuaPengeluaran();
}

function renderData(data) {
  const dataPerhari = document.getElementById("dataPerhari");
  dataPerhari.innerHTML = "";

  data.forEach((item) => {
    const hari = item.hari;
    const tanggal = item.tanggal;
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.id = `itemPerhari-${tanggal}`;

    accordionItem.innerHTML = `
      <h2 class="accordion-header">
        <button
          class="accordion-button bg-primary text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapse-${tanggal}"
          aria-expanded="true"
          aria-controls="collapse-${tanggal}"
          id="tanggalPengeluaran-${tanggal}"
        >
          ${hari}, ${tanggal}
        </button>
      </h2>
      <div
        id="collapse-${tanggal}"
        class="accordion-collapse collapse"
        data-bs-parent="#dataPerhari"
      >
        <div class="accordion-body">
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Keperluan"
              aria-label="Keperluan"
              id="inputKeperluan-${tanggal}"
            />
            <input
              type="number"
              class="form-control"
              placeholder="Pengeluaran"
              aria-label="Pengeluaran"
              id="inputPengeluaran-${tanggal}"
            />
            <button
              class="btn btn-primary text-white"
              type="button"
              onclick="tambahPengeluaran('${tanggal}')"
            >
              Update
            </button>
          </div>

          <table class="table mt-3 table-light">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Keperluan</th>
                <th scope="col">Pengeluaran</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody id="informasiPengeluaran-${tanggal}">
              <!-- Rows akan ditambahkan secara dinamis di sini -->
            </tbody>
          </table>

          <button class="btn btn-danger" onclick="hapusHari('${tanggal}')">Hapus Hari</button>
        </div>
      </div>
    `;

    dataPerhari.appendChild(accordionItem);
    renderPengeluaran(item.pengeluaran, tanggal);
  });

  // Hitung dan tampilkan total pengeluaran semua hari setelah render data
  totalSemuaPengeluaran();
}

// Event listener untuk tombol Tambah Total Uang
document
  .getElementById("buttonTotalUang")
  .addEventListener("click", function () {
    const totalUang = parseFloat(
      document.getElementById("inputTotalUang").value
    );
    updateTotalUang(totalUang);
  });

// Event listener untuk tombol Tambah Tanggal Pengeluaran
document.getElementById("buttonDate").addEventListener("click", function () {
  const tanggal = document.getElementById("inputTanggal").value;
  const hari = document.getElementById("inputHari").value;
  tambahHariPengeluaran(tanggal, hari);
});

// Event listener untuk tombol Cari
document.getElementById("buttonCari").addEventListener("click", function () {
  const keyword = document.getElementById("inputCariItemPerhari").value;
  cariHariPengeluaran(keyword);
});

// Fungsi untuk update total uang
function updateTotalUang(total) {
  localStorage.setItem("totalUang", total);
  updateTotalUangUI(total);
}

// Fungsi untuk menampilkan total uang
function updateTotalUangUI(total) {
  const totalUangElement = document.getElementById("totalUang");
  totalUangElement.textContent = `Total uang saat ini: ${rupiah.format(
    total
  )}.000`;
  if (total === NaN) {
    total = 0;
  }
}

// Fungsi untuk menambah hari pengeluaran
function tambahHariPengeluaran(tanggal, hari) {
  const dataBerseri = localStorage.getItem(STORAGE_KEY);
  let data = [];

  if (dataBerseri) {
    data = JSON.parse(dataBerseri);
  }

  const newData = {
    tanggal: tanggal,
    hari: hari,
    pengeluaran: [],
  };

  data.push(newData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderData(data); // Memanggil renderData untuk menampilkan item baru
}

// Fungsi untuk merender pengeluaran ke dalam tabel informasiPengeluaran
function renderPengeluaran(pengeluaran, tanggal) {
  const tabelPengeluaran = document.getElementById(
    `informasiPengeluaran-${tanggal}`
  );
  tabelPengeluaran.innerHTML = "";

  pengeluaran.forEach((item, idx) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <th scope="row">${idx + 1}</th>
      <td>${item.keperluan}</td>
      <td>- Rp${item.pengeluaran}.000</td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="hapusPengeluaran('${tanggal}', ${idx})">
          Hapus
        </button>
      </td>
    `;
    tabelPengeluaran.appendChild(newRow);
  });

  // Menambahkan baris untuk total pengeluaran
  if (pengeluaran.length > 0) {
    const totalPengeluaran = pengeluaran.reduce((total, item) => {
      return total + parseFloat(item.pengeluaran.replace(/[^\d.-]/g, ""));
    }, 0);

    const additionalRow = document.createElement("tr");
    additionalRow.innerHTML = `
      <td colspan="3" class="table-active text-center">Total pengeluaran hari ini</td>
      <td>- Rp${rupiah.format(totalPengeluaran)}.000</td>
    `;
    tabelPengeluaran.appendChild(additionalRow);
  }
}

// Fungsi untuk menghapus pengeluaran
function hapusPengeluaran(tanggal, index) {
  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const dataIndex = dataPengeluaran.findIndex(
    (item) => item.tanggal === tanggal
  );

  if (dataIndex !== -1) {
    // Mengembalikan jumlah pengeluaran ke total uang
    const pengeluaranHapus = parseFloat(
      dataPengeluaran[dataIndex].pengeluaran[index].pengeluaran.replace(
        /[^\d.-]/g,
        ""
      )
    );

    let totalUang = parseFloat(localStorage.getItem("totalUang"));
    totalUang += pengeluaranHapus;

    // Menghapus pengeluaran dari array
    dataPengeluaran[dataIndex].pengeluaran.splice(index, 1);

    // Memperbarui data di localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPengeluaran));

    // Memperbarui tampilan pengeluaran
    renderPengeluaran(dataPengeluaran[dataIndex].pengeluaran, tanggal);

    // Memperbarui total uang di localStorage
    localStorage.setItem("totalUang", totalUang);

    // Memperbarui tampilan total uang
    updateTotalUangUI(totalUang);

    // Hitung dan tampilkan total pengeluaran semua hari
    totalSemuaPengeluaran();
  }
}

// Fungsi untuk menghapus hari pengeluaran
function hapusHari(tanggal) {
  const itemPerhari = document.getElementById(`itemPerhari-${tanggal}`);
  itemPerhari.remove();

  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const newDataPengeluaran = dataPengeluaran.filter(
    (item) => item.tanggal !== tanggal
  );

  // Mengembalikan semua pengeluaran hari yang dihapus ke total uang
  const hariDihapus = dataPengeluaran.find((item) => item.tanggal === tanggal);
  if (hariDihapus) {
    let totalUang = parseFloat(localStorage.getItem("totalUang"));
    hariDihapus.pengeluaran.forEach((pengeluaran) => {
      totalUang += parseFloat(pengeluaran.pengeluaran.replace(/[^\d.-]/g, ""));
    });

    localStorage.setItem("totalUang", totalUang);
    updateTotalUangUI(totalUang);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newDataPengeluaran));

  // Hitung dan tampilkan total pengeluaran semua hari
  totalSemuaPengeluaran();
}

// Fungsi untuk menambah pengeluaran
function tambahPengeluaran(tanggal) {
  const inputKeperluan = document.getElementById(
    `inputKeperluan-${tanggal}`
  ).value;
  const inputPengeluaran = document.getElementById(
    `inputPengeluaran-${tanggal}`
  ).value;

  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const index = dataPengeluaran.findIndex((item) => item.tanggal === tanggal);

  // Menghitung jumlah pengeluaran yang akan ditambahkan
  let pengeluaran = parseFloat(inputPengeluaran.replace(/[^\d.-]/g, ""));

  // Mengurangi total uang
  let totalUang = parseFloat(localStorage.getItem("totalUang"));

  // Memastikan total uang tidak kurang dari 0
  if (totalUang - pengeluaran < 0) {
    alert("Total uang tidak mencukupi!");
    return;
  }

  // Menambahkan pengeluaran ke dalam data pengeluaran
  dataPengeluaran[index].pengeluaran.push({
    keperluan: inputKeperluan,
    pengeluaran: rupiah.format(inputPengeluaran),
  });

  // Mengurangi total uang sesuai pengeluaran baru
  totalUang -= pengeluaran;

  // Memperbarui total uang di localStorage
  localStorage.setItem("totalUang", totalUang);

  // Memperbarui tampilan total uang
  updateTotalUangUI(totalUang);

  // Menyimpan data pengeluaran yang telah diperbarui ke localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPengeluaran));

  // Memperbarui tampilan pengeluaran
  renderPengeluaran(dataPengeluaran[index].pengeluaran, tanggal);

  // Hitung dan tampilkan total pengeluaran semua hari
  totalSemuaPengeluaran();
}

// Fungsi untuk mencari hari pengeluaran
function cariHariPengeluaran(keyword) {
  const dataBerseri = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataBerseri);

  if (!data || !Array.isArray(data)) {
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  // Filter data berdasarkan keyword
  const hasilPencarian = data.filter(
    (item) =>
      item.hari.toLowerCase().includes(keyword.toLowerCase()) ||
      item.tanggal.toLowerCase().includes(keyword.toLowerCase())
  );

  // Render hasil pencarian
  renderData(hasilPencarian);
}

// Fungsi untuk menghitung total semua pengeluaran
function totalSemuaPengeluaran() {
  const dataBerseri = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataBerseri);

  if (!data || !Array.isArray(data)) {
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  let totalPengeluaran = 0;

  data.forEach((item) => {
    item.pengeluaran.forEach((pengeluaran) => {
      totalPengeluaran += parseFloat(
        pengeluaran.pengeluaran.replace(/[^\d.-]/g, "")
      );
    });
  });

  const totalSemuaPengeluaranElement = document.getElementById(
    "totalSemuaPengeluaran"
  );
  totalSemuaPengeluaranElement.textContent = `Total Pengeluaran: Rp${rupiah.format(
    totalPengeluaran
  )}.000`;
}

// Memuat data saat dokumen selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  muatDataDariStorage();
});
