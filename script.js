const STORAGE_KEY = "dataPengeluaran"; // Mendefinisikan kunci untuk localStorage

const rupiah = new Intl.NumberFormat("id", {
  // Membuat formatter untuk format mata uang Rupiah
  minimumFractionDigits: 0, // Mengatur jumlah digit desimal minimum menjadi 0
});

function muatDataDariStorage() {
  const dataBerseri = localStorage.getItem(STORAGE_KEY); // Mengambil data pengeluaran dari localStorage
  let data = JSON.parse(dataBerseri); // Parsing data JSON

  if (!data || !Array.isArray(data)) {
    // Memeriksa apakah data ada dan apakah data adalah array
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  renderData(data); // Render data setelah dipastikan bahwa data adalah array

  const totalUang = parseFloat(localStorage.getItem("totalUang")); // Mengambil nilai total uang dari localStorage

  if (!isNaN(totalUang)) {
    // Memastikan totalUang tidak undefined atau NaN
    updateTotalUangUI(totalUang); // Memperbarui tampilan total uang
  }

  totalSemuaPengeluaran(); // Hitung dan tampilkan total pengeluaran semua hari
}

function renderData(data) {
  const dataPerhari = document.getElementById("dataPerhari"); // Mendapatkan elemen untuk menampilkan data per hari
  dataPerhari.innerHTML = ""; // Mengosongkan elemen

  data.forEach((item) => {
    // Iterasi setiap item dalam data
    const hari = item.hari; // Mendapatkan hari dari item
    const tanggal = item.tanggal; // Mendapatkan tanggal dari item
    const accordionItem = document.createElement("div"); // Membuat elemen div baru
    accordionItem.className = "accordion-item"; // Menambahkan kelas CSS
    accordionItem.id = `itemPerhari-${tanggal}`; // Menambahkan id untuk elemen

    // Menambahkan konten HTML ke dalam accordionItem
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
              class="btn btn-primary text-white fw-bold"
              type="button"
              onclick="tambahPengeluaran('${tanggal}')"
            >
              +
            </button>
          </div>

          <table class="table mt-3 table-light">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Keperluan</th>
                <th scope="col">Pengeluaran</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody id="informasiPengeluaran-${tanggal}">
              <!-- Rows akan ditambahkan secara dinamis di sini -->
            </tbody>
          </table>

          <button type="button" class="btn btn-danger modal-alert-hapus" data-bs-toggle="modal" data-bs-target="#alertHapusModal" data-idHari="${tanggal}">
            Hapus Hari
          </button>
        </div>
      </div>
    `;

    dataPerhari.appendChild(accordionItem); // Menambahkan accordionItem ke dalam dataPerhari
    renderPengeluaran(item.pengeluaran, tanggal); // Memanggil fungsi renderPengeluaran untuk item ini
  });
  // Event listener modal untuk tombol hapus hari
  document.querySelectorAll(".modal-alert-hapus").forEach((button) => {
    button.addEventListener("click", () => {
      const tanggal = button.getAttribute("data-idHari");
      document.getElementById("tanggalHapus").textContent = tanggal;
      document.querySelector(".modal-footer").innerHTML = `
            <button
              type="button"
              class="btn btn-warning text-white"
              data-bs-dismiss="modal"
            >
              Tidak
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              onclick="hapusHari('${tanggal}')"
              data-bs-dismiss="modal"
            >
              Hapus
            </button>
            `;
    });
  });

  totalSemuaPengeluaran(); // Hitung dan tampilkan total pengeluaran semua hari setelah render data
}

document
  .getElementById("buttonTotalUang") // Mendapatkan elemen tombol untuk menambah total uang
  .addEventListener("click", function () {
    // Menambahkan event listener untuk klik tombol
    const totalUang = parseFloat(
      document.getElementById("inputTotalUang").value
    ); // Mendapatkan nilai input dan mengubahnya menjadi float
    
    updateTotalUang(totalUang); // Memanggil fungsi updateTotalUang dengan nilai input
  });

document
  .getElementById("buttonDate") // Mendapatkan elemen tombol untuk menambah tanggal pengeluaran
  .addEventListener("click", function () {
    // Menambahkan event listener untuk klik tombol
    const tanggal = document.getElementById("inputTanggal").value; // Mendapatkan nilai input tanggal
    const hari = document.getElementById("inputHari").value; // Mendapatkan nilai input hari
    tambahHariPengeluaran(tanggal, hari); // Memanggil fungsi tambahHariPengeluaran dengan nilai input
  });

document
  .getElementById("buttonCari") // Mendapatkan elemen tombol untuk mencari pengeluaran
  .addEventListener("click", function () {
    // Menambahkan event listener untuk klik tombol
    const keyword = document.getElementById("inputCariItemPerhari").value; // Mendapatkan nilai input keyword
    cariHariPengeluaran(keyword); // Memanggil fungsi cariHariPengeluaran dengan keyword
  });

function updateTotalUang(total) {
  localStorage.setItem("totalUang", total); // Menyimpan nilai total uang ke localStorage
  updateTotalUangUI(total); // Memperbarui tampilan total uang
}

function updateTotalUangUI(total) {
  const totalUangElement = document.getElementById("totalUang"); // Mendapatkan elemen untuk menampilkan total uang
  totalUangElement.textContent = `Total uang saat ini: ${rupiah.format(
    total
  )}.000`; // Memperbarui teks elemen dengan nilai total uang
  if (total === NaN) {
    // Memeriksa apakah total adalah NaN
    total = 0; // Atur total ke 0 jika NaN
  }
}

function tambahHariPengeluaran(tanggal, hari) {
  const dataBerseri = localStorage.getItem(STORAGE_KEY); // Mengambil data pengeluaran dari localStorage
  let data = [];

  if (dataBerseri) {
    // Memeriksa apakah dataBerseri ada
    data = JSON.parse(dataBerseri); // Parsing data JSON
  }

  const newData = {
    // Membuat objek data baru untuk hari dan tanggal
    tanggal: tanggal,
    hari: hari,
    pengeluaran: [],
  };

  data.push(newData); // Menambahkan objek data baru ke dalam array data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // Menyimpan array data yang diperbarui ke localStorage
  renderData(data); // Memanggil renderData untuk menampilkan item baru
}

function renderPengeluaran(pengeluaran, tanggal) {
  const tabelPengeluaran = document.getElementById(
    `informasiPengeluaran-${tanggal}`
  ); // Mendapatkan elemen untuk menampilkan pengeluaran
  tabelPengeluaran.innerHTML = ""; // Mengosongkan elemen

  pengeluaran.forEach((item, idx) => {
    // Iterasi setiap item dalam pengeluaran
    const newRow = document.createElement("tr"); // Membuat elemen tr baru

    // Menambahkan konten HTML ke dalam newRow
    newRow.innerHTML = `
      <th scope="row">${idx + 1}</th>
      <td>${item.keperluan}</td>
      <td>Rp${item.pengeluaran}.000</td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="hapusPengeluaran('${tanggal}', ${idx})">
          Hapus
        </button>
      </td>
    `;
    tabelPengeluaran.appendChild(newRow); // Menambahkan newRow ke dalam tabelPengeluaran
  });

  if (pengeluaran.length > 0) {
    // Memeriksa apakah ada pengeluaran
    const totalPengeluaran = pengeluaran.reduce((total, item) => {
      // Menghitung total pengeluaran
      return total + parseFloat(item.pengeluaran.replace(/[^\d.-]/g, ""));
    }, 0);

    const additionalRow = document.createElement("tr"); // Membuat elemen tr baru

    // Menambahkan konten HTML ke dalam additionalRow
    additionalRow.innerHTML = `
      <td colspan="3" class="table-active text-center">Total pengeluaran hari ini</td>
      <td class="table-active">- Rp${rupiah.format(totalPengeluaran)}.000</td>
    `;
    tabelPengeluaran.appendChild(additionalRow); // Menambahkan additionalRow ke dalam tabelPengeluaran
  }
}

function hapusPengeluaran(tanggal, index) {
  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY)); // Mengambil dan parsing data pengeluaran dari localStorage
  const dataIndex = dataPengeluaran.findIndex(
    (item) => item.tanggal === tanggal
  ); // Mencari indeks item berdasarkan tanggal

  if (dataIndex !== -1) {
    // Memeriksa apakah item ditemukan
    const pengeluaranHapus = parseFloat(
      dataPengeluaran[dataIndex].pengeluaran[index].pengeluaran.replace(
        /[^\d.-]/g,
        ""
      )
    ); // Mendapatkan nilai pengeluaran yang akan dihapus

    let totalUang = parseFloat(localStorage.getItem("totalUang")); // Mengambil nilai total uang dari localStorage
    totalUang += pengeluaranHapus; // Menambahkan nilai pengeluaran yang dihapus ke total uang

    dataPengeluaran[dataIndex].pengeluaran.splice(index, 1); // Menghapus pengeluaran dari array

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPengeluaran)); // Memperbarui data di localStorage
    renderPengeluaran(dataPengeluaran[dataIndex].pengeluaran, tanggal); // Memperbarui tampilan pengeluaran

    localStorage.setItem("totalUang", totalUang); // Memperbarui total uang di localStorage
    updateTotalUangUI(totalUang); // Memperbarui tampilan total uang

    totalSemuaPengeluaran(); // Hitung dan tampilkan total pengeluaran semua hari
  }
}

function hapusHari(tanggal) {
  const itemPerhari = document.getElementById(`itemPerhari-${tanggal}`); // Mendapatkan elemen hari yang akan dihapus
  itemPerhari.remove(); // Menghapus elemen hari

  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY)); // Mengambil dan parsing data pengeluaran dari localStorage
  const newDataPengeluaran = dataPengeluaran.filter(
    (item) => item.tanggal !== tanggal
  ); // Membuat array baru tanpa item yang dihapus

  const hariDihapus = dataPengeluaran.find((item) => item.tanggal === tanggal); // Mencari item yang dihapus
  if (hariDihapus) {
    let totalUang = parseFloat(localStorage.getItem("totalUang")); // Mengambil nilai total uang dari localStorage
    hariDihapus.pengeluaran.forEach((pengeluaran) => {
      // Menambahkan semua pengeluaran hari yang dihapus ke total uang
      totalUang += parseFloat(pengeluaran.pengeluaran.replace(/[^\d.-]/g, ""));
    });

    localStorage.setItem("totalUang", totalUang); // Memperbarui total uang di localStorage
    updateTotalUangUI(totalUang); // Memperbarui tampilan total uang
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newDataPengeluaran)); // Memperbarui data di localStorage
  totalSemuaPengeluaran(); // Hitung dan tampilkan total pengeluaran semua hari
}

function tambahPengeluaran(tanggal) {
  const inputKeperluan = document.getElementById(
    `inputKeperluan-${tanggal}`
  ).value; // Mendapatkan nilai input keperluan
  const inputPengeluaran = document.getElementById(
    `inputPengeluaran-${tanggal}`
  ).value; // Mendapatkan nilai input pengeluaran

  let dataPengeluaran = JSON.parse(localStorage.getItem(STORAGE_KEY)); // Mengambil dan parsing data pengeluaran dari localStorage
  const index = dataPengeluaran.findIndex((item) => item.tanggal === tanggal); // Mencari indeks item berdasarkan tanggal

  let pengeluaran = parseFloat(
    inputPengeluaran.replace(/[^\d.-]/g, "")
  ); /**mengonversi string yang berisi 
  angka dalam format mata uang menjadi angka desimal yang dapat dijumlahkan. 
  Fungsi replace(/[^\d.-]/g, "") digunakan untuk menghapus semua karakter yang 
  bukan angka (\d), 
  tanda minus (-), 
  atau titik desimal (.). */

  let totalUang = parseFloat(localStorage.getItem("totalUang")); // Mengambil nilai total uang dari localStorage

  if (totalUang - pengeluaran < 0) {
    // Memastikan total uang tidak kurang dari 0
    alert("Total uang tidak mencukupi!"); // Menampilkan pesan jika total uang tidak mencukupi
    return;
  }

  dataPengeluaran[index].pengeluaran.push({
    // Menambahkan pengeluaran ke dalam data pengeluaran
    keperluan: inputKeperluan,
    pengeluaran: rupiah.format(inputPengeluaran),
  });

  totalUang -= pengeluaran; // Mengurangi total uang sesuai pengeluaran baru

  localStorage.setItem("totalUang", totalUang); // Memperbarui total uang di localStorage
  updateTotalUangUI(totalUang); // Memperbarui tampilan total uang

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPengeluaran)); // Menyimpan data pengeluaran yang telah diperbarui ke localStorage
  renderPengeluaran(dataPengeluaran[index].pengeluaran, tanggal); // Memperbarui tampilan pengeluaran

  totalSemuaPengeluaran(); // Hitung dan tampilkan total pengeluaran semua hari
}

function cariHariPengeluaran(keyword) {
  const dataBerseri = localStorage.getItem(STORAGE_KEY); // Mengambil data pengeluaran dari localStorage
  let data = JSON.parse(dataBerseri); // Parsing data JSON

  if (!data || !Array.isArray(data)) {
    // Memeriksa apakah data ada dan apakah data adalah array
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  const hasilPencarian = data.filter(
    // Filter data berdasarkan keyword
    (item) =>
      item.hari.toLowerCase().includes(keyword.toLowerCase()) ||
      item.tanggal.toLowerCase().includes(keyword.toLowerCase())
  );

  renderData(hasilPencarian); // Render hasil pencarian
}

function totalSemuaPengeluaran() {
  const dataBerseri = localStorage.getItem(STORAGE_KEY); // Mengambil data pengeluaran dari localStorage
  let data = JSON.parse(dataBerseri); // Parsing data JSON

  if (!data || !Array.isArray(data)) {
    // Memeriksa apakah data ada dan apakah data adalah array
    data = []; // Atur data ke array kosong jika tidak ada atau bukan array
  }

  let totalPengeluaran = 0;

  data.forEach((item) => {
    // Iterasi setiap item dalam data
    item.pengeluaran.forEach((pengeluaran) => {
      // Iterasi setiap pengeluaran dalam item
      totalPengeluaran += parseFloat(
        pengeluaran.pengeluaran.replace(
          /[^\d.-]/g,
          ""
        ) /**berarti menggantikan semua karakter yang 
        bukan angka, titik desimal, atau tanda minus dengan string kosong, sehingga hanya menyisakan 
        angka dan tanda desimal yang valid untuk konversi ke angka desimal. */
      );
    });
  });

  const totalSemuaPengeluaranElement = document.getElementById(
    "totalSemuaPengeluaran"
  ); // Mendapatkan elemen untuk menampilkan total semua pengeluaran
  totalSemuaPengeluaranElement.textContent = `Total Pengeluaran: Rp${rupiah.format(
    totalPengeluaran
  )}.000`; // Memperbarui teks elemen dengan total semua pengeluaran
}

const inputTanggal = document.querySelector("#inputTanggal");
const inputHari = document.querySelector("#inputHari");
const buttonDate = document.querySelector("#buttonDate");

function checkInputTanggal() {
  if ((inputTanggal.value !== "" || 0) && (inputHari.value !== "" || 0)) {
    buttonDate.disabled = false;
  } else {
    buttonDate.disabled = true;
  }
}

const inputTotalUang = document.querySelector("#inputTotalUang");
const buttonTotalUang = document.querySelector("#buttonTotalUang");

function checkInputTotalUang() {
  if ((inputTotalUang.value !== "" || 0)) {
    buttonTotalUang.disabled = false;
  } else {
    buttonTotalUang.disabled = true;
  }
}

inputTotalUang.addEventListener("input", checkInputTotalUang);

inputTanggal.addEventListener("input", checkInputTanggal);
inputHari.addEventListener("input", checkInputTanggal);

document.addEventListener("DOMContentLoaded", function () {
  // Memuat data saat dokumen selesai dimuat
  muatDataDariStorage(); // Memanggil fungsi untuk memuat data dari localStorage
});
