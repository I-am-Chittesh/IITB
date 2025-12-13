import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { RFID_URL, POLLING_INTERVAL } from './config/ApiConfig';
import { supabase } from './config/supabaseClient';

// --- 1. LOGIN SCREEN COMPONENT ---
const LoginScreen = () => (
  <SafeAreaView style={styles.loginContainer}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    
    {/* HEADER */}
    <View style={styles.navBar}>
      <Text style={styles.navTitle}>NALAM</Text>
    </View>

    {/* MAIN CONTENT */}
    <View style={styles.loginBody}>
      <View style={styles.scanCircle}>
        {/* Simulating a scanner icon visually */}
        <View style={styles.scanInnerCircle} />
      </View>
      
      <Text style={styles.scanTitle}>Scan your Aadhar</Text>
      <Text style={styles.scanSubtitle}>Place your card on the reader to authenticate</Text>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1565C0" />
        <Text style={styles.loadingText}>System Ready</Text>
      </View>
    </View>

    {/* FOOTER */}
    <View style={styles.loginFooter}>
      <Text style={styles.loginFooterText}>Secure Access Terminal • v1.0</Text>
    </View>
  </SafeAreaView>
);

// --- 2. BUFFER SCREEN COMPONENT ---
const BufferScreen = ({ userName }) => (
  <View style={styles.bufferContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
    <Text style={styles.welcomeText}>Welcome,</Text>
    <Text style={styles.nameText}>{userName}</Text>
    <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
    <Text style={styles.redirectText}>Loading Dashboard...</Text>
  </View>
);

// --- 3. DASHBOARD COMPONENT (Our Dark UI) ---
const DashboardScreen = ({ tagDisplay, status }) => (
  <SafeAreaView style={styles.dashContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#102027" />
    <View style={styles.dashHeader}>
      <Text style={styles.dashTitle}>PROJECT NALAM</Text>
      <Text style={styles.dashSubTitle}>ACTIVE SESSION</Text>
    </View>

    <View style={styles.dashCard}>
      <Text style={styles.dashLabel}>CURRENT USER</Text>
      <Text style={styles.dashValue}>{tagDisplay}</Text>
      <View style={styles.activeBadge}>
        <Text style={styles.activeText}>• ACCESS GRANTED</Text>
      </View>
    </View>
  </SafeAreaView>
);

// --- MAIN APP LOGIC ---
export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'buffer' | 'dashboard'
  const [userName, setUserName] = useState('');
  
  // LOGIC: Handle the "Transition"
  const handleLoginSuccess = (name) => {
    setUserName(name);
    setScreen('buffer');

    // Show "Welcome" for 3 seconds, then go to Dashboard
    setTimeout(() => {
      setScreen('dashboard');
    }, 3000);
  };

  // LOGIC: Listen for Supabase Updates
  useEffect(() => {
    const subscription = supabase
      .channel('public:app_main')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_main' }, (payload) => {
          const newUser = payload.new;
          console.log("New User Detected:", newUser.holder_name);
          
          // Trigger the flow
          handleLoginSuccess(newUser.holder_name);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // LOGIC: Hardware Polling (To trigger the DB update from ESP32)
  useEffect(() => {
    let lastScannedTag = '';
    
    const pollHardware = async () => {
      try {
        const response = await fetch(RFID_URL);
        const json = await response.json();
        
        if (json.uid && json.uid !== 'Waiting...' && json.uid !== lastScannedTag) {
            lastScannedTag = json.uid;
            // Trigger Supabase Logic
            await supabase.rpc('process_rfid_scan', { scan_id: json.uid });
        }
      } catch (e) {
        // Ignore connection errors for now
      }
    };

    const timer = setInterval(pollHardware, POLLING_INTERVAL);
    return () => clearInterval(timer);
  }, []);


  // --- RENDER SCREEN BASED ON STATE ---
  if (screen === 'login') return <LoginScreen />;
  if (screen === 'buffer') return <BufferScreen userName={userName} />;
  return <DashboardScreen tagDisplay={userName} status="Active" />;
}

// --- STYLES ---
const styles = StyleSheet.create({
  // LOGIN STYLES
  loginContainer: { flex: 1, backgroundColor: '#F5F9FF' },
  navBar: { height: 80, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E3F2FD', elevation: 2 },
  navTitle: { fontSize: 24, fontWeight: '900', color: '#1565C0', letterSpacing: 4 },
  loginBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  scanInnerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#BBDEFB', borderWidth: 4, borderColor: '#1565C0' },
  scanTitle: { fontSize: 26, fontWeight: 'bold', color: '#0D47A1', marginBottom: 10 },
  scanSubtitle: { fontSize: 14, color: '#546E7A', marginBottom: 40 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { marginLeft: 10, color: '#1565C0', fontWeight: '600' },
  loginFooter: { padding: 20, alignItems: 'center' },
  loginFooterText: { color: '#90A4AE', fontSize: 12 },

  // BUFFER STYLES
  bufferContainer: { flex: 1, backgroundColor: '#1565C0', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 32, color: '#BBDEFB', fontWeight: '300' },
  nameText: { fontSize: 48, color: '#FFFFFF', fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  redirectText: { color: '#90CAF9', marginTop: 10, fontSize: 12 },

  // DASHBOARD STYLES (Mini Version)
  dashContainer: { flex: 1, backgroundColor: '#102027', alignItems: 'center', justifyContent: 'center' },
  dashHeader: { marginBottom: 40, alignItems: 'center' },
  dashTitle: { fontSize: 28, color: '#fff', fontWeight: '900', letterSpacing: 2 },
  dashSubTitle: { color: '#4DB6AC', fontSize: 12, letterSpacing: 2, marginTop: 5 },
  dashCard: { backgroundColor: '#fff', width: '85%', padding: 30, borderRadius: 16, alignItems: 'center' },
  dashLabel: { color: '#90A4AE', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  dashValue: { fontSize: 32, fontWeight: 'bold', color: '#263238' },
  activeBadge: { marginTop: 20, backgroundColor: '#E0F2F1', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  activeText: { color: '#00695C', fontSize: 10, fontWeight: 'bold' }
});