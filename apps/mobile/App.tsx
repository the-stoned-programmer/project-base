import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { SystemStatus, ApiError } from '@modern/contracts';

const API_ENDPOINT = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/status';

export default function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('Never');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_ENDPOINT);
      if (!res.ok) {
        let errPayload: ApiError | undefined;
        try {
          errPayload = (await res.json()) as ApiError;
        } catch {
          // Non-JSON error
        }
        throw new Error(errPayload?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as SystemStatus;
      setStatus(data);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Modern Mobile</Text>
          <Text style={styles.subtitle}>Operator Cockpit • React Native (Expo)</Text>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HEALTH STATE</Text>
          <Text style={[styles.cardValue, error ? styles.textError : styles.textSuccess]}>
            {error ? 'Degraded' : status?.healthy ? 'System Healthy' : 'Initializing...'}
          </Text>
          <Text style={styles.cardSubtext}>
            {error ? error : `Last verified: ${lastCheck}`}
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.grid}>
          <View style={[styles.card, styles.gridItem]}>
            <Text style={styles.cardLabel}>UPTIME</Text>
            <Text style={styles.metricValue}>{status ? `${status.uptime_secs}s` : '—'}</Text>
            <Text style={styles.cardSubtext}>
              Env: <Text style={styles.fontMono}>{status?.environment || 'unknown'}</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.gridItem]}>
            <Text style={styles.cardLabel}>ENGINE</Text>
            <Text style={styles.metricValue}>v{status?.version || '0.0.0'}</Text>
            <Text style={styles.cardSubtext}>Rust ➔ TS Bridge</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchStatus}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh System Status</Text>
          )}
        </TouchableOpacity>

        {/* Invariant Note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Shared Contract Invariant</Text>
          <Text style={styles.infoText}>
            This mobile client imports exact Rust domain models directly from{' '}
            <Text style={styles.codeText}>@modern/contracts</Text>. Any backend contract update is
            strictly enforced by the TypeScript compiler.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    padding: 24,
    gap: 16,
  },
  header: {
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  textSuccess: {
    color: '#34d399',
  },
  textError: {
    color: '#f87171',
  },
  fontMono: {
    fontFamily: 'monospace',
    color: '#cbd5e1',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.8)',
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  codeText: {
    color: '#34d399',
    fontFamily: 'monospace',
  },
});
