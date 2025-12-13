import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { RFID_URL, POLLING_INTERVAL } from './config/ApiConfig';

export default function App() {
  const [tagDisplay, setTagDisplay] = useState('WAITING...');
  const [status, setStatus] = useState('CONNECTING...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchTag = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch(RFID_URL);
      const json = await response.json();
      
      // Update UI only if the tag is different or "Waiting..."
      if (json.uid) {
        setTagDisplay(json.uid);
      }
      
      setStatus('SYSTEM ACTIVE');
      setLastUpdated(new Date().toLocaleTimeString());
      setIsSyncing(false);

    } catch (error) {
      setStatus('CONNECTION LOST');
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTag();
    
    // Start Polling Timer
    const timer = setInterval(fetchTag, POLLING_INTERVAL);
    
    // Cleanup on unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROJECT NALAM</Text>
        <Text style={styles.subHeader}>SECURE ACCESS MONITOR</Text>
      </View>

      {/* MAIN DISPLAY CARD */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: status === 'SYSTEM ACTIVE' ? '#00E676' : '#FF1744' }]} />
            <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>IDENTIFIED TAG</Text>
        <Text style={styles.tagValue}>{tagDisplay}</Text>
      </View>

      {/* FOOTER INFO */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>SYNC: {isSyncing ? '•' : ''} {lastUpdated}</Text>
        <Text style={styles.footerText}>DEVICE: ESP32-S3 MASTERMIND</Text>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#102027', // Deep Dark Blue/Grey
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4DB6AC', // Light Teal
    marginTop: 8,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '85%',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    // Elevation for Android
    elevation: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#546E7A',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#CFD8DC',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#90A4AE',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  tagValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#263238',
    fontVariant: ['tabular-nums'], // Keeps numbers monospaced
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginBottom: 5,
    letterSpacing: 1,
  },
});