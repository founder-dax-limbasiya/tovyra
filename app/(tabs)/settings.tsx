import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, ListRow, Notice, Page, SectionTitle, Tag, ActionButton } from "../../components/ui";
import { theme } from "../../constants/theme";
import { clearProviderConfig, loadProviderConfig, loadProviderSummary, normalizeProviderBaseUrl, saveProviderConfig, type ProviderSummary } from "../../lib/providers/config";
import { listAvailableModels } from "../../lib/providers/openai-compatible";

export default function SettingsScreen() {
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [discoveringModels, setDiscoveringModels] = useState(false);
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

  const discoverModels = async () => {
    if (discoveringModels) return;
    try {
      setDiscoveringModels(true);
      setError("");
      setNotice("");
      const stored = await loadProviderConfig();
      const effectiveKey = apiKey.trim() || stored?.apiKey;
      const normalizedUrl = normalizeProviderBaseUrl(baseUrl, effectiveKey);
      const models = await listAvailableModels({ baseUrl: normalizedUrl, apiKey: effectiveKey });
      setAvailableModels(models);
      if (models.length === 0) {
        setNotice("The endpoint responded but returned no model IDs. Enter the exact model ID manually.");
      } else {
        setNotice(`Found ${models.length} model(s). Select one below.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not discover provider models.");
    } finally {
      setDiscoveringModels(false);
    }
  };
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
          <Text style={styles.fieldHint}>For Ollama, use its LAN address and port 11434 with /v1 (for example http://192.168.1.10:11434/v1). For hosted providers, use their documented base URL, usually ending in /v1, and HTTPS. HTTP is restricted to private/local hosts; use trusted Wi-Fi.</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.modelHeader}>
            <Text style={styles.fieldLabel}>MODEL ID</Text>
            <Pressable onPress={() => { void discoverModels(); }} disabled={discoveringModels || !baseUrl.trim()} style={styles.discoverButton}>
              {discoveringModels ? <ActivityIndicator size="small" color={theme.colors.accent} /> : <Ionicons name="search-outline" size={13} color={theme.colors.accent} />}
              <Text style={styles.discoverText}>{discoveringModels ? "Finding..." : "Find models"}</Text>
            </Pressable>
          </View>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="Enter or discover a model ID"
            placeholderTextColor={theme.colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.fieldInput}
          />
          {availableModels.length > 0 ? (
            <View style={styles.modelsList}>
              {availableModels.map((item) => (
                <Pressable key={item} onPress={() => setModel(item)} style={[styles.modelChip, model === item && styles.modelChipActive]}>
                  <Text numberOfLines={1} style={[styles.modelChipText, model === item && styles.modelChipTextActive]}>{item}</Text>
                  {model === item ? <Ionicons name="checkmark" size={13} color={theme.colors.accent} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
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
      <Text style={styles.footer}>Chat works with a configured compatible endpoint. Two local actions (create task and save memory) require your approval. Agent autonomy, external integrations and background routines are not active.</Text>
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
  modelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  discoverButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: theme.colors.surfaceSoft },
  discoverText: { color: theme.colors.accent, fontSize: 9, fontWeight: "800" },
  modelsList: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 3 },
  modelChip: { maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, backgroundColor: theme.colors.surfaceSoft, borderWidth: 1, borderColor: theme.colors.border },
  modelChipActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentDark },
  modelChipText: { color: theme.colors.muted, fontSize: 9, maxWidth: 225 },
  modelChipTextActive: { color: theme.colors.accent, fontWeight: "800" },
  fieldLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  fieldInput: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background, paddingHorizontal: 12, color: theme.colors.text, fontSize: 12 },
  fieldHint: { color: theme.colors.faint, fontSize: 9, lineHeight: 14 },
  savedProvider: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, gap: 7 },
  savedCopy: { color: theme.colors.text, fontSize: 11, fontWeight: "700" },
  savedUrl: { color: theme.colors.muted, fontSize: 9, lineHeight: 14 },
  footer: { color: theme.colors.faint, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 12, paddingVertical: 10 },
});
