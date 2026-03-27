import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";

import Header from "../components/Header";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getRequest, postRequest } from "../config/api";

const TasksScreen = ({ navigation }) => {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {

    setLoading(true);

    try {

      const res = await getRequest(
        "tasks/list.php?department=Computer%20Science"
      );

      console.log("TASK API:", res);

      if (res?.status && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }

    } catch (error) {
      console.log("Error loading tasks:", error);
      setTasks([]);
    }

    setLoading(false);
  };

  const deleteTask = (id) => {

    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {

            const res = await postRequest(
              "tasks/delete.php",
              { id }
            );

            if (res?.status) {

              Alert.alert("Success", "Task deleted");

              loadTasks();

            } else {

              Alert.alert("Error", res?.message || "Delete failed");

            }

          },
        },
      ]
    );

  };

  const filteredTasks = tasks.filter((task) =>
    (task.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderTask = ({ item }) => {

    const totalStudents = Number(item.total_students || 0);
    const completed = Number(item.completed_count || 0);

    const progress =
      totalStudents > 0
        ? Math.round((completed / totalStudents) * 100)
        : 0;

    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <Text style={styles.status}>
            {item.status}
          </Text>

          <View style={styles.icons}>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("TaskDetails", {
                  id: item.id
                })
              }
            >
              <Icon name="eye" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditTask", {
                  task: item
                })
              }
            >
              <Icon name="pen-to-square" size={16} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
            >
              <Icon name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>

          </View>

        </View>

        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.infoRow}>

          <Icon name="users" size={14} color="#64748b" />

          <Text style={styles.infoText}>
            Year {item.year}
          </Text>

        </View>

        <View style={styles.progressContainer}>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Progress
            </Text>

            <Text style={styles.progressLabel}>
              {progress}%
            </Text>
          </View>

          <View style={styles.progressBar}>

            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />

          </View>

        </View>

      </View>
    );
  };

  return (

    <View style={styles.container}>

      <Header title="Task Management" />

      <View style={styles.searchBox}>

        <Icon
          name="magnifying-glass"
          size={16}
          color="#64748b"
        />

        <TextInput
          placeholder="Search tasks..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

      </View>

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

      ) : (

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderTask}
          contentContainerStyle={{ padding: 16 }}
        />

      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("CreateTask")
        }
      >
        <Icon name="plus" size={18} color="#fff" />
      </TouchableOpacity>

    </View>

  );

};

export default TasksScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  status: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },

  icons: {
    flexDirection: "row",
    gap: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    color: "#0f172a",
  },

  description: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  infoText: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 6,
  },

  progressContainer: {
    marginTop: 14,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    marginTop: 6,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 55,
    height: 55,
    backgroundColor: "#2563eb",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

});