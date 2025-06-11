import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface Product {
  id_barang: number;
  uuid_barang: string;
  kode_barang: string;
  barcode: string;
  id_kategori: number;
  id_kontak: number;
  sku: string | null;
  nama_barang: string;
  merk: string;
  harga_beli: number;
  diskon: number;
  diskon_persen: number;
  harga_jual: number;
  harga_jual_grosir: number;
  jumlah_min_grosir: number;
  harga_member: number;
  harga_sales: number;
  margin: number;
  range_harga: string | null;
  satuan_barang: string;
  satuan_nilai: number;
  deskripsi: string;
  stok: number;
  stok_min: number;
  stok_gudang: number;
  expired: string | null;
  active: number;
  id_toko: number;
  created_at: string;
  updated_at: string;
}

interface Kategori {
  id_kategori: number;
  nama_kategori: string;
  created_at: string | null;
  updated_at: string;
}

interface Satuan {
  id_satuan: number;
  nama_satuan: string;
  nilai_satuan: number;
  created_at: string | null;
  updated_at: string;
}

export default function KelolaProduk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Partial<Product>>({
    nama_barang: '',
    kode_barang: '',
    harga_jual: 0,
    stok: 0,
    active: 1
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);

  const [satuans, setSatuans] = useState<Satuan[]>([]);
  const [showSatuanModal, setShowSatuanModal] = useState(false);
  const [selectedSatuan, setSelectedSatuan] = useState<Satuan | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://linkweb/api/barang', {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && typeof data === 'object') {
        setProducts([data]);
      } else {
        setProducts([]);
      }
    } catch (err) {
      // setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoris = async () => {
    try {
      const response = await fetch('https://linkweb/api/kategori');
      const data = await response.json();
      setKategoris(data);
    } catch (err) {
      console.error('Error fetching kategoris:', err);
    }
  };

  const fetchSatuans = async () => {
    try {
      const response = await fetch('https://linkweb/api/satuan');
      const data = await response.json();
      setSatuans(data);
    } catch (err) {
      console.error('Error fetching satuans:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchKategoris();
    fetchSatuans();
  }, []);

  const handleChange = (field: keyof Product, value: any) => {
    setProduct(prev => {
      let updatedProduct = {
        ...prev,
        [field]: value
      };

      if (field === 'margin') {
        const hargaBeli = prev.harga_beli || 0;
        const margin = Number(value) || 0;
        const hargaJual = Math.round(hargaBeli + (hargaBeli * margin / 100));
        updatedProduct.harga_jual = hargaJual;
      }

      return updatedProduct;
    });
  };


  const handleAdd = async () => {
    if (!product.nama_barang || !product.harga_jual) {
      return Alert.alert('Error', 'Nama dan harga wajib diisi');
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `https://linkweb/api/barang/${editingId}`
        : 'https://linkweb/api/barang';

      const productData = {
        ...product,
        kode_barang: product.kode_barang || `BRG-${Math.floor(1000 + Math.random() * 9000)}`,
        stok: product.stok || 0,
        active: product.active || 1,
        harga_beli: product.harga_beli || 0,
        diskon: product.diskon || 0,
        diskon_persen: product.diskon_persen || 0,
        id_kategori: selectedKategori?.id_kategori || null,
        satuan_barang: selectedSatuan?.nama_satuan || '',
        satuan_nilai: selectedSatuan?.nilai_satuan || 1
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(editingId ? 'Gagal mengupdate produk' : 'Gagal menambahkan produk');
      }

      await fetchProducts();
      resetForm();
      setShowForm(false);

      Toast.show({
        type: 'success',
        text1: editingId ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan',
        position: 'bottom',
        visibilityTime: 2000
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: editingId ? 'Gagal mengupdate produk' : 'Gagal menambahkan produk',
        // text2: err.message,
        position: 'bottom'
      });
    }
  };


  const handleEdit = (product: Product) => {
    setProduct(product);
    setEditingId(product.id_barang);

    if (product.id_kategori) {
      const kategori = kategoris.find(k => k.id_kategori === product.id_kategori);
      setSelectedKategori(kategori || null);
    }

    if (product.satuan_barang) {
      const satuan = satuans.find(s => s.nama_satuan === product.satuan_barang);
      setSelectedSatuan(satuan || null);
    }

    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus produk ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              const response = await fetch(`https://linkweb/api/barang/${id}`, {
                method: 'DELETE'
              });

              if (!response.ok) {
                throw new Error('Gagal menghapus produk');
              }

              await fetchProducts();

              Toast.show({
                type: 'success',
                text1: 'Produk berhasil dihapus',
                position: 'bottom',
                visibilityTime: 2000
              });
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Gagal menghapus produk',
                // text2: err.message,
                position: 'bottom'
              });
            }
          }
        }
      ]
    );
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      resetForm();
    }
  };

  const resetForm = () => {
    setProduct({
      nama_barang: '',
      kode_barang: '',
      harga_jual: 0,
      stok: 0,
      active: 1
    });
    setEditingId(null);
    setSelectedKategori(null);
    setSelectedSatuan(null);
  };

  if (loading && products.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Memuat data produk...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProducts}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Produk</Text>
        <TouchableOpacity onPress={toggleForm} style={styles.addButton}>
          <Text style={styles.addText}>Tambah +</Text>
        </TouchableOpacity>
        <Toast />
      </View>

      {/* Form Input */}
      {showForm && (
        <View style={styles.formContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Barcode/SKU */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Barcode / SKU</Text>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Barcode</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Scan atau masukkan barcode"
                    placeholderTextColor="#888"
                    value={product.barcode}
                    onChangeText={(text) => handleChange('barcode', text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>SKU</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan SKU"
                    placeholderTextColor="#888"
                    value={product.sku || ''}
                    onChangeText={(text) => handleChange('sku', text)}
                  />
                </View>
              </View>
            </View>

            {/* Product Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nama Barang *</Text>
              <TextInput
                style={[styles.input, styles.fullWidthInput]}
                placeholder="Masukkan nama barang"
                placeholderTextColor="#888"
                value={product.nama_barang}
                onChangeText={(text) => handleChange('nama_barang', text)}
              />
            </View>


            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Merek Barang *</Text>
              <TextInput
                style={[styles.input, styles.fullWidthInput]}
                placeholder="Masukkan Merk barang"
                placeholderTextColor="#888"
                value={product.merk}
                onChangeText={(text) => handleChange('merk', text)}
              />
            </View>

            {/* Category and Unit */}
            <View style={styles.section}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Kategori</Text>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => setShowKategoriModal(true)}
                  >
                    <Text style={selectedKategori ? styles.dropdownText : styles.dropdownPlaceholder}>
                      {selectedKategori ? selectedKategori.nama_kategori : 'Pilih kategori'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Satuan</Text>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    onPress={() => setShowSatuanModal(true)}
                  >
                    <Text style={selectedSatuan ? styles.dropdownText : styles.dropdownPlaceholder}>
                      {selectedSatuan ? selectedSatuan.nama_satuan : 'Pilih satuan'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Min. Satuan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Minimal"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={product.satuan_nilai?.toString()}
                    onChangeText={(text) => handleChange('satuan_nilai', Number(text))}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deskripsi Barang</Text>
              <TextInput
                style={[styles.input, styles.fullWidthInput, styles.textArea]}
                placeholder="Masukkan deskripsi barang"
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                value={product.deskripsi}
                onChangeText={(text) => handleChange('deskripsi', text)}
              />
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Harga</Text>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Harga Beli *</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>Rp</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      placeholder="0"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={product.harga_beli?.toString()}
                      onChangeText={(text) => handleChange('harga_beli', Number(text))}
                    />
                  </View>

                  {/* Input Margin Persen */}
                  <View style={[styles.inputContainer, styles.flex1]}>
                    <Text style={styles.inputLabel}>Margin (%)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={product.margin?.toString()}
                      onChangeText={(text) => handleChange('margin', Number(text))}
                    />
                  </View>
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Harga Jual *</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>Rp</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      placeholder="0"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={product.harga_jual?.toString()}
                      onChangeText={(text) => handleChange('harga_jual', Number(text))}
                    />
                  </View>
                </View>






              </View>



              {/* Discount */}
              <View style={[styles.row, styles.discountRow]}>
                <View style={styles.discountSwitchContainer}>
                  <Text style={styles.inputLabel}>Diskon</Text>
                  <TextInput
                    style={[styles.input, styles.discountInput]}
                    placeholder="0"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={product.diskon_persen?.toString()}
                    onChangeText={(text) => handleChange('diskon_persen', Number(text))}
                  />
                </View>
                <View style={[styles.inputContainer, styles.discountInputContainer]}>
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>
            </View>

            {/* Stock */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stok</Text>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Stok Minimal</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={product.stok_min?.toString()}
                    onChangeText={(text) => handleChange('stok_min', Number(text))}
                  />
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Stok Awal</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={product.stok?.toString()}
                    onChangeText={(text) => handleChange('stok', Number(text))}
                  />
                </View>
              </View>
            </View>

            {/* Vendor and Expired */}
            <View style={styles.section}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Vendor/Supplier</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pilih kontak"
                    placeholderTextColor="#888"
                    value={product.id_kontak?.toString()}
                    onChangeText={(text) => handleChange('id_kontak', Number(text))}
                  />
                </View>
                <View style={[styles.inputContainer, styles.flex1]}>
                  <Text style={styles.inputLabel}>Kadaluarsa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yyyy-mm-dd"
                    placeholderTextColor="#888"
                    value={product.expired || ''}
                    onChangeText={(text) => handleChange('expired', text)}
                  />
                </View>
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Barang</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Aktif</Text>
                <Switch
                  value={product.active === 1}
                  onValueChange={(value) => handleChange('active', value ? 1 : 0)}
                  trackColor={{ false: '#767577', true: '#4FC3F7' }}
                  thumbColor={product.active === 1 ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>
                {editingId ? 'Update Produk' : 'Simpan Produk'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Kategori Modal */}
      <Modal
        visible={showKategoriModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowKategoriModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            <FlatList
              data={kategoris}
              keyExtractor={(item) => item.id_kategori.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedKategori(item);
                    setShowKategoriModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nama_kategori}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowKategoriModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Satuan Modal */}
      <Modal
        visible={showSatuanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSatuanModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Satuan</Text>
            <FlatList
              data={satuans}
              keyExtractor={(item) => item.id_satuan.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSatuan(item);
                    setShowSatuanModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nama_satuan}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSatuanModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={item => item.id_barang.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchProducts}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada produk</Text>
              <Text style={styles.emptySubText}>Tambahkan produk pertama Anda</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nama_barang}</Text>
              <Text style={styles.productCode}>Kode: {item.kode_barang}</Text>
              <Text style={styles.productPrice}>Harga: Rp{item.harga_jual.toLocaleString('id-ID')}</Text>
              <Text style={styles.productStock}>Stok: {item.stok}</Text>
              {item.merk && item.merk !== 'Tidak ada merk' && (
                <Text style={styles.productMerk}>Merk: {item.merk}</Text>
              )}
              {item.diskon_persen > 0 && (
                <Text style={styles.productDiscount}>Diskon: {item.diskon_persen}%</Text>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id_barang)}
              >
                <Text style={styles.deleteButtonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 20,
  },
  addButton: {
    padding: 5,
  },
  addText: {
    fontSize: 16,
    color: '#4FC3F7',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '80%',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  section: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  fullWidthInput: {
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  currencySymbol: {
    padding: 12,
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#333',
    borderRightWidth: 1,
    borderColor: '#444',
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
  },
  discountRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  discountSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  discountInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  percentSymbol: {
    padding: 12,
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#333',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#444',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4FC3F7',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: '#4FC3F7',
    marginBottom: 2,
    fontWeight: '500',
  },
  productStock: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 2,
  },
  productMerk: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 2,
  },
  productDiscount: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 8,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#4FC3F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    minWidth: 70,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#4FC3F7',
    fontWeight: '500',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4FC3F7',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#4FC3F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a2a',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
});