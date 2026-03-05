import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        {/* Main App Tabs */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;