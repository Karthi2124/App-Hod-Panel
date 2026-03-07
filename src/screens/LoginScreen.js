import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import { postRequest } from "../config/api";

const LoginScreen = ({ navigation }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    console.log("Login button clicked");

    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {

      console.log("Sending login request...");
      console.log("Email:", email);

      const response = await postRequest("auth/login.php", {
        email: email,
        password: password
      });

      console.log("API Response:", response);

      if (response?.status) {

        console.log("Login successful");
        navigation.replace("MainTabs");

      } else {

        console.log("Login failed");
        Alert.alert("Login Failed", response?.message || "Invalid email or password");

      }

    } catch (error) {

      console.log("Login API Error:", error);
      Alert.alert("Error", "Something went wrong");

    }

  };

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Academic Monitoring</Text>
          <Text style={styles.subtitle}>Admin Portal</Text>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>

          <TextInput
            placeholder="hod@institution.edu"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>PASSWORD</Text>

          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0f172a",
    justifyContent:"center",
    alignItems:"center",
    padding:20
  },

  card:{
    width:"100%",
    backgroundColor:"#ffffff",
    borderRadius:25,
    padding:30,
    elevation:10
  },

  header:{
    alignItems:"center",
    marginBottom:30
  },

  title:{
    fontSize:26,
    fontWeight:"900",
    color:"#1e293b"
  },

  subtitle:{
    fontSize:13,
    color:"#94a3b8",
    marginTop:5
  },

  inputGroup:{
    marginBottom:18
  },

  label:{
    fontSize:11,
    fontWeight:"700",
    color:"#64748b",
    marginBottom:6
  },

  input:{
    borderWidth:1,
    borderColor:"#e2e8f0",
    borderRadius:12,
    padding:14,
    fontSize:14,
    color:"#0f172a"
  },

  button:{
    backgroundColor:"#0f172a",
    padding:16,
    borderRadius:12,
    alignItems:"center",
    marginTop:10
  },

  buttonText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  },

  forgot:{
    alignItems:"center",
    marginTop:20
  },

  forgotText:{
    fontSize:12,
    fontWeight:"bold",
    color:"#64748b"
  }

});