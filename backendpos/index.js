const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;
const bcrypt = require('bcryptjs');
const generateFaktur = () => `PJ/${Date.now()}`;
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbpos_warung',
});

db.connect((err) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err);
  } else {
    console.log('Berhasil koneksi ke database MySQL');
  }
});

const dbPromise = db.promise();

// --- ENDPOINT --- //

app.post('/api/logout', (req, res) => {

  res.json({ message: 'Logout berhasil' });
});
// Endpoint login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await dbPromise.query(
      'SELECT * FROM login WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    res.json({
      message: 'Login berhasil',
      user: {
        username: user.username,
      }
    });
  } catch (err) {
    console.error('Error saat login:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat login', error: err.message });
  }
});

app.post('/api/createpos', async (req, res) => {
  const connection = dbPromise;
  await connection.beginTransaction();

  try {
    const {
      id_kontak = 0,
      items,
      bayar,
      metode_bayar = 'cash',
      catatan = '',
      id_login = 1,
      id_toko = 1,
    } = req.body;

    const faktur = generateFaktur();
    let subtotal = 0;
    let hpp = 0;
    let totalLaba = 0;

    for (const item of items) {
      const [barangData] = await connection.query(
        'SELECT harga_beli, stok FROM barang WHERE id_barang = ?',
        [item.id_barang]
      );

      if (!barangData.length) throw new Error('Barang tidak ditemukan');

      const { harga_beli, stok } = barangData[0];
      if (stok < item.qty) throw new Error('Stok tidak cukup');

      const totalItem = item.qty * item.harga_jual;
      subtotal += totalItem;
      hpp += item.qty * harga_beli;
      totalLaba += totalItem - (item.qty * harga_beli);

      await connection.query(
        'UPDATE barang SET stok = stok - ? WHERE id_barang = ?',
        [item.qty, item.id_barang]
      );
    }

    const diskon = 0;
    const pajak = 0;
    const pembulatan = 0;
    const total = subtotal;
    const kembali = bayar - total;
    const periode = new Date().toISOString().slice(0, 7);

    const [result] = await connection.query(
      `INSERT INTO penjualan 
        (faktur, id_kontak, jumlah, PPN, hpp, subtotal, diskon, diskon_persen, pajak, pembulatan, total, bayar, kembali, total_laba, periode, id_login, id_toko, metode_bayar, catatan, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        faktur,
        id_kontak,
        items.reduce((sum, i) => sum + i.qty, 0),
        '0', // PPN
        hpp,
        subtotal,
        diskon,
        0,
        pajak,
        pembulatan,
        total,
        bayar,
        kembali,
        totalLaba,
        periode,
        id_login,
        id_toko,
        metode_bayar,
        catatan,
      ]
    );

    const id_penjualan = result.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO penjualan_item (id_penjualan, id_barang, qty, harga_jual) 
        VALUES (?, ?, ?, ?)`,
        [id_penjualan, item.id_barang, item.qty, item.harga_jual]
      );
    }

    await connection.commit();
    res.json({ message: 'Transaksi berhasil', faktur });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Gagal menyimpan transaksi', error: err.message });
  } finally {
    connection.release();
  }
});


// Ambil semua barang
app.get('/api/barang', (req, res) => {
  db.query('SELECT * FROM barang', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
    res.json(results);
  });
});

app.post('/api/barang', (req, res) => {
  const {
    nama_barang,
    kode_barang,
    merk,
    harga_beli,
    harga_jual,
    stok,
    satuan_barang,
    id_kategori,
    margin
  } = req.body;

  const sql = `
    INSERT INTO barang (
      nama_barang,
      kode_barang,
      merk,
      harga_beli,
      harga_jual,
      stok,
      satuan_barang,
      id_kategori,
      margin
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nama_barang,
      kode_barang,
      merk,
      harga_beli,
      harga_jual,
      stok,
      satuan_barang,
      id_kategori,
      margin
    ],
    (err, result) => {
      if (err) {
        console.error('Gagal menambah barang:', err);
        res.status(500).json({
          error: 'Gagal menambah barang',
          detail: err.sqlMessage
        });
      } else {
        res.status(201).json({ message: 'Barang berhasil ditambahkan' });
      }
    }
  );
});



// Edit barang
app.put('/api/barang/:id', (req, res) => {
  const { id } = req.params;
  const {
    kode_barang,
    nama_barang,
    id_kategori,
    satuan_barang,
    stok,
    stok_min,
    harga_beli,
    harga_jual,
    barcode,
    sku,
    merk,
    margin
  } = req.body;

  const sql = `
    UPDATE barang SET 
      kode_barang = ?, 
      nama_barang = ?, 
      id_kategori = ?, 
      satuan_barang = ?, 
      stok = ?, 
      stok_min = ?, 
      harga_beli = ?, 
      harga_jual = ?, 
      barcode = ?, 
      sku = ?, 
      merk = ?, 
      margin = ?
    WHERE id_barang = ?
  `;

  db.query(
    sql,
    [
      kode_barang,
      nama_barang,
      id_kategori,
      satuan_barang,
      stok,
      stok_min,
      harga_beli,
      harga_jual,
      barcode,
      sku,
      merk,
      margin,
      id
    ],
    (err, result) => {
      if (err) {
        console.error('Gagal mengedit barang:', err);
        return res.status(500).json({ error: 'Gagal mengedit barang', detail: err.message });
      }
      res.json({ message: 'Barang berhasil diperbarui' });
    }
  );
});


// Hapus barang
app.delete('/api/barang/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM barang WHERE id_barang = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Gagal menghapus barang', detail: err.message });
    res.json({ message: 'Barang berhasil dihapus' });
  });
});

// Ambil kategori
app.get('/api/kategori', (req, res) => {
  db.query('SELECT * FROM kategori', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
    res.json(results);
  });
});


app.get('/api/laporanpenjualan', (req, res) => {
  db.query('SELECT * FROM penjualan', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
    res.json(results);
  });
});


app.get('/api/settings', (req, res) => {
  db.query('SELECT * FROM settings', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
    res.json(results);
  });
});


// Ambil satuan
app.get('/api/satuan', (req, res) => {
  db.query('SELECT * FROM satuan', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
    res.json(results);
  });
});

// Ambil transaksi
app.get('/api/transaksi', async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT 
        p.id_penjualan,
        p.faktur,
        p.total,
        p.bayar,
        p.kembali,
        p.created_at,
        pi.qty,
        pi.harga_jual,
        b.nama_barang
      FROM penjualan p
      JOIN penjualan_item pi ON pi.id_penjualan = p.id_penjualan
      JOIN barang b ON b.id_barang = pi.id_barang
      ORDER BY p.id_penjualan DESC
    `);

    const transaksiMap = {};
    for (const row of rows) {
      const id = row.id_penjualan;
      if (!transaksiMap[id]) {
        transaksiMap[id] = {
          id_penjualan: row.id_penjualan,
          faktur: row.faktur,
          total: row.total,
          bayar: row.bayar,
          kembali: row.kembali,
          created_at: row.created_at,
          barang: [],
        };
      }

      transaksiMap[id].barang.push({
        nama_barang: row.nama_barang,
        qty: row.qty,
        harga_jual: row.harga_jual,
      });
    }

    res.json(Object.values(transaksiMap));
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data transaksi.', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
