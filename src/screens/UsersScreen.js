import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Header from '../components/Header';
import { Picker } from '@react-native-picker/picker';
import { pick, isCancel } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

// API Service - You'll need to implement this based on your backend
import api from '../config/api';

const UsersScreen = () => {
  // State for data
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [labIncharges, setLabIncharges] = useState([]);
  const [labs, setLabs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('all-users');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddLabInchargeModal, setShowAddLabInchargeModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditLabInchargeModal, setShowEditLabInchargeModal] = useState(false);

  // Filter states
  const [yearFilter, setYearFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [labFilter, setLabFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkUploadType, setBulkUploadType] = useState('teachers');

  // Edit states
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingLabIncharge, setEditingLabIncharge] = useState(null);

  // Form states
  const [teacherForm, setTeacherForm] = useState({
    full_name: '',
    user_id: '',
    qualification: '',
    specialization: '',
    joining_date: '',
    year: '',
  });

  const [studentForm, setStudentForm] = useState({
    full_name: '',
    roll_number: '',
    year: '',
    batch: '',
    attendance: '0',
  });

  const [labInchargeForm, setLabInchargeForm] = useState({
    incharge_name: '',
    user_id: '',
    lab_id: '',
    assigned_date: '',
    status: 'active',
  });

  // Message state
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);

    const res = await api.get('/users/get_users.php');

    if (res.data.status) {
      setTeachers(res.data.teachers || []);
      setStudents(res.data.students || []);
      setLabIncharges(res.data.lab_incharges || []);
    } else {
      setErrorMessage("Failed to load users");
    }

  } catch (error) {
    console.log("Fetch Error:", error);
    setErrorMessage("Failed to fetch users");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter functions
  const getFilteredTeachers = () => {
    let filtered = [...teachers];
    if (yearFilter !== 'all') {
      filtered = filtered.filter(t => t.year === yearFilter);
    }
    return filtered;
  };

  const getFilteredStudents = () => {
    let filtered = [...students];
    if (yearFilter !== 'all') {
      filtered = filtered.filter(s => s.year === yearFilter);
    }
    if (batchFilter !== 'all') {
      filtered = filtered.filter(s => s.batch === batchFilter);
    }
    return filtered;
  };

  const getFilteredLabIncharges = () => {
    let filtered = [...labIncharges];
    if (labFilter !== 'all') {
      filtered = filtered.filter(l => l.lab_id === labFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    return filtered;
  };

  const getAllUsers = () => {
    const allUsers = [
      ...teachers.map(t => ({ ...t, user_type: 'teacher' })),
      ...students.map(s => ({ ...s, user_type: 'student' })),
      ...labIncharges.map(l => ({ ...l, user_type: 'lab-incharge' })),
    ];
    return allUsers;
  };

  const getCurrentRows = () => {
    let rows = [];
    switch (activeTab) {
      case 'teachers':
        rows = getFilteredTeachers();
        break;
      case 'students':
        rows = getFilteredStudents();
        break;
      case 'lab-incharges':
        rows = getFilteredLabIncharges();
        break;
      default:
        rows = getAllUsers();
    }

    // Pagination
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  };

  const getTotalPages = () => {
    let total = 0;
    switch (activeTab) {
      case 'teachers':
        total = getFilteredTeachers().length;
        break;
      case 'students':
        total = getFilteredStudents().length;
        break;
      case 'lab-incharges':
        total = getFilteredLabIncharges().length;
        break;
      default:
        total = getAllUsers().length;
    }
    return Math.ceil(total / rowsPerPage);
  };

  // CRUD Operations
  const handleAddTeacher = async () => {
    try {
      const formData = new FormData();
      Object.keys(teacherForm).forEach(key => {
        formData.append(key, teacherForm[key]);
      });
      formData.append('add_teacher', 'true');

const response = await api.post('/users/add_teacher.php', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

      setSuccessMessage('Teacher added successfully!');
      setShowAddTeacherModal(false);
      resetTeacherForm();
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding teacher');
    }
  };

  const handleAddStudent = async () => {
    try {
      const formData = new FormData();
      Object.keys(studentForm).forEach(key => {
        formData.append(key, studentForm[key]);
      });
      formData.append('add_student', 'true');

      const response = await api.post('/users/add_student.php', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

      setSuccessMessage('Student added successfully!');
      setShowAddStudentModal(false);
      resetStudentForm();
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleAddLabIncharge = async () => {
    try {
      const formData = new FormData();
      Object.keys(labInchargeForm).forEach(key => {
        formData.append(key, labInchargeForm[key]);
      });
      formData.append('add_lab_incharge', 'true');

      const response = await api.post('/users/add_lab_incharge.php', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

      setSuccessMessage('Lab Incharge added successfully!');
      setShowAddLabInchargeModal(false);
      resetLabInchargeForm();
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding lab incharge');
    }
  };

  const handleDeleteTeacher = (id) => {
    Alert.alert(
      'Delete Teacher',
      'Are you sure you want to delete this teacher?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/users/delete_user.php', {
  id: id,
  type: 'teacher'
});
              setSuccessMessage('Teacher deleted successfully!');
              fetchData();
            } catch (error) {
              setErrorMessage('Error deleting teacher');
            }
          },
        },
      ]
    );
  };

  const handleDeleteStudent = (id) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/users/delete_user.php', {
  id: id,
  type: 'student'
});
              setSuccessMessage('Student deleted successfully!');
              fetchData();
            } catch (error) {
              setErrorMessage('Error deleting student');
            }
          },
        },
      ]
    );
  };

  const handleDeleteLabIncharge = (id) => {
    Alert.alert(
      'Delete Lab Incharge',
      'Are you sure you want to delete this lab incharge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/users/delete_user.php', {
  id: id,
  type: 'lab_incharge'
});
              setSuccessMessage('Lab Incharge deleted successfully!');
              fetchData();
            } catch (error) {
              setErrorMessage('Error deleting lab incharge');
            }
          },
        },
      ]
    );
  };

  const handleEditTeacher = async () => {
    try {
      const formData = new FormData();
      Object.keys(teacherForm).forEach(key => {
        formData.append(key, teacherForm[key]);
      });
      formData.append('edit_teacher', 'true');

      await api.post('/users/update_teacher.php', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
});

      setSuccessMessage('Teacher updated successfully!');
      setShowEditTeacherModal(false);
      setEditingTeacher(null);
      resetTeacherForm();
      fetchData();
    } catch (error) {
      setErrorMessage('Error updating teacher');
    }
  };

  const handleEditStudent = async () => {
    try {
      const formData = new FormData();
      Object.keys(studentForm).forEach(key => {
        formData.append(key, studentForm[key]);
      });
      formData.append('edit_student', 'true');

      await api.post('/users/update_student.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage('Student updated successfully!');
      setShowEditStudentModal(false);
      setEditingStudent(null);
      resetStudentForm();
      fetchData();
    } catch (error) {
      setErrorMessage('Error updating student');
    }
  };

  const handleEditLabIncharge = async () => {
    try {
      const formData = new FormData();
      Object.keys(labInchargeForm).forEach(key => {
        formData.append(key, labInchargeForm[key]);
      });
      formData.append('edit_lab_incharge', 'true');

      await api.post('/users/update_lab_incharge.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage('Lab Incharge updated successfully!');
      setShowEditLabInchargeModal(false);
      setEditingLabIncharge(null);
      resetLabInchargeForm();
      fetchData();
    } catch (error) {
      setErrorMessage('Error updating lab incharge');
    }
  };

  const handleBulkUpload = async () => {
    try {
const [file] = await pick({
  type: ['text/csv'],
});

const filePath = file.uri;
      const formData = new FormData();
      formData.append('csv_file', {
        uri: filePath,
        type: 'text/csv',
        name: 'upload.csv',
      });
      formData.append(`bulk_upload_${bulkUploadType}`, 'true');

      const response = await api.post(`/bulk-upload/${bulkUploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage(response.data.message);
      setShowBulkUploadModal(false);
      fetchData();
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled
      } else {
        setErrorMessage('Error uploading file');
      }
    }
  };

  const downloadSampleCSV = (type) => {
    let content = '';
    let filename = '';

    if (type === 'teachers') {
      content = 'Full Name,Qualification,Specialization,Joining Date,Year\nJohn Doe,Ph.D.,Computer Science,2024-01-15,Year 1\nJane Smith,M.Tech,Data Science,2024-02-01,Year 2';
      filename = 'sample_teachers.csv';
    } else if (type === 'students') {
      content = 'Full Name,Roll Number,Year,Batch,Attendance\nAlice Johnson,CS001,Year 1,2025,85\nBob Williams,CS002,Year 1,2025,90';
      filename = 'sample_students.csv';
    } else if (type === 'lab_incharges') {
      content = 'Incharge Name,Lab ID,Assigned Date,Status\nDr. Smith,1,2024-01-15,active\nProf. Johnson,2,2024-02-01,active';
      filename = 'sample_lab_incharges.csv';
    }

    // In React Native, you'd need to save this file
    Alert.alert('Download Sample', 'Sample CSV content:\n\n' + content);
  };

  // Reset forms
  const resetTeacherForm = () => {
    setTeacherForm({
      full_name: '',
      user_id: '',
      qualification: '',
      specialization: '',
      joining_date: '',
      year: '',
    });
  };

  const resetStudentForm = () => {
    setStudentForm({
      full_name: '',
      roll_number: '',
      year: '',
      batch: '',
      attendance: '0',
    });
  };

  const resetLabInchargeForm = () => {
    setLabInchargeForm({
      incharge_name: '',
      user_id: '',
      lab_id: '',
      assigned_date: '',
      status: 'active',
    });
  };

  // Render table rows based on active tab
  const renderTableRow = ({ item }) => {
    switch (activeTab) {
      case 'teachers':
        return (
          <View style={styles.tableRow}>
            <View style={styles.cell}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={[styles.avatarText, { color: '#9333ea' }]}>
                    {item.full_name?.[0]?.toUpperCase() || 'T'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.full_name || item.username}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cell}>{item.qualification || '-'}</Text>
            <Text style={styles.cell}>{item.specialization || '-'}</Text>
            <Text style={styles.cell}>{item.joining_date || '-'}</Text>
            <Text style={styles.cell}>{item.year || '-'}</Text>
            <View style={styles.cell}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell]}>
              <TouchableOpacity
                onPress={() => {
                  setEditingTeacher(item);
                  setTeacherForm({
                    full_name: item.full_name,
                    user_id: item.user_id,
                    qualification: item.qualification,
                    specialization: item.specialization,
                    joining_date: item.joining_date,
                    year: item.year,
                  });
                  setShowEditTeacherModal(true);
                }}
                style={styles.actionButton}
              >
                <Icon name="pen-to-square" size={16} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteTeacher(item.id)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'students':
        return (
          <View style={styles.tableRow}>
            <View style={styles.cell}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.avatarText, { color: '#16a34a' }]}>
                    {item.student_name?.[0]?.toUpperCase() || 'S'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.student_name}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cell}>{item.roll_number || '-'}</Text>
            <Text style={styles.cell}>{item.year || '-'}</Text>
            <Text style={styles.cell}>{item.batch || '-'}</Text>
            <View style={styles.cell}>
              <Text
                style={[
                  styles.attendanceText,
                  item.attendance >= 75
                    ? styles.attendanceHigh
                    : item.attendance >= 60
                    ? styles.attendanceMedium
                    : styles.attendanceLow,
                ]}
              >
                {item.attendance || 0}%
              </Text>
            </View>
            <View style={styles.cell}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell]}>
              <TouchableOpacity
                onPress={() => {
                  setEditingStudent(item);
                  setStudentForm({
                    full_name: item.student_name,
                    roll_number: item.roll_number,
                    year: item.year,
                    batch: item.batch,
                    attendance: item.attendance?.toString() || '0',
                  });
                  setShowEditStudentModal(true);
                }}
                style={styles.actionButton}
              >
                <Icon name="pen-to-square" size={16} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteStudent(item.id)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'lab-incharges':
        return (
          <View style={styles.tableRow}>
            <View style={styles.cell}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#ffedd5' }]}>
                  <Text style={[styles.avatarText, { color: '#ea580c' }]}>
                    {item.full_name?.[0]?.toUpperCase() || 'L'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.full_name}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cell}>{item.lab_name || `Lab #${item.lab_id}`}</Text>
            <Text style={styles.cell}>{item.location || '-'}</Text>
            <Text style={styles.cell}>{item.assigned_date || '-'}</Text>
            <View style={styles.cell}>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'active' ? styles.activeStatus : styles.inactiveStatus,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'active' ? styles.activeStatusText : styles.inactiveStatusText,
                  ]}
                >
                  {item.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Text style={styles.cell}>{item.created_at || '-'}</Text>
            <View style={[styles.cell, styles.actionsCell]}>
              <TouchableOpacity
                onPress={() => {
                  setEditingLabIncharge(item);
                  setLabInchargeForm({
                    incharge_name: item.incharge_name,
                    user_id: item.user_id,
                    lab_id: item.lab_id,
                    assigned_date: item.assigned_date,
                    status: item.status,
                  });
                  setShowEditLabInchargeModal(true);
                }}
                style={styles.actionButton}
              >
                <Icon name="pen-to-square" size={16} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteLabIncharge(item.id)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        );

      default: // All Users
        return (
          <View style={styles.tableRow}>
            <View style={styles.cell}>
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        item.user_type === 'teacher'
                          ? '#f3e8ff'
                          : item.user_type === 'student'
                          ? '#dcfce7'
                          : '#ffedd5',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          item.user_type === 'teacher'
                            ? '#9333ea'
                            : item.user_type === 'student'
                            ? '#16a34a'
                            : '#ea580c',
                      },
                    ]}
                  >
                    {item.full_name?.[0]?.toUpperCase() ||
                      item.student_name?.[0]?.toUpperCase() ||
                      'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {item.full_name || item.student_name || item.incharge_name}
                  </Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cell}>
              {item.user_type === 'teacher'
                ? 'Teacher'
                : item.user_type === 'student'
                ? 'Student'
                : 'Lab Incharge'}
            </Text>
            <Text style={styles.cell}>
              {item.user_type === 'teacher'
                ? item.qualification
                : item.user_type === 'student'
                ? `Roll: ${item.roll_number}`
                : `Lab: ${item.lab_name}`}
            </Text>
            <View style={styles.cell}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell]}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="pen-to-square" size={16} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="trash-can" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  // Render table header based on active tab
  const renderTableHeader = () => {
    const headers = {
      'all-users': ['Name', 'Role', 'Details', 'Status', 'Actions'],
      teachers: ['Teacher', 'Qualification', 'Specialization', 'Joining Date', 'Year', 'Status', 'Actions'],
      students: ['Student', 'Roll Number', 'Year', 'Batch', 'Attendance %', 'Status', 'Actions'],
      'lab-incharges': ['Lab Incharge', 'Lab', 'Location', 'Assigned Date', 'Status', 'Created At', 'Actions'],
    };

    const currentHeaders = headers[activeTab] || headers['all-users'];

    return (
      <View style={styles.tableHeader}>
        {currentHeaders.map((header, index) => (
          <Text key={index} style={[styles.headerText, index === currentHeaders.length - 1 && styles.headerActions]}>
            {header}
          </Text>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Users" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Users" />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>Manage teachers, students, and lab incharges</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.bulkButton} onPress={() => setShowBulkUploadModal(true)}>
              <Icon name="upload" size={16} color="#374151" />
              <Text style={styles.bulkButtonText}>Bulk Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addTeacherButton} onPress={() => setShowAddTeacherModal(true)}>
              <Icon name="chalkboard-user" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addStudentButton} onPress={() => setShowAddStudentModal(true)}>
              <Icon name="user-graduate" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addLabInchargeButton} onPress={() => setShowAddLabInchargeModal(true)}>
              <Icon name="flask" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add Lab Incharge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {successMessage ? (
          <View style={styles.successMessage}>
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorMessage}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {['All Users', 'Teachers', 'Students', 'Lab Incharges'].map((tab, index) => {
              const tabId = tab.toLowerCase().replace(' ', '-');
              return (
                <TouchableOpacity
                  key={tabId}
                  style={[styles.tab, activeTab === tabId && styles.activeTab]}
                  onPress={() => {
                    setActiveTab(tabId);
                    setCurrentPage(1);
                  }}
                >
                  <Text style={[styles.tabText, activeTab === tabId && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filters}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Year</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={yearFilter}
                  onValueChange={setYearFilter}
                  style={styles.picker}
                  dropdownIconColor="#6b7280"
                >
                  <Picker.Item label="All Years" value="all" />
                  <Picker.Item label="Year 1" value="Year 1" />
                  <Picker.Item label="Year 2" value="Year 2" />
                  <Picker.Item label="Year 3" value="Year 3" />
                  <Picker.Item label="Year 4" value="Year 4" />
                </Picker>
              </View>
            </View>

            {(activeTab === 'students' || activeTab === 'all-users') && (
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Batch</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={batchFilter}
                    onValueChange={setBatchFilter}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item label="All Batches" value="all" />
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                    <Picker.Item label="2027" value="2027" />
                    <Picker.Item label="2028" value="2028" />
                  </Picker>
                </View>
              </View>
            )}

            {(activeTab === 'lab-incharges' || activeTab === 'all-users') && (
              <>
                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Lab</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={labFilter}
                      onValueChange={setLabFilter}
                      style={styles.picker}
                      dropdownIconColor="#6b7280"
                    >
                      <Picker.Item label="All Labs" value="all" />
                      {labs.map(lab => (
                        <Picker.Item key={lab.id} label={lab.lab_name} value={lab.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.filterItem}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={statusFilter}
                      onValueChange={setStatusFilter}
                      style={styles.picker}
                      dropdownIconColor="#6b7280"
                    >
                      <Picker.Item label="All Status" value="all" />
                      <Picker.Item label="Active" value="active" />
                      <Picker.Item label="Inactive" value="inactive" />
                    </Picker>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Table */}
        <View style={styles.tableContainer}>
          {renderTableHeader()}

          <FlatList
            data={getCurrentRows()}
            renderItem={renderTableRow}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            }
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            <Text style={styles.paginationInfo}>
              Showing {getCurrentRows().length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, getTotalPages() * rowsPerPage)} of{' '}
              {getTotalPages() * rowsPerPage} users
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icon name="chevron-left" size={14} color={currentPage === 1 ? '#d1d5db' : '#374151'} />
              </TouchableOpacity>

              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                <TouchableOpacity
                  key={page}
                  style={[styles.pageButton, currentPage === page && styles.activePageButton]}
                  onPress={() => setCurrentPage(page)}
                >
                  <Text style={[styles.pageButtonText, currentPage === page && styles.activePageButtonText]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === getTotalPages() && styles.paginationButtonDisabled,
                ]}
                onPress={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                disabled={currentPage === getTotalPages()}
              >
                <Icon
                  name="chevron-right"
                  size={14}
                  color={currentPage === getTotalPages() ? '#d1d5db' : '#374151'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Teacher Modal */}
      <Modal visible={showAddTeacherModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Teacher</Text>
              <TouchableOpacity onPress={() => setShowAddTeacherModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Teacher Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.full_name}
                  onChangeText={text => setTeacherForm({ ...teacherForm, full_name: text })}
                  placeholder="Enter teacher's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select User (Optional)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={teacherForm.user_id}
                    onValueChange={value => setTeacherForm({ ...teacherForm, user_id: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Create New User --" value="" />
                    {users
                      .filter(u => u.role === 'teacher' || u.role === 'hod' || !u.role)
                      .map(user => (
                        <Picker.Item
                          key={user.id}
                          label={`${user.full_name || user.username} - ${user.email || 'No email'}${user.role ? ` (${user.role})` : ''}`}
                          value={user.id}
                        />
                      ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Qualification <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.qualification}
                  onChangeText={text => setTeacherForm({ ...teacherForm, qualification: text })}
                  placeholder="e.g., Ph.D., M.Tech"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Specialization <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.specialization}
                  onChangeText={text => setTeacherForm({ ...teacherForm, specialization: text })}
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Joining Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.joining_date}
                  onChangeText={text => setTeacherForm({ ...teacherForm, joining_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={teacherForm.year}
                    onValueChange={value => setTeacherForm({ ...teacherForm, year: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Year" value="" />
                    <Picker.Item label="Year 1" value="Year 1" />
                    <Picker.Item label="Year 2" value="Year 2" />
                    <Picker.Item label="Year 3" value="Year 3" />
                    <Picker.Item label="Year 4" value="Year 4" />
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddTeacherModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddTeacher}>
                <Text style={styles.submitButtonText}>Add Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      <Modal visible={showAddStudentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Student</Text>
              <TouchableOpacity onPress={() => setShowAddStudentModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Student Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.full_name}
                  onChangeText={text => setStudentForm({ ...studentForm, full_name: text })}
                  placeholder="Enter student's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Roll Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.roll_number}
                  onChangeText={text => setStudentForm({ ...studentForm, roll_number: text })}
                  placeholder="e.g., CS001"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={studentForm.year}
                    onValueChange={value => setStudentForm({ ...studentForm, year: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Year" value="" />
                    <Picker.Item label="Year 1" value="Year 1" />
                    <Picker.Item label="Year 2" value="Year 2" />
                    <Picker.Item label="Year 3" value="Year 3" />
                    <Picker.Item label="Year 4" value="Year 4" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Batch <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={studentForm.batch}
                    onValueChange={value => setStudentForm({ ...studentForm, batch: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Batch" value="" />
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                    <Picker.Item label="2027" value="2027" />
                    <Picker.Item label="2028" value="2028" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Attendance Percentage</Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.attendance}
                  onChangeText={text => setStudentForm({ ...studentForm, attendance: text })}
                  placeholder="Enter attendance percentage"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddStudentModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, styles.studentSubmitButton]} onPress={handleAddStudent}>
                <Text style={styles.submitButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Lab Incharge Modal */}
      <Modal visible={showAddLabInchargeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Lab Incharge</Text>
              <TouchableOpacity onPress={() => setShowAddLabInchargeModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Incharge Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={labInchargeForm.incharge_name}
                  onChangeText={text => setLabInchargeForm({ ...labInchargeForm, incharge_name: text })}
                  placeholder="Enter incharge's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select User (Optional)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={labInchargeForm.user_id}
                    onValueChange={value => setLabInchargeForm({ ...labInchargeForm, user_id: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Create New User --" value="" />
                    {users
                      .filter(u => u.role === 'lab_incharge' || u.role === 'teacher' || !u.role)
                      .map(user => (
                        <Picker.Item
                          key={user.id}
                          label={`${user.full_name || user.username} - ${user.email || 'No email'}${user.role ? ` (${user.role})` : ''}`}
                          value={user.id}
                        />
                      ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Lab <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={labInchargeForm.lab_id}
                    onValueChange={value => setLabInchargeForm({ ...labInchargeForm, lab_id: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Lab" value="" />
                    {labs.map(lab => (
                      <Picker.Item
                        key={lab.id}
                        label={`${lab.lab_name} (${lab.location || 'No location'})`}
                        value={lab.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Assigned Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={labInchargeForm.assigned_date}
                  onChangeText={text => setLabInchargeForm({ ...labInchargeForm, assigned_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={labInchargeForm.status}
                    onValueChange={value => setLabInchargeForm({ ...labInchargeForm, status: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Inactive" value="inactive" />
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddLabInchargeModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, styles.labSubmitButton]} onPress={handleAddLabIncharge}>
                <Text style={styles.submitButtonText}>Add Lab Incharge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal visible={showEditTeacherModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Teacher</Text>
              <TouchableOpacity onPress={() => setShowEditTeacherModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Teacher Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.full_name}
                  onChangeText={text => setTeacherForm({ ...teacherForm, full_name: text })}
                  placeholder="Enter teacher's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Qualification</Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.qualification}
                  onChangeText={text => setTeacherForm({ ...teacherForm, qualification: text })}
                  placeholder="e.g., Ph.D., M.Tech"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Specialization</Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.specialization}
                  onChangeText={text => setTeacherForm({ ...teacherForm, specialization: text })}
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Joining Date</Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.joining_date}
                  onChangeText={text => setTeacherForm({ ...teacherForm, joining_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={teacherForm.year}
                    onValueChange={value => setTeacherForm({ ...teacherForm, year: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Year 1" value="Year 1" />
                    <Picker.Item label="Year 2" value="Year 2" />
                    <Picker.Item label="Year 3" value="Year 3" />
                    <Picker.Item label="Year 4" value="Year 4" />
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditTeacherModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleEditTeacher}>
                <Text style={styles.submitButtonText}>Update Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Student Modal */}
      <Modal visible={showEditStudentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Student</Text>
              <TouchableOpacity onPress={() => setShowEditStudentModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Student Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.full_name}
                  onChangeText={text => setStudentForm({ ...studentForm, full_name: text })}
                  placeholder="Enter student's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Roll Number</Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.roll_number}
                  onChangeText={text => setStudentForm({ ...studentForm, roll_number: text })}
                  placeholder="e.g., CS001"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={studentForm.year}
                    onValueChange={value => setStudentForm({ ...studentForm, year: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Year 1" value="Year 1" />
                    <Picker.Item label="Year 2" value="Year 2" />
                    <Picker.Item label="Year 3" value="Year 3" />
                    <Picker.Item label="Year 4" value="Year 4" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Batch</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={studentForm.batch}
                    onValueChange={value => setStudentForm({ ...studentForm, batch: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                    <Picker.Item label="2027" value="2027" />
                    <Picker.Item label="2028" value="2028" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Attendance Percentage</Text>
                <TextInput
                  style={styles.input}
                  value={studentForm.attendance}
                  onChangeText={text => setStudentForm({ ...studentForm, attendance: text })}
                  placeholder="Enter attendance percentage"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditStudentModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, styles.studentSubmitButton]} onPress={handleEditStudent}>
                <Text style={styles.submitButtonText}>Update Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Lab Incharge Modal */}
      <Modal visible={showEditLabInchargeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Lab Incharge</Text>
              <TouchableOpacity onPress={() => setShowEditLabInchargeModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Incharge Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={labInchargeForm.incharge_name}
                  onChangeText={text => setLabInchargeForm({ ...labInchargeForm, incharge_name: text })}
                  placeholder="Enter incharge's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Lab</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={labInchargeForm.lab_id}
                    onValueChange={value => setLabInchargeForm({ ...labInchargeForm, lab_id: value })}
                    style={styles.picker}
                  >
                    {labs.map(lab => (
                      <Picker.Item
                        key={lab.id}
                        label={lab.lab_name}
                        value={lab.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Assigned Date</Text>
                <TextInput
                  style={styles.input}
                  value={labInchargeForm.assigned_date}
                  onChangeText={text => setLabInchargeForm({ ...labInchargeForm, assigned_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={labInchargeForm.status}
                    onValueChange={value => setLabInchargeForm({ ...labInchargeForm, status: value })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Inactive" value="inactive" />
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditLabInchargeModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, styles.labSubmitButton]} onPress={handleEditLabIncharge}>
                <Text style={styles.submitButtonText}>Update Lab Incharge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal visible={showBulkUploadModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bulk Upload</Text>
              <TouchableOpacity onPress={() => setShowBulkUploadModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Upload Type Tabs */}
              <View style={styles.bulkTabs}>
                <TouchableOpacity
                  style={[styles.bulkTab, bulkUploadType === 'teachers' && styles.activeBulkTab]}
                  onPress={() => setBulkUploadType('teachers')}
                >
                  <Text style={[styles.bulkTabText, bulkUploadType === 'teachers' && styles.activeBulkTabText]}>
                    Teachers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bulkTab, bulkUploadType === 'students' && styles.activeBulkTab]}
                  onPress={() => setBulkUploadType('students')}
                >
                  <Text style={[styles.bulkTabText, bulkUploadType === 'students' && styles.activeBulkTabText]}>
                    Students
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bulkTab, bulkUploadType === 'lab_incharges' && styles.activeBulkTab]}
                  onPress={() => setBulkUploadType('lab_incharges')}
                >
                  <Text style={[styles.bulkTabText, bulkUploadType === 'lab_incharges' && styles.activeBulkTabText]}>
                    Lab Incharges
                  </Text>
                </TouchableOpacity>
              </View>

              {bulkUploadType === 'teachers' && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Upload Teachers CSV File</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleBulkUpload}>
                      <Text style={styles.uploadButtonText}>Choose CSV File</Text>
                    </TouchableOpacity>
                    <Text style={styles.helperText}>
                      CSV format: Full Name, Qualification, Specialization, Joining Date (YYYY-MM-DD), Year
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => downloadSampleCSV('teachers')}>
                    <Text style={styles.sampleLink}>Download Sample Teachers CSV</Text>
                  </TouchableOpacity>
                </View>
              )}

              {bulkUploadType === 'students' && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Upload Students CSV File</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleBulkUpload}>
                      <Text style={styles.uploadButtonText}>Choose CSV File</Text>
                    </TouchableOpacity>
                    <Text style={styles.helperText}>
                      CSV format: Full Name, Roll Number, Year, Batch, Attendance (optional)
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => downloadSampleCSV('students')}>
                    <Text style={styles.sampleLink}>Download Sample Students CSV</Text>
                  </TouchableOpacity>
                </View>
              )}

              {bulkUploadType === 'lab_incharges' && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Upload Lab Incharges CSV File</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleBulkUpload}>
                      <Text style={styles.uploadButtonText}>Choose CSV File</Text>
                    </TouchableOpacity>
                    <Text style={styles.helperText}>
                      CSV format: Incharge Name, Lab ID, Assigned Date (YYYY-MM-DD), Status (active/inactive)
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => downloadSampleCSV('lab_incharges')}>
                    <Text style={styles.sampleLink}>Download Sample Lab Incharges CSV</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowBulkUploadModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    gap: 6,
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  addTeacherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    gap: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    gap: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addLabInchargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ea580c',
    borderRadius: 8,
    gap: 6,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessageText: {
    color: '#166534',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessageText: {
    color: '#991b1b',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  headerActions: {
    flex: 0.5,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cell: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
    justifyContent: 'center',
  },
  actionsCell: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 10,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
  },
  inactiveStatus: {
    backgroundColor: '#f3f4f6',
  },
  activeStatusText: {
    color: '#166534',
  },
  inactiveStatusText: {
    color: '#4b5563',
  },
  attendanceText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  attendanceHigh: {
    color: '#16a34a',
  },
  attendanceMedium: {
    color: '#ca8a04',
  },
  attendanceLow: {
    color: '#dc2626',
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paginationInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  paginationControls: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  pageButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  activePageButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activePageButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  studentSubmitButton: {
    backgroundColor: '#16a34a',
  },
  labSubmitButton: {
    backgroundColor: '#ea580c',
  },
  submitButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  bulkTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  bulkTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeBulkTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  bulkTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activeBulkTabText: {
    color: '#2563eb',
  },
  uploadButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  helperText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  sampleLink: {
    fontSize: 12,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});

export default UsersScreen;