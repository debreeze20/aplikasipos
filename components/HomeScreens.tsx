import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const features = [
  { icon: 'cart-outline', label: 'POS', colors: ['#56CCF2', '#2F80ED'] as const, screen: 'Pos' },
  { icon: 'cube-outline', label: 'Kelola Produk', colors: ['#ff6a00', '#ee0979'] as const, screen: 'KelolaProduk' },
  { icon: 'ticket-outline', label: 'Transaksi', colors: ['#00b09b', '#96c93d'] as const, screen: 'Transaksi' },
  { icon: 'receipt-outline', label: 'Laporan', colors: ['#f7971e', '#ffd200'] as const, screen: 'Laporan' },
  { icon: 'settings-outline', label: 'Settings', colors: ['#ff416c', '#ff4b2b'] as const, screen: 'Settings' },
  { icon: 'log-out-outline', label: 'Logout', colors: ['#8e2de2', '#4a00e0'] as const },
];

const HomeScreens = () => {
  const navigation = useNavigation<any>();

  const handleFeaturePress = async (screen?: string, label?: string) => {
    if (label === 'Logout') {
      try {
        await fetch('https://jokiku.codepena.cloud/api/logout', {
          method: 'POST',
          credentials: 'include',
        });

        await AsyncStorage.removeItem('username');

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      return;
    }

    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Aplikasi POS</Text>

      <LinearGradient colors={['#7F00FF', '#E100FF']} style={styles.profileCard}>
        <Text style={styles.profileText}>Selamat datang User di Aplikasi POS</Text>
      </LinearGradient>

      <View style={styles.grid}>
        {features.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => handleFeaturePress(item.screen, item.label)}
          >
            <LinearGradient colors={item.colors} style={styles.gradientCard}>
              <Ionicons name={item.icon as any} size={28} color="#fff" />
              <Text style={styles.cardText}>{item.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bannerCard}>
        <Text style={styles.bannerTitle}>Sistem POS Mobile</Text>
        <Image
          source={{ uri: 'https://www.logile.com/wp-content/uploads/2024/10/measuring-cashier-performance.jpg' }}
          style={styles.bannerImage}
        />
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomCard}>
          <Ionicons name="chatbox-outline" size={20} color="#fff" />
          <Text style={styles.bottomText}>Sinkron Data Manual</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const cardWidth = (Dimensions.get('window').width - 64) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50, paddingHorizontal: 16 },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#fff' },
  profileCard: { borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16, marginBottom: 24, alignItems: 'center' },
  profileText: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: cardWidth, aspectRatio: 1, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  gradientCard: { flex: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 10 },
  cardText: { marginTop: 8, fontSize: 14, color: '#fff', fontWeight: '500', textAlign: 'center' },
  bannerCard: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, marginTop: 20, marginBottom: 20 },
  bannerTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  bannerImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  bottomCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1f', padding: 12, borderRadius: 12, marginHorizontal: 6 },
  bottomText: { marginLeft: 8, fontSize: 14, color: '#fff' },
});

export default HomeScreens;
