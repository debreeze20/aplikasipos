import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type PenjualanItem = {
  nama_barang: string;
  qty: number;
  harga_jual: number;
};

type Penjualan = {
  id_penjualan: number;
  created_at: string;
  total: number;
  type: 'Penjualan';
  barang: PenjualanItem[];
};

type Pembelian = {
  id: number;
  date: string;
  total: number;
  type: 'Pembelian';
  supplier: string;
};

type Transaction = Penjualan | Pembelian;

const dummyPurchases: Pembelian[] = [
  { id: 1, date: '2025-06-08', total: 40000, type: 'Pembelian', supplier: 'CV Makmur' },
  { id: 2, date: '2025-06-07', total: 25000, type: 'Pembelian', supplier: 'PT Sejahtera' },
];

const Transaksi = () => {
  const [activeTab, setActiveTab] = useState<'Penjualan' | 'Pembelian'>('Penjualan');
  const [penjualanData, setPenjualanData] = useState<Penjualan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Penjualan') {
      fetchPenjualan();
    }
  }, [activeTab]);

  const fetchPenjualan = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://linkweb/api/transaksi');
      const data = response.data as Penjualan[];

      const formatted = data.map((item) => ({
        ...item,
        type: 'Penjualan' as const,
      }));

      setPenjualanData(formatted);
    } catch (error) {
      console.error('Gagal mengambil data penjualan:', error);
    } finally {
      setLoading(false);
    }
  };

  const transactions: Transaction[] =
    activeTab === 'Penjualan' ? penjualanData : dummyPurchases;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Riwayat Transaksi</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['Penjualan', 'Pembelian'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as 'Penjualan' | 'Pembelian')}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView style={styles.scroll}>
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />
        ) : (
          transactions.map((item) => {
            const isPenjualan = item.type === 'Penjualan';
            const key = isPenjualan ? item.id_penjualan : item.id;
            const date = isPenjualan ? item.created_at.split('T')[0] : item.date;
            const title = isPenjualan
              ? `Barang: ${item.barang.map(b => b.nama_barang).join(', ')}`
              : `Supplier: ${item.supplier}`;

            return (
              <View key={key} style={styles.card}>
                <View style={styles.iconRow}>
                  <Ionicons name="cube-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.cardDate}>{date}</Text>
                    <Text style={styles.cardTitle}>{title}</Text>
                  </View>
                </View>
                <Text style={styles.cardTotal}>Rp {item.total.toLocaleString('id-ID')}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default Transaksi;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#2c2c2c',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#aaa',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardTotal: {
    fontSize: 14,
    color: '#0f0',
    marginTop: 8,
    fontWeight: 'bold',
  },
});
