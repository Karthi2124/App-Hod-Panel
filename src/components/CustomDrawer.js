// src/components/JS CustomDrawer.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome6';

const COLORS = {
  primary: '#2a69ed',
  secondary: '#f04d4b',
  accent: '#dc2725',
  background: '#f6f9fb',
  dark: '#151f31',
  textSecondary: '#495161',
  border: '#a2afc5',
  cardBg: '#22385f',
  white: '#ffffff',
};

const CustomDrawer = (props) => {
  return (
    <View style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DJ</Text>
          </View>
        </View>
        <Text style={styles.userName}>Dr. James Wilson</Text>
        <Text style={styles.userRole}>Head of Department</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Labs</Text>
          </View>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="gear" size={18} color={COLORS.border} />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="circle-question" size={18} color={COLORS.border} />
          <Text style={styles.footerText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  userInfoSection: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '20',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.border,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border + '20',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.border,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  drawerContent: {
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '20',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.border,
    fontWeight: '500',
  },
});

export default CustomDrawer;