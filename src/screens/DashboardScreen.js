import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Header from "../components/Header";
import { getRequest } from "../config/api";
import Icon from "react-native-vector-icons/FontAwesome6";

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

const fetchDashboardData = async () => {
  try {
    setError(null);

    const response = await getRequest("dashboard/get_dashboard.php");

    console.log("Dashboard API Response:", response);

    if (response && response.status === true) {
      setDashboardData(response.data);
    } else {
      setError(response?.message || "Failed to load dashboard data");

      setDashboardData({
        stats: {
          total_labs: "0",
          total_teachers: "0",
          total_students: "0",
          total_tasks: "0",
        },
        labs: [],
        recent_tasks: [],
      });
    }

  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    setError("Network error. Please try again.");

    setDashboardData({
      stats: {
        total_labs: "0",
        total_teachers: "0",
        total_students: "0",
        total_tasks: "0",
      },
      labs: [],
      recent_tasks: [],
    });

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return "Invalid date";
    }
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
      icon: "flask",
      bgColor: "#2563eb",
    },
    {
      label: "Total Teachers",
      value: dashboardData?.stats?.total_teachers || "0",
      icon: "chalkboard-user",
      bgColor: "#9333ea",
    },
    {
      label: "Total Students",
      value: dashboardData?.stats?.total_students || "0",
      icon: "user-graduate",
      bgColor: "#10b981",
    },
    {
      label: "Total Tasks",
      value: dashboardData?.stats?.total_tasks || "0",
      icon: "check-circle",
      bgColor: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon name={stat.icon} size={20} color="#ffffff" solid />
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
            {dashboardData?.labs && dashboardData.labs.length > 0 ? (
              dashboardData.labs.map((lab, index) => (
                <View key={index} style={styles.labCard}>
                  <View style={styles.labHeader}>
                    <View style={styles.labIconContainer}>
                      <Icon name="flask" size={16} color="#ffffff" solid />
                    </View>
                    <View style={styles.labTypeBadge}>
                      <Text style={styles.labTypeText} numberOfLines={1}>
                        {lab.lab_type || "N/A"}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.labName} numberOfLines={1}>
                    {lab.lab_name || "Unnamed Lab"}
                  </Text>
                  
                  <Text style={styles.labDetails} numberOfLines={1}>
                    {lab.department || "No Department"} • Capacity: {lab.capacity || "0"}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="flask" size={40} color="#cbd5e1" light />
                <Text style={styles.noDataText}>No labs found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Task Updates</Text>
          
          <View style={styles.tasksContainer}>
            {dashboardData?.recent_tasks && dashboardData.recent_tasks.length > 0 ? (
              dashboardData.recent_tasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskLeftContent}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {task.title || "Untitled Task"}
                    </Text>
                    <View style={styles.taskMetaContainer}>
                      <Icon name="user" size={10} color="#64748b" light />
                      <Text style={styles.taskMeta} numberOfLines={1}>
                        {task.teacher_name || 'Not Assigned'} • {task.lab_name || 'No Lab'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskRightContent}>
                    <View style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: task.status === 'assigned' ? '#dbeafe' : 
                                       task.status === 'completed' ? '#dcfce7' : '#fef3c7' 
                      }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { 
                          color: task.status === 'assigned' ? '#2563eb' : 
                                task.status === 'completed' ? '#16a34a' : '#d97706' 
                        }
                      ]}>
                        {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                      </Text>
                    </View>
                    
                    <View style={styles.dateContainer}>
                      <Icon name="calendar" size={8} color="#94a3b8" light />
                      <Text style={styles.taskDate}>
                        {formatDate(task.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="clipboard-list" size={40} color="#cbd5e1" light />
                <Text style={styles.noDataText}>No recent tasks found.</Text>
              </View>
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
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  
  // Error Container
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
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
    marginBottom: 6,
  },
  taskMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskMeta: {
    fontSize: 11,
    color: "#64748b",
    flex: 1,
  },
  taskRightContent: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskDate: {
    fontSize: 10,
    color: "#94a3b8",
  },
  noDataContainer: {
    width: "100%",
    padding: 30,
    alignItems: "center",
    gap: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;