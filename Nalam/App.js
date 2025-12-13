import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

// Import your configurations
import { RFID_URL, AUTONOMOUS_URL, POLLING_INTERVAL } from './config/ApiConfig';
import { supabase } from './config/supabaseClient';

// --- UI COMPONENT ---
const DisplayCard = ({ tagDisplay, status, autonomousMode, lastUpdated }) => (
    <>
        <View style={[styles.aiStatusContainer, { 
            backgroundColor: autonomousMode ? '#FFD700' : '#4d4d4d' 
        }]}>
            <Text style={styles.aiStatusText}>
                AI MODE: {autonomousMode ? 'ACTIVE' : 'STANDBY'}
            </Text>
        </View>

        <View style={styles.card}>
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: status === 'Connected' ? '#32CD32' : '#FF4500' }]} />
                <Text style={styles.statusText}>{status}</Text>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.label}>USER IDENTIFIED</Text>
            
            <View style={styles.tagContainer}>
                {/* Shows the Name from DB or Status Message */}
                <Text style={styles.tagValue}>{tagDisplay}</Text>
            </View>
        </View>
    </>
);

// --- MAIN LOGIC ---
export default function App() {
  const [tagDisplay, setTagDisplay] = useState('Waiting for Scan...'); 
  const [status, setStatus] = useState('Disconnected'); 
  const [autonomousMode, setAutonomousMode] = useState(false); 
  const [lastUpdated, setLastUpdated] = useState('');

  // Tracker to prevent spamming the database with the same tag
  const [lastScannedTag, setLastScannedTag] = useState(''); 

  // 1. FUNCTION: Trigger the Supabase "Brain"
  const triggerDatabaseProcess = async (scannedTag) => {
      console.log("Triggering DB Logic for:", scannedTag);
      
      // Call the SQL function we wrote
      const { data, error } = await supabase
        .rpc('process_rfid_scan', { scan_id: scannedTag });

      if (error) {
          console.error("DB Error:", error.message);
          setTagDisplay("DB ERROR");
      } else if (!data.success) {
          // If the SQL function returned success: false
          setTagDisplay(data.message); // e.g. "Invalid Entry"
      }
      // If success is true, we do nothing here. 
      // We wait for the Realtime Subscription (below) to update the UI.
  };

  // 2. EFFECT: Poll Hardware (ESP32)
  useEffect(() => {
    const fetchData = async () => {
        try {
            setStatus('Syncing...');

            // A. Get AI Switch Status
            const switchRes = await fetch(AUTONOMOUS_URL);
            const switchJson = await switchRes.json();
            setAutonomousMode(switchJson.mode);

            // B. Get Raw RFID Tag
            const rfidRes = await fetch(RFID_URL);
            const rfidJson = await rfidRes.json();
            const currentTag = rfidJson.uid;

            // C. Logic: Only trigger DB if it's a NEW tag
            if (currentTag && currentTag !== 'Waiting...' && currentTag !== lastScannedTag) {
                setLastScannedTag(currentTag); 
                await triggerDatabaseProcess(currentTag);
            }

            setStatus('Connected');
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (error) {
            setStatus('Disconnected');
        }
    };

    // Run polling every 2 seconds
    const timer = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(timer);
  }, [lastScannedTag]); // Re-run if lastScannedTag changes

  // 3. EFFECT: Realtime Listener (Supabase)
  useEffect(() => {
    // Listen for new rows added to 'app_main'
    const subscription = supabase
      .channel('public:app_main')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_main' }, (payload) => {
          console.log("Realtime Update Received!", payload);
          const newUser = payload.new;
          setTagDisplay(newUser.holder_name); // UPDATE THE SCREEN
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROJECT-NALAM</Text>
        <Text style={styles.subHeader}>SECURE WELLNESS MONITOR</Text>
      </View>
      
      <DisplayCard 
          tagDisplay={tagDisplay}
          status={status}
          autonomousMode={autonomousMode}
          lastUpdated={lastUpdated}
      />
      
      <View style={styles.footer}>
          <Text style={styles.footerText}>System Active</Text>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004d40', alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  subHeader: { fontSize: 12, fontWeight: '600', color: '#80cbc4', marginTop: 5, letterSpacing: 1 },
  aiStatusContainer: { width: '85%', padding: 10, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  aiStatusText: { fontWeight: 'bold', color: '#000000', fontSize: 16 },
  card: { backgroundColor: '#ffffff', width: '85%', padding: 25, borderRadius: 16, alignItems: 'center', elevation: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  divider: { height: 1, width: '100%', backgroundColor: '#eee', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#999', marginBottom: 10, letterSpacing: 1 },
  tagContainer: { backgroundColor: '#f5f5f5', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', minWidth: '100%', alignItems: 'center' },
  tagValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  footer: { marginTop: 60 },
  footerText: { color: 'rgba(255, 255, 255, 0.7)' }
});