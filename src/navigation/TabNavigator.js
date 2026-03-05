import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome6";

import DashboardScreen from "../screens/DashboardScreen";
import UsersScreen from "../screens/UsersScreen";
import LabsScreen from "../screens/LabsScreen";
import TasksScreen from "../screens/TasksScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#13192d",
        tabBarInactiveTintColor: "gray",

        tabBarIcon: ({ color, size }) => {

          let iconName;

          if (route.name === "Dashboard") iconName = "house";
          if (route.name === "Users") iconName = "users";
          if (route.name === "Labs") iconName = "flask";
          if (route.name === "Tasks") iconName = "list-check";
          if (route.name === "Profile") iconName = "user";

          return <Icon name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Labs" component={LabsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;