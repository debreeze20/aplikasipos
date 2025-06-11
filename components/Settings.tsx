import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

type Setting = {
  id: number;
  group_setting: string;
  variable_setting: string;
  value_setting: string;
  deskripsi_setting: string;
  updated_at: string;
};

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('https://linkweb/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Settings</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00BCD4" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {settings.map((item) => (
            <LinearGradient
              key={item.id}
              colors={['#1f1c2c', '#928DAB']}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{item.deskripsi_setting}</Text>
              <Text style={styles.cardText}>Group: {item.group_setting}</Text>
              <Text style={styles.cardText}>Variable: {item.variable_setting}</Text>
              <Text style={styles.cardText}>Value: {item.value_setting}</Text>
              <Text style={styles.cardText}>
                Updated: {new Date(item.updated_at).toLocaleDateString('id-ID')}
              </Text>
            </LinearGradient>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 2,
  },
});
