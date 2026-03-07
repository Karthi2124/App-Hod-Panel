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
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://lunular-vernia-inexcusably.ngrok-free.dev/hod-panel/api/users';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const UsersScreen = () => {
  // State for data
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [labIncharges, setLabIncharges] = useState([]);
  const [labs, setLabs] = useState([]);
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
      const response = await api.get('/get_users.php');
      
      if (response.data.status) {
        setTeachers(response.data.teachers || []);
        setStudents(response.data.students || []);
        setLabIncharges(response.data.lab_incharges || []);
        
        // Extract unique labs from lab incharges
        const uniqueLabs = [];
        const labMap = new Map();
        response.data.lab_incharges?.forEach(item => {
          if (!labMap.has(item.lab_id)) {
            labMap.set(item.lab_id, {
              id: item.lab_id,
              lab_name: item.lab_name,
              location: item.location || ''
            });
          }
        });
        setLabs(Array.from(labMap.values()));
        
        setErrorMessage('');
      } else {
        setErrorMessage('Failed to fetch data');
      }
    } catch (error) {
      setErrorMessage('Failed to fetch data. Please check your connection.');
      console.error('Error fetching data:', error);
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
      ...teachers.map(t => ({ 
        ...t, 
        user_type: 'teacher',
        display_name: t.full_name,
        email: t.email 
      })),
      ...students.map(s => ({ 
        ...s, 
        user_type: 'student',
        display_name: s.student_name,
        email: s.email 
      })),
      ...labIncharges.map(l => ({ 
        ...l, 
        user_type: 'lab-incharge',
        display_name: l.incharge_name,
        email: l.email 
      })),
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
      if (!teacherForm.full_name || !teacherForm.qualification || !teacherForm.specialization || !teacherForm.joining_date || !teacherForm.year) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const formData = new FormData();
      Object.keys(teacherForm).forEach(key => {
        if (teacherForm[key]) {
          formData.append(key, teacherForm[key]);
        }
      });
      formData.append('add_teacher', 'true');

      const response = await api.post('/add_teacher.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Teacher added successfully!');
        setShowAddTeacherModal(false);
        resetTeacherForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error adding teacher');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding teacher');
      console.error('Add teacher error:', error);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!studentForm.full_name || !studentForm.roll_number || !studentForm.year || !studentForm.batch) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const formData = new FormData();
      Object.keys(studentForm).forEach(key => {
        if (studentForm[key]) {
          formData.append(key, studentForm[key]);
        }
      });
      formData.append('add_student', 'true');

      const response = await api.post('/add_student.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Student added successfully!');
        setShowAddStudentModal(false);
        resetStudentForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error adding student');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding student');
      console.error('Add student error:', error);
    }
  };

  const handleAddLabIncharge = async () => {
    try {
      if (!labInchargeForm.incharge_name || !labInchargeForm.lab_id || !labInchargeForm.assigned_date) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const formData = new FormData();
      Object.keys(labInchargeForm).forEach(key => {
        if (labInchargeForm[key]) {
          formData.append(key, labInchargeForm[key]);
        }
      });
      formData.append('add_lab_incharge', 'true');

      const response = await api.post('/add_lab_incharge.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Lab Incharge added successfully!');
        setShowAddLabInchargeModal(false);
        resetLabInchargeForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error adding lab incharge');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error adding lab incharge');
      console.error('Add lab incharge error:', error);
    }
  };

  const handleDeleteUser = (type, id, name) => {
    Alert.alert(
      `Delete ${type}`,
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const formData = new FormData();
              formData.append('id', id);
              formData.append('type', type);
              formData.append('delete_user', 'true');

              const response = await api.post('/delete_user.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });

              if (response.data.status) {
                setSuccessMessage(`${type} deleted successfully!`);
                fetchData();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } else {
                setErrorMessage(response.data.message || `Error deleting ${type}`);
              }
            } catch (error) {
              setErrorMessage(`Error deleting ${type}`);
              console.error('Delete error:', error);
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
        if (teacherForm[key]) {
          formData.append(key, teacherForm[key]);
        }
      });
      formData.append('id', editingTeacher.id);
      formData.append('edit_teacher', 'true');

      const response = await api.post('/update_teacher.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Teacher updated successfully!');
        setShowEditTeacherModal(false);
        setEditingTeacher(null);
        resetTeacherForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error updating teacher');
      }
    } catch (error) {
      setErrorMessage('Error updating teacher');
      console.error('Edit teacher error:', error);
    }
  };

  const handleEditStudent = async () => {
    try {
      const formData = new FormData();
      Object.keys(studentForm).forEach(key => {
        if (studentForm[key]) {
          formData.append(key, studentForm[key]);
        }
      });
      formData.append('id', editingStudent.id);
      formData.append('edit_student', 'true');

      const response = await api.post('/update_student.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Student updated successfully!');
        setShowEditStudentModal(false);
        setEditingStudent(null);
        resetStudentForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error updating student');
      }
    } catch (error) {
      setErrorMessage('Error updating student');
      console.error('Edit student error:', error);
    }
  };

  const handleEditLabIncharge = async () => {
    try {
      const formData = new FormData();
      Object.keys(labInchargeForm).forEach(key => {
        if (labInchargeForm[key]) {
          formData.append(key, labInchargeForm[key]);
        }
      });
      formData.append('id', editingLabIncharge.id);
      formData.append('edit_lab_incharge', 'true');

      const response = await api.post('/update_lab_incharge.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage('Lab Incharge updated successfully!');
        setShowEditLabInchargeModal(false);
        setEditingLabIncharge(null);
        resetLabInchargeForm();
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error updating lab incharge');
      }
    } catch (error) {
      setErrorMessage('Error updating lab incharge');
      console.error('Edit lab incharge error:', error);
    }
  };

  const handleBulkUpload = async () => {
    try {
      const [file] = await pick({
        type: ['text/csv'],
      });

      const formData = new FormData();
      formData.append('csv_file', {
        uri: file.uri,
        type: 'text/csv',
        name: 'upload.csv',
      });
      formData.append('type', bulkUploadType);
      formData.append('bulk_upload', 'true');

      const response = await api.post('/bulk_upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        setSuccessMessage(response.data.message);
        setShowBulkUploadModal(false);
        fetchData();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.message || 'Error uploading file');
      }
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled
      } else {
        setErrorMessage('Error uploading file');
        console.error('Bulk upload error:', err);
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

    Alert.alert('Sample CSV', 'Copy the following format:\n\n' + content);
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

  // Helper function to get column width based on header
  const getColumnWidth = (header) => {
    const widths = {
      'Name': 200,
      'Teacher': 200,
      'Student': 200,
      'Lab Incharge': 200,
      'Role': 100,
      'Details': 150,
      'Qualification': 120,
      'Specialization': 150,
      'Joining Date': 100,
      'Year': 80,
      'Roll Number': 100,
      'Batch': 80,
      'Attendance %': 100,
      'Lab': 150,
      'Location': 120,
      'Assigned Date': 100,
      'Created At': 100,
      'Status': 80,
      'Actions': 100,
    };
    return widths[header] || 150;
  };

  // Helper function to render table header content
  const renderTableHeaderContent = () => {
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
          <Text 
            key={index} 
            style={[
              styles.headerText, 
              index === currentHeaders.length - 1 && styles.headerActionsText,
              { width: getColumnWidth(header) }
            ]}
          >
            {header}
          </Text>
        ))}
      </View>
    );
  };

  // Helper function to render table row content
  const renderTableRowContent = (item) => {
    switch (activeTab) {
      case 'teachers':
        return (
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: getColumnWidth('Teacher') }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={[styles.avatarText, { color: '#9333ea' }]}>
                    {item.full_name?.[0]?.toUpperCase() || 'T'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.full_name}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.cell, { width: getColumnWidth('Qualification') }]}>{item.qualification || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Specialization') }]}>{item.specialization || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Joining Date') }]}>{item.joining_date || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Year') }]}>Year {item.year || '-'}</Text>
            <View style={[styles.cell, { width: getColumnWidth('Status') }]}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell, { width: getColumnWidth('Actions') }]}>
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
                <Icon name="pen-to-square" size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser('teacher', item.id, item.full_name)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'students':
        return (
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: getColumnWidth('Student') }]}>
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
            <Text style={[styles.cell, { width: getColumnWidth('Roll Number') }]}>{item.roll_number || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Year') }]}>Year {item.year || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Batch') }]}>{item.batch || '-'}</Text>
            <View style={[styles.cell, { width: getColumnWidth('Attendance %') }]}>
              <Text
                style={[
                  styles.attendanceText,
                  parseInt(item.attendance) >= 75
                    ? styles.attendanceHigh
                    : parseInt(item.attendance) >= 60
                    ? styles.attendanceMedium
                    : styles.attendanceLow,
                ]}
              >
                {item.attendance || 0}%
              </Text>
            </View>
            <View style={[styles.cell, { width: getColumnWidth('Status') }]}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status === '1' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell, { width: getColumnWidth('Actions') }]}>
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
                <Icon name="pen-to-square" size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser('student', item.id, item.student_name)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'lab-incharges':
        return (
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: getColumnWidth('Lab Incharge') }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#ffedd5' }]}>
                  <Text style={[styles.avatarText, { color: '#ea580c' }]}>
                    {item.incharge_name?.[0]?.toUpperCase() || 'L'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.incharge_name}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.cell, { width: getColumnWidth('Lab') }]}>{item.lab_name || `Lab #${item.lab_id}`}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Location') }]}>{item.location || '-'}</Text>
            <Text style={[styles.cell, { width: getColumnWidth('Assigned Date') }]}>{item.assigned_date || '-'}</Text>
            <View style={[styles.cell, { width: getColumnWidth('Status') }]}>
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
            <Text style={[styles.cell, { width: getColumnWidth('Created At') }]}>{item.created_at?.split(' ')[0] || '-'}</Text>
            <View style={[styles.cell, styles.actionsCell, { width: getColumnWidth('Actions') }]}>
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
                <Icon name="pen-to-square" size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser('lab_incharge', item.id, item.incharge_name)}
                style={styles.actionButton}
              >
                <Icon name="trash-can" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        );

      default: // All Users
        return (
          <View style={styles.tableRow}>
            <View style={[styles.cell, { width: getColumnWidth('Name') }]}>
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
                    {item.display_name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{item.display_name}</Text>
                  <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.cell, { width: getColumnWidth('Role') }]}>
              {item.user_type === 'teacher'
                ? 'Teacher'
                : item.user_type === 'student'
                ? 'Student'
                : 'Lab Incharge'}
            </Text>
            <Text style={[styles.cell, { width: getColumnWidth('Details') }]}>
              {item.user_type === 'teacher'
                ? item.qualification
                : item.user_type === 'student'
                ? `Roll: ${item.roll_number}`
                : `Lab: ${item.lab_name}`}
            </Text>
            <View style={[styles.cell, { width: getColumnWidth('Status') }]}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={[styles.cell, styles.actionsCell, { width: getColumnWidth('Actions') }]}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="pen-to-square" size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="trash-can" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Users" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading users...</Text>
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
              <Icon name="upload" size={14} color="#374151" />
              <Text style={styles.bulkButtonText}>Bulk Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addTeacherButton} onPress={() => setShowAddTeacherModal(true)}>
              <Icon name="chalkboard-user" size={14} color="#fff" />
              <Text style={styles.addButtonText}>Add Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addStudentButton} onPress={() => setShowAddStudentModal(true)}>
              <Icon name="user-graduate" size={14} color="#fff" />
              <Text style={styles.addButtonText}>Add Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addLabInchargeButton} onPress={() => setShowAddLabInchargeModal(true)}>
              <Icon name="flask" size={14} color="#fff" />
              <Text style={styles.addButtonText}>Add Lab Incharge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {successMessage ? (
          <View style={styles.successMessage}>
            <Icon name="circle-check" size={16} color="#166534" />
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorMessage}>
            <Icon name="circle-exclamation" size={16} color="#991b1b" />
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {['All Users', 'Teachers', 'Students', 'Lab Incharges'].map((tab) => {
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
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
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
                  <Picker.Item label="Year 1" value="1" />
                  <Picker.Item label="Year 2" value="2" />
                  <Picker.Item label="Year 3" value="3" />
                  <Picker.Item label="Year 4" value="4" />
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
        </ScrollView> */}

        {/* Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              {renderTableHeaderContent()}

              {/* Table Rows */}
              <FlatList
                data={getCurrentRows()}
                renderItem={({ item }) => renderTableRowContent(item)}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="users-slash" size={40} color="#9ca3af" />
                    <Text style={styles.emptyText}>No users found</Text>
                  </View>
                }
              />
            </View>
          </ScrollView>

          {/* Pagination */}
          {getTotalPages() > 1 && (
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

                {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                  let pageNum = i + 1;
                  if (getTotalPages() > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > getTotalPages()) {
                      pageNum = getTotalPages() - 4 + i;
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={pageNum}
                      style={[styles.pageButton, currentPage === pageNum && styles.activePageButton]}
                      onPress={() => setCurrentPage(pageNum)}
                    >
                      <Text style={[styles.pageButtonText, currentPage === pageNum && styles.activePageButtonText]}>
                        {pageNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

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
          )}
        </View>
      </ScrollView>

      {/* Add Teacher Modal */}
      <Modal visible={showAddTeacherModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.full_name}
                  onChangeText={text => setTeacherForm({ ...teacherForm, full_name: text })}
                  placeholder="Enter teacher's full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Qualification <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={teacherForm.qualification}
                  onChangeText={text => setTeacherForm({ ...teacherForm, qualification: text })}
                  placeholder="e.g., B.E, M.Tech, Ph.D."
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
                    <Picker.Item label="Year 1" value="1" />
                    <Picker.Item label="Year 2" value="2" />
                    <Picker.Item label="Year 3" value="3" />
                    <Picker.Item label="Year 4" value="4" />
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
      <Modal visible={showAddStudentModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
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
                    <Picker.Item label="Year 1" value="1" />
                    <Picker.Item label="Year 2" value="2" />
                    <Picker.Item label="Year 3" value="3" />
                    <Picker.Item label="Year 4" value="4" />
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
      <Modal visible={showAddLabInchargeModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={labInchargeForm.incharge_name}
                  onChangeText={text => setLabInchargeForm({ ...labInchargeForm, incharge_name: text })}
                  placeholder="Enter incharge's full name"
                  placeholderTextColor="#9ca3af"
                />
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
                        label={`${lab.lab_name}`}
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
      <Modal visible={showEditTeacherModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name</Text>
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
                  placeholder="e.g., B.E, M.Tech, Ph.D."
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
                    <Picker.Item label="Year 1" value="1" />
                    <Picker.Item label="Year 2" value="2" />
                    <Picker.Item label="Year 3" value="3" />
                    <Picker.Item label="Year 4" value="4" />
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
      <Modal visible={showEditStudentModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name</Text>
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
                    <Picker.Item label="Year 1" value="1" />
                    <Picker.Item label="Year 2" value="2" />
                    <Picker.Item label="Year 3" value="3" />
                    <Picker.Item label="Year 4" value="4" />
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
      <Modal visible={showEditLabInchargeModal} transparent animationType="slide">
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
                <Text style={styles.label}>Full Name</Text>
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
      <Modal visible={showBulkUploadModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bulk Upload</Text>
              <TouchableOpacity onPress={() => setShowBulkUploadModal(false)}>
                <Icon name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Upload CSV File</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={handleBulkUpload}>
                  <Icon name="cloud-upload-alt" size={20} color="#374151" />
                  <Text style={styles.uploadButtonText}>Choose CSV File</Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  {bulkUploadType === 'teachers' && 'Format: Full Name, Qualification, Specialization, Joining Date (YYYY-MM-DD), Year'}
                  {bulkUploadType === 'students' && 'Format: Full Name, Roll Number, Year, Batch, Attendance'}
                  {bulkUploadType === 'lab_incharges' && 'Format: Incharge Name, Lab ID, Assigned Date (YYYY-MM-DD), Status'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => downloadSampleCSV(bulkUploadType)}>
                <Text style={styles.sampleLink}>Download Sample CSV</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowBulkUploadModal(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
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
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  headerActions: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    gap: 6,
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  addTeacherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    gap: 6,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#10b981',
    borderRadius: 8,
    gap: 6,
  },
  addLabInchargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f97316',
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successMessageText: {
    flex: 1,
    color: '#166534',
    fontSize: 14,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorMessageText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 14,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
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
    minWidth: 140,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
  },
headerActionsText: {
  textAlign: 'right',
},
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  cell: {
    fontSize: 13,
    color: '#1f2937',
    paddingHorizontal: 8,
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 8,
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
    fontWeight: '600',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 11,
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
    fontSize: 11,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  attendanceHigh: {
    color: '#10b981',
  },
  attendanceMedium: {
    color: '#f59e0b',
  },
  attendanceLow: {
    color: '#ef4444',
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
    minWidth: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
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
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6',
  },
  pageButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activePageButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  studentSubmitButton: {
    backgroundColor: '#10b981',
  },
  labSubmitButton: {
    backgroundColor: '#f97316',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bulkTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
    gap: 4,
  },
  bulkTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeBulkTab: {
    borderBottomColor: '#3b82f6',
  },
  bulkTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeBulkTabText: {
    color: '#3b82f6',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  sampleLink: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default UsersScreen;