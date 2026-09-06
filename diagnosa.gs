/**
 * Diagnostik baca-saja. Tidak mengubah apa pun.
 * Menjawab: mana yang otoritatif antara "Usia Anggota" (kolom array) dan
 * "Usia Anggota 1..6", serta isi sebenarnya kolom "Status Kehadiran".
 */
function diagnosaData() {
  var sh = sheetData_();
  var map = kolom_(sh);
  var kolUsia = kolomUsiaTerpisah_(sh);
  var data = sh.getDataRange().getValues();

  // cari kolom Status Kehadiran
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var colKehadiran = 0;
  for (var c = 0; c < head.length; c++) {
    if (normHead_(head[c]) === normHead_("Status Kehadiran")) { colKehadiran = c + 1; break; }
  }

  var n = 0, arrKosong = 0, kolKosong = 0, cocok = 0, beda = 0, dua = 0;
  var lebih6 = 0, maxAnggota = 0, contohBeda = [], kodeDobel = {}, dupes = [];
  var nilaiKehadiran = {};

  for (var r = 1; r < data.length; r++) {
    var kode = String(data[r][map.kodeKeluarga - 1]).trim();
    if (!kode) continue;
    n++;
    if (kodeDobel[kode]) dupes.push(kode); else kodeDobel[kode] = 1;

    var arr = safeAges_(data[r][map.usiaAnggota - 1]);
    var kol = [];
    for (var i = 0; i < kolUsia.length; i++) {
      if (!kolUsia[i]) continue;
      var v = data[r][kolUsia[i] - 1];
      if (v === "" || v === null || v === undefined) continue;
      var num = Number(String(v).replace(/[^0-9.\-]/g, ""));
      if (!isNaN(num)) kol.push(Math.floor(num));
    }

    if (!arr.length && !kol.length) { /* keluarga tanpa anggota */ }
    else if (!arr.length) arrKosong++;
    else if (!kol.length) kolKosong++;
    else {
      dua++;
      var a = arr.slice().sort(function (x, y) { return x - y; }).join(",");
      var b = kol.slice().sort(function (x, y) { return x - y; }).join(",");
      if (a === b) cocok++;
      else {
        beda++;
        if (contohBeda.length < 8) contohBeda.push(kode + "  array[" + a + "]  vs  kolom[" + b + "]");
      }
    }

    var besar = Math.max(arr.length, kol.length);
    if (besar > maxAnggota) maxAnggota = besar;
    if (arr.length > 6) lebih6++;

    if (colKehadiran) {
      var sk = String(data[r][colKehadiran - 1]).trim() || "(kosong)";
      nilaiKehadiran[sk] = (nilaiKehadiran[sk] || 0) + 1;
    }
  }

  var out = [];
  out.push("=== USIA ANGGOTA: kolom 7 vs kolom 12-17 ===");
  out.push("baris berkode         : " + n);
  out.push("terisi di KEDUA tempat: " + dua + "  (cocok " + cocok + ", BEDA " + beda + ")");
  out.push("hanya di kolom 12-17  : " + arrKosong);
  out.push("hanya di kolom 7      : " + kolKosong);
  out.push("anggota terbanyak     : " + maxAnggota + " orang");
  out.push("keluarga >6 anggota   : " + lebih6 + "  (tidak muat di kolom 12-17)");
  if (contohBeda.length) {
    out.push("");
    out.push("Contoh yang BEDA:");
    for (var j = 0; j < contohBeda.length; j++) out.push("  " + contohBeda[j]);
  }

  out.push("");
  out.push("=== STATUS KEHADIRAN (kolom " + (colKehadiran || "TIDAK ADA") + ") ===");
  if (colKehadiran) {
    for (var k in nilaiKehadiran) out.push("  '" + k + "'  ->  " + nilaiKehadiran[k] + " baris");
  }

  out.push("");
  out.push("=== KODE DUPLIKAT ===");
  out.push(dupes.length ? "  " + dupes.join(", ") : "  tidak ada");

  Logger.log(out.join("\n"));
  return out.join("\n");
}
