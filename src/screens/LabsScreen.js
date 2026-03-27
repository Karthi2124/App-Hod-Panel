import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import Header from "../components/Header";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getRequest, postRequest } from "../config/api";

const LabsScreen = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, []);

const fetchLabs = async () => {
  try {
    setLoading(true);

    const res = await getRequest("labs/get_labs.php");

    if (res?.status) {
      setLabs(res.data);
      setFilteredLabs(res.data);

      const uniqueDepartments = [
        ...new Set(res.data.map((lab) => lab.department)),
      ];

      setDepartments(uniqueDepartments);
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to load labs");
  } finally {
    setLoading(false);
  }
};

  const filterByDepartment = (dept) => {
    setSelectedDept(dept);

    if (dept === "all") {
      setFilteredLabs(labs);
    } else {
      const filtered = labs.filter((lab) => lab.department === dept);
      setFilteredLabs(filtered);
    }
  };

  const deleteLab = (id) => {
    Alert.alert("Delete Lab", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const form = new FormData();
            form.append("id", id);

            const res = await postRequest("labs/delete_lab.php", form);

            if (res?.status) {
              fetchLabs();
            } else {
              Alert.alert("Error", res?.message || "Delete failed");
            }
          } catch (error) {
            Alert.alert("Error deleting lab");
          }
        },
      },
    ]);
  };

  const renderLab = ({ item }) => {
    const capacity = parseInt(item.capacity || 0);

    let color = "#16a34a";
    let status = "Active";

    if (capacity < 20) {
      color = "#f59e0b";
    }

    if (item.lab_type === "Maintenance") {
      color = "#ef4444";
      status = "Maintenance";
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
            <Icon name="flask" size={18} color={color} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity>
              <Icon name="pen-to-square" size={16} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteLab(item.id)}>
              <Icon name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.labName}>{item.lab_name}</Text>
        <Text style={styles.dept}>{item.department}</Text>

        <View style={styles.specs}>
          <View style={styles.specBox}>
            <Text style={styles.specTitle}>Capacity</Text>
            <Text style={styles.specValue}>{item.capacity} seats</Text>
          </View>

          <View style={styles.specBox}>
            <Text style={styles.specTitle}>Lab Type</Text>
            <Text style={styles.specValue}>{item.lab_type}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.location}>{item.location}</Text>

          <View style={styles.status}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.statusText, { color }]}>{status}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Labs" />
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Labs" />

      <View style={styles.body}>
        <Text style={styles.title}>Lab Management</Text>

        {/* Department Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filter,
              selectedDept === "all" && styles.activeFilter,
            ]}
            onPress={() => filterByDepartment("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedDept === "all" && styles.activeFilterText,
              ]}
            >
              All Labs
            </Text>
          </TouchableOpacity>

          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.filter,
                selectedDept === dept && styles.activeFilter,
              ]}
              onPress={() => filterByDepartment(dept)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedDept === dept && styles.activeFilterText,
                ]}
              >
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lab Cards */}
        <FlatList
  data={filteredLabs}
  renderItem={renderLab}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="flask" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>No labs found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default LabsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  body: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  filter: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#2563eb",
  },

  filterText: {
    fontSize: 13,
    color: "#374151",
  },

  activeFilterText: {
    color: "#fff",
  },

card: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 12,
  width: "100%",
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  marginTop: 10, 
},

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  labName: {
    fontSize: 15,
    fontWeight: "700",
  },

  dept: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },

  specs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  specBox: {
    backgroundColor: "#f9fafb",
    padding: 6,
    borderRadius: 8,
    width: "48%",
  },

  specTitle: {
    fontSize: 10,
    color: "#9ca3af",
  },

  specValue: {
    fontWeight: "700",
    fontSize: 12,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  location: {
    fontSize: 11,
    color: "#6b7280",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    marginTop: 10,
    color: "#9ca3af",
  },
});