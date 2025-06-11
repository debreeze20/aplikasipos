import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

type Laporan = {
  id_penjualan: number;
  faktur: string;
  total: number;
  bayar: number;
  kembali: number;
  total_laba: number;
  created_at: string;
};

export default function Laporan() {
  const [modalVisible, setModalVisible] = useState(false);
  const [laporanData, setLaporanData] = useState<Laporan[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentJenis, setCurrentJenis] = useState<string>('');

  const fetchDetail = async (jenis: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch('https://linkweb/api/laporanpenjualan');
      const data = await res.json();
      const filtered = data.filter((d: Laporan) => {
        if (jenis === 'Pengeluaran') return d.total < 0;
        if (jenis === 'Pemasukan') return d.total >= 0;
        return true;
      });
      setLaporanData(filtered);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const openModal = (jenis: string) => {
    setCurrentJenis(jenis);
    setModalVisible(true);
    fetchDetail(jenis);
  };

  const closeModal = () => {
    setModalVisible(false);
    setLaporanData([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laporan Keuangan</Text>

      {['Pemasukan', 'Pengeluaran', 'Laba Rugi'].map((jenis, i) => (
        <TouchableOpacity
          key={jenis}
          onPress={() => openModal(jenis)}
          style={[styles.buttonSpacing]}
        >
          <LinearGradient
            colors={
              jenis === 'Laba Rugi'
                ? ['#1f4037', '#99f2c8']
                : jenis === 'Pengeluaran'
                  ? ['#0f2027', '#203a43']
                  : ['#0f0c29', '#302b63']
            }
            style={styles.button}
          >
            <Text style={styles.buttonText}>{jenis}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        propagateSwipe
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detail {currentJenis}</Text>
          {loadingDetail ? (
            <ActivityIndicator size="large" color="#4FC3F7" />
          ) : (
            <ScrollView style={styles.modalScroll}>
              {laporanData.length === 0 ? (
                <Text style={styles.emptyText}>Data tidak tersedia.</Text>
              ) : (
                laporanData.map(item => (
                  <LinearGradient
                    key={item.id_penjualan}
                    colors={['#434343', '#000000']}
                    style={styles.detailCard}
                  >
                    <Text style={styles.cardText}>Faktur: {item.faktur}</Text>
                    <Text style={styles.cardText}>
                      Tanggal: {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </Text>
                    <Text style={styles.cardText}>Total: Rp{item.total.toLocaleString('id-ID')}</Text>
                    <Text style={styles.cardText}>Bayar: Rp{item.bayar.toLocaleString('id-ID')}</Text>
                    <Text style={styles.cardText}>Kembali: Rp{item.kembali.toLocaleString('id-ID')}</Text>
                    <Text style={styles.cardText}>Laba: Rp{item.total_laba.toLocaleString('id-ID')}</Text>
                  </LinearGradient>
                ))
              )}
            </ScrollView>
          )}
          <TouchableOpacity onPress={closeModal} style={styles.btnClose}>
            <Text style={styles.btnCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSpacing: {
    marginBottom: 20,
    width: '100%',
  },
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  detailCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  btnClose: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCloseText: {
    color: '#fff',
    fontWeight: '600',
  },
});
