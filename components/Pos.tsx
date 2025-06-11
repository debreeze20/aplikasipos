import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type Barang = {
  id_barang: number;
  nama_barang: string;
  harga_jual: number;
  stok: number;
};

type CartItem = Barang & { qty: number };

export default function Pos() {
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bayar, setBayar] = useState<string>('0');

  const [metodeModalVisible, setMetodeModalVisible] = useState(false);
  const [selectedMetode, setSelectedMetode] = useState<string | null>(null);
  const [showTransferInfo, setShowTransferInfo] = useState(false);

  const fetchBarangs = async () => {
    try {
      const res = await fetch('https://linkweb/api/barang');
      const data = await res.json();
      setBarangs(data);
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat produk');
    }
  };

  useEffect(() => {
    fetchBarangs();
  }, []);

  const addToCart = (item: Barang) => {
    const exists = cart.find(i => i.id_barang === item.id_barang);
    if (exists) {
      setCart(cart.map(i =>
        i.id_barang === item.id_barang && i.qty < item.stok ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart
      .map(i => i.id_barang === id ? { ...i, qty: i.qty - 1 } : i)
      .filter(i => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.harga_jual * i.qty, 0);

  const processPayment = async () => {
    if (Number(bayar) < subtotal) {
      Alert.alert('Uang Tidak Cukup', 'Nominal bayar kurang dari total belanja.');
      return;
    }

    try {
      const response = await fetch('https://jokiku.codepena.cloud/api/createpos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_kontak: 0,
          items: cart.map(i => ({
            id_barang: i.id_barang,
            qty: i.qty,
            harga_jual: i.harga_jual,
          })),
          bayar: Number(bayar),
          metode_bayar: 'cash',
          catatan: '',
          id_login: 1,
          id_toko: 1,
        }),
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response Error:', errorText);
        Alert.alert('Gagal', 'Gagal menyimpan transaksi. Cek log untuk detail.');
        return;
      }

      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        Alert.alert('Sukses Membuat Transaksi', `Faktur: ${json.faktur}`);
        setCart([]);
        setBayar('0');
      } else {
        const text = await response.text();
        console.warn('Unexpected response:', text);
        Alert.alert('Error', 'Server membalas dengan format yang tidak dikenali.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Terjadi kesalahan koneksi atau server.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <Text style={styles.title}>POS - Transaksi</Text>

          <Text style={styles.sectionTitle}>Pilih Barang:</Text>
          <FlatList
            data={barangs}
            keyExtractor={i => i.id_barang.toString()}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => addToCart(item)} style={styles.productBtn}>
                <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.productCard}>
                  <Text style={styles.productName}>{item.nama_barang}</Text>
                  <Text style={styles.productPrice}>Rp {item.harga_jual.toLocaleString()}</Text>
                  <Text style={styles.productStock}>Stok: {item.stok}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.sectionTitle}>Keranjang:</Text>
          {!cart.length ? (
            <Text style={styles.emptyCart}>Keranjang kosong</Text>
          ) : (
            <ScrollView style={styles.cartList}>
              {cart.map(i => (
                <LinearGradient key={i.id_barang} colors={['#222', '#444']} style={styles.cartCard}>
                  <Text style={styles.productName}>{i.nama_barang}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => removeFromCart(i.id_barang)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>–</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{i.qty}</Text>
                    <TouchableOpacity onPress={() => addToCart(i)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <Text style={styles.productPrice}>Rp {(i.harga_jual * i.qty).toLocaleString()}</Text>
                  </View>
                </LinearGradient>
              ))}
            </ScrollView>
          )}

          <View style={styles.summary}>
            <Text style={styles.summaryText}>Subtotal: Rp {subtotal.toLocaleString()}</Text>
            <Text style={styles.summaryText}>Masukkan Jumlah Uang Cash</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Bayar"
              placeholderTextColor="#888"
              value={bayar}
              onChangeText={setBayar}
            />
            <TouchableOpacity onPress={() => setMetodeModalVisible(true)} style={styles.payBtn}>
              <Text style={styles.payBtnText}>Bayar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Pilihan Metode Pembayaran */}
          {metodeModalVisible && (
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Pilih Metode Pembayaran</Text>
                {['Cash', 'Transfer BRI', 'Transfer BCA', 'Transfer BNI'].map(metode => (
                  <TouchableOpacity
                    key={metode}
                    style={styles.modalBtn}
                    onPress={() => {
                      setSelectedMetode(metode);
                      setMetodeModalVisible(false);
                      if (metode === 'Cash') {
                        processPayment();
                      } else {
                        setShowTransferInfo(true);
                      }
                    }}
                  >
                    <Text style={styles.modalBtnText}>{metode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Modal Info Transfer */}
          {showTransferInfo && (
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Pembayaran Transfer</Text>
                <Text style={styles.modalInfo}>Bank: {selectedMetode?.replace('Transfer ', '')}</Text>
                <Text style={styles.modalInfo}>Total: Rp {subtotal.toLocaleString()}</Text>
                <Text style={styles.modalInfo}>Kode Pembayaran: TRX-{Date.now().toString().slice(-6)}</Text>
                <Text style={styles.modalInfo}>Barang:</Text>
                {cart.map(i => (
                  <Text key={i.id_barang} style={styles.modalItem}>• {i.nama_barang} x{i.qty}</Text>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    setShowTransferInfo(false);
                    Alert.alert('Silakan Transfer', `Gunakan kode di atas untuk referensi pembayaran.`);
                    setCart([]);
                    setBayar('0');
                  }}
                  style={styles.modalBtn}
                >
                  <Text style={styles.modalBtnText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16, paddingTop: 50 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { color: '#ddd', fontSize: 18, marginVertical: 8 },
  productBtn: { marginRight: 12 },
  productCard: { padding: 12, borderRadius: 12, width: 140 },
  productName: { color: '#fff', fontWeight: '600', marginBottom: 6 },
  productPrice: { color: '#fff' },
  productStock: { color: '#aaa', fontSize: 12 },
  cartList: { maxHeight: 200, marginVertical: 12 },
  cartCard: { padding: 12, borderRadius: 12, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyBtn: { backgroundColor: '#555', padding: 6, borderRadius: 4 },
  qtyBtnText: { color: '#fff', fontSize: 18 },
  qtyText: { color: '#fff', fontSize: 16, marginHorizontal: 12 },
  summary: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#444' },
  summaryText: { color: '#fff', fontSize: 16 },
  input: {
    marginTop: 8, backgroundColor: '#111', color: '#fff', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 8
  },
  payBtn: {
    marginTop: 12, backgroundColor: '#0f0', paddingVertical: 14, borderRadius: 8, alignItems: 'center'
  },
  payBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  emptyCart: { color: '#777', fontStyle: 'italic' },

  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
    backgroundColor: '#222', padding: 20, borderRadius: 12, width: '80%',
  },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold' },
  modalBtn: { backgroundColor: '#4c669f', padding: 12, borderRadius: 6, marginTop: 8 },
  modalBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  modalInfo: { color: '#fff', marginVertical: 4 },
  modalItem: { color: '#ccc', marginLeft: 8 }
});
