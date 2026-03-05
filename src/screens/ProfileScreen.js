import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <View style={styles.body}>
        <Text style={styles.text}>Profile Screen</Text>
      </View>
    </View>
  );
};

export default ProfileScreen;

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