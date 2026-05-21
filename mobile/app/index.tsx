import { View, Text, ActivityIndicator } from "react-native";

export default function Index() {
  // Redirect logic eka hariyawata _layout.tsx eka thama karanawa
  // Eta nisa meke return karanne Loading Screen ekak hakiyawa
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <ActivityIndicator size="large" color="#0B3DA9" />
    </View>
  );
}