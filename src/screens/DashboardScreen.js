import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import { getDashboardData } from "../config/api";

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardData();
      if (response && response.status) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  const stats = [
    {
      label: "Total Labs",
      value: dashboardData?.stats?.total_labs || "0",
      icon: "🔬",
      bgColor: "#2563eb",
    },
    {
      label: "Total Teachers",
      value: dashboardData?.stats?.total_teachers || "0",
      icon: "👨‍🏫",
      bgColor: "#9333ea",
    },
    {
      label: "Total Students",
      value: dashboardData?.stats?.total_students || "0",
      icon: "🎓",
      bgColor: "#10b981",
    },
    {
      label: "Total Tasks",
      value: dashboardData?.stats?.total_tasks || "0",
      icon: "✅",
      bgColor: "#f59e0b",
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Text style={styles.iconText}>{stat.icon}</Text>
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CSE Labs Overview */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CSE Labs Overview</Text>
            <Text style={styles.sectionSubtitle}>Computer Science Department Labs</Text>
          </View>

          <View style={styles.labsGrid}>
            {dashboardData?.labs?.length > 0 ? (
              dashboardData.labs.map((lab, index) => (
                <View key={index} style={styles.labCard}>
                  <View style={styles.labHeader}>
                    <View style={styles.labIconContainer}>
                      <Text style={styles.labIcon}>🔬</Text>
                    </View>
                    <View style={styles.labTypeBadge}>
                      <Text style={styles.labTypeText} numberOfLines={1}>
                        {lab.lab_type}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.labName} numberOfLines={1}>
                    {lab.lab_name}
                  </Text>
                  
                  <Text style={styles.labDetails} numberOfLines={1}>
                    {lab.department} • Capacity: {lab.capacity}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No labs found.</Text>
            )}
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Task Updates</Text>
          
          <View style={styles.tasksContainer}>
            {dashboardData?.recent_tasks?.length > 0 ? (
              dashboardData.recent_tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskLeftContent}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskMeta} numberOfLines={1}>
                      {task.teacher_name || 'Not Assigned'} • {task.lab_name || 'No Lab'}
                    </Text>
                  </View>
                  
                  <View style={styles.taskRightContent}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: task.status === 'assigned' ? '#dbeafe' : '#fef3c7' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: task.status === 'assigned' ? '#2563eb' : '#d97706' }
                      ]}>
                        {task.status.replace('_', ' ')}
                      </Text>
                    </View>
                    
                    <Text style={styles.taskDate}>
                      {formatDate(task.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No recent tasks found.</Text>
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  
  // Stats Cards
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 20,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },

  // Section Cards
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },

  // Labs Grid
  labsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  labCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },
  labHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  labIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  labTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    maxWidth: 100,
  },
  labTypeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "capitalize",
  },
  labName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  labDetails: {
    fontSize: 11,
    color: "#64748b",
  },

  // Tasks Section
  tasksContainer: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    marginBottom: 8,
  },
  taskLeftContent: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  taskRightContent: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  taskDate: {
    fontSize: 10,
    color: "#94a3b8",
  },
  noDataText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    padding: 20,
    width: "100%",
  },
  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;