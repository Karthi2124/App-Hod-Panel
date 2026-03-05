import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";

const LabsScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Labs" />

      <View style={styles.body}>
        <Text style={styles.text}>Labs Screen</Text>
      </View>
    </View>
  );
};

export default LabsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a"
  },

  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  text: {
    color: "#fff",
    fontSize: 18
  }
});