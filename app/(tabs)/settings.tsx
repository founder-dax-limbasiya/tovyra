import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, ListRow, Notice, Page, SectionTitle, Tag, ActionButton } from "../../components/ui";
import { theme } from "../../constants/theme";
import { clearProviderConfig, loadProviderSummary, saveProviderConfig, type ProviderSummary } from "../../lib/providers/config";

export default function SettingsScreen() {
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<ProviderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshProvider = async () => {
    try {
      setError("");
      const saved = await loadProviderSummary();
      setProvider(saved);
      if (saved) {
        setBaseUrl(saved.baseUrl);
        setModel(saved.model);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read secure provider settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refreshProvider(); }, []);

  const save = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      setNotice("");
      await saveProviderConfig({ baseUrl, model, apiKey: apiKey.trim() || undefined });
      setApiKey("");
      await refreshProvider();
      setNotice("Provider settings saved in this device's secure storage. Try sending a message from Chat.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save provider settings.");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    try {
      setError("");
      await clearProviderConfig();
      setProvider(null);
      setBaseUrl("");
      setModel("");
      setApiKey("");
      setNotice("Provider settings and saved API key were removed from this device.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not clear provider settings.");
    }
  };

  return (
    <Page eyebrow="CONTROL CENTRE" title="Settings" subtitle="Manage your model connection, connected tools and privacy boundaries.">
      <Card style={styles.providerCard}>
        <View style={styles.providerTop}>
          <View style={styles.providerBadge}><Ionicons name="hardware-chip-outline" size={22} color={theme.colors.accent} /></View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.providerTitle}>Bring your own model</Text>
            <Text style={styles.providerSubtitle}>Connect any OpenAI-compatible chat endpoint.</Text>
          </View>
          <Tag label={provider ? "SAVED" : loading ? "LOADING" : "NOT SET UP"} tone={provider ? "accent" : "warning"} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>API BASE URL</Text>
          <TextInput
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="http://192.168.1.10:11434/v1"
            placeholderTextColor={theme.colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.fieldInput}
          />
          <Text style={styles.fieldHint}>For an Ollama server on private Wi-Fi, use its LAN address and port 11434. Add /v1. HTTP is restricted to private/local hosts; use trusted Wi-Fi.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>MODEL ID</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="Exact model ID from your provider"
            placeholderTextColor={theme.colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.fieldInput}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>API KEY (OPTIONAL)</Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder={provider?.hasApiKey ? "Saved securely — leave blank to keep" : "Leave blank for local Ollama"}
            placeholderTextColor={theme.colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={styles.fieldInput}
          />
          <Text style={styles.fieldHint}>A blank key keeps the currently saved key. Use HTTPS for key-based providers. Keys are stored with Android's secure storage and are not committed to Git.</Text>
        </View>

        {error ? <Notice title="Provider settings" detail={error} icon="alert-circle-outline" /> : null}
        {notice ? <Notice title="Settings updated" detail={notice} icon="checkmark-circle-outline" /> : null}

        <ActionButton title={saving ? "Saving..." : "Save provider"} icon="lock-closed-outline" onPress={save} disabled={saving || loading || !baseUrl.trim() || !model.trim()} />
        {provider ? <ActionButton title="Remove provider and key" secondary icon="trash-outline" onPress={clear} /> : null}
        {provider ? (
          <View style={styles.savedProvider}>
            <Tag label={provider.hasApiKey ? "API KEY SAVED" : "NO KEY REQUIRED"} tone="blue" />
            <Text style={styles.savedCopy}>Saved model: {provider.model}</Text>
            <Text style={styles.savedUrl} numberOfLines={2}>{provider.baseUrl}</Text>
          </View>
        ) : null}
      </Card>

      <Notice title="No hidden provider" detail="Chat sends prompts only to the endpoint you configure. OTHRI does not run model inference itself or proxy your provider key through an OTHRI server." icon="shield-checkmark-outline" />

      <SectionTitle title="Workspace" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="extension-puzzle-outline" title="Connected tools" detail="No browser, file or account integrations are connected yet" right={<Tag label="0 CONNECTED" tone="warning" />} />
        <ListRow icon="shield-checkmark-outline" title="Permissions" detail="Review the default-deny action policy" right={<Tag label="DEFAULT DENY" tone="accent" />} onPress={() => router.push("/permissions")} />
      </Card>

      <SectionTitle title="Privacy and data" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="albums-outline" title="Local memory" detail="Saved in this phone's SQLite database" right={<Tag label="ACTIVE" tone="accent" />} onPress={() => router.push("/(tabs)/memory")} />
        <ListRow icon="document-text-outline" title="Activity audit" detail="View memory and task changes" onPress={() => router.push("/activity")} />
        <ListRow icon="cloud-offline-outline" title="Cloud sync" detail="No account or remote sync configured" right={<Tag label="NOT CONNECTED" />} />
      </Card>

      <SectionTitle title="More" />
      <Card style={{ gap: 2 }}>
        <ListRow icon="checkmark-done-outline" title="Tasks" detail="Manage your offline action list" onPress={() => router.push("/tasks")} />
        <ListRow icon="repeat-outline" title="Routines" detail="Review draft workflow templates" onPress={() => router.push("/routines")} />
        <ListRow icon="logo-github" title="Source repository" detail="Open the OTHRI mobile source" onPress={() => Linking.openURL("https://github.com/founder-dax-limbasiya/tovyra")} />
        <ListRow icon="information-circle-outline" title="About OTHRI" detail="Early mobile foundation · v0.1.0" />
      </Card>
      <Text style={styles.footer}>Model execution is available only after you configure a compatible endpoint. Agents, tools, approval execution and background routines are not yet active.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  providerCard: { gap: 14 },
  providerTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  providerBadge: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.colors.accentDark, alignItems: "center", justifyContent: "center" },
  providerTitle: { color: theme.colors.text, fontSize: 13, fontWeight: "700" },
  providerSubtitle: { color: theme.colors.muted, fontSize: 10, lineHeight: 15 },
  field: { gap: 7 },
  fieldLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  fieldInput: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background, paddingHorizontal: 12, color: theme.colors.text, fontSize: 12 },
  fieldHint: { color: theme.colors.faint, fontSize: 9, lineHeight: 14 },
  savedProvider: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, gap: 7 },
  savedCopy: { color: theme.colors.text, fontSize: 11, fontWeight: "700" },
  savedUrl: { color: theme.colors.muted, fontSize: 9, lineHeight: 14 },
  footer: { color: theme.colors.faint, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 12, paddingVertical: 10 },
});
