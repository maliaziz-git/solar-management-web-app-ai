import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View, RefreshControl } from "react-native";

// Same REST APIs as the Next.js web app.
// Set EXPO_PUBLIC_API_URL to your deployed Vercel URL or http://<lan-ip>:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Project = {
  id: string;
  name: string;
  status: string;
  capacityKwp: number;
  monthlyKwh: number;
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      setProjects(await res.json());
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>☀️ SOLS Solar</Text>
        <Text style={styles.sub}>Field view · {projects.length} sites</Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.status} · {item.capacityKwp} kWp · {item.monthlyKwh} kWh/mo
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fb" },
  header: { padding: 20, backgroundColor: "#0c1b2a" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  sub: { color: "#94a3b8", marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  name: { fontWeight: "700", fontSize: 15, color: "#0c1b2a" },
  meta: { color: "#64748b", marginTop: 4, fontSize: 12 },
});
