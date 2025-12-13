// config/supabaseClient.js

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Needed for React Native

// --- REPLACE THESE WITH YOUR KEYS FROM SUPABASE DASHBOARD ---
const supabaseUrl = 'postgresql://postgres:nalam_admin@db.krprmtavbvyufbdnzgfl.supabase.co:5432/postgres';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycHJtdGF2YnZ5dWZiZG56Z2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDc1ODksImV4cCI6MjA4MTIyMzU4OX0.TBtf7OTgd49xQn-umTkGhIWMz9LXTySwU2SrDshdMTo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // Configuration required for React Native environment
    auth: {
        storage: AsyncStorage, // Uses AsyncStorage to persist the user session
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});