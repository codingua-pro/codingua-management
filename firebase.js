// =============================================
// FIREBASE CONFIGURATION
// Replace with your Firebase project credentials
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 🔥 REPLACE THESE WITH YOUR FIREBASE PROJECT CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBM9c2KdsKEGvwpCsViBewVZrXR4uzws5w",
  authDomain: "codingua-management.firebaseapp.com",
  projectId: "codingua-management",
  storageBucket: "codingua-management.firebasestorage.app",
  messagingSenderId: "593437537473",
  appId: "1:593437537473:web:4c4b0062c0ee275104d040"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================================
// COLLECTION REFERENCES
// =============================================
const COLLECTIONS = {
  courses: "courses",
  students: "students",
  groups: "groups",
  sessions: "sessions",
  payments: "payments",
  studentGroups: "studentGroups"
};

// =============================================
// GENERIC CRUD OPERATIONS
// =============================================

// CREATE
async function addDocument(collectionName, data) {
  try {
    data.createdAt = Timestamp.now();
    data.updatedAt = Timestamp.now();
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

// READ ALL
async function getDocuments(collectionName, conditions = [], orderByField = null) {
  try {
    let q = collection(db, collectionName);
    if (conditions.length > 0 || orderByField) {
      const constraints = conditions.map(c => where(c.field, c.op, c.value));
      if (orderByField) constraints.push(orderBy(orderByField));
      q = query(q, ...constraints);
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

// READ ONE
async function getDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

// UPDATE
async function updateDocument(collectionName, id, data) {
  try {
    data.updatedAt = Timestamp.now();
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

// DELETE
async function deleteDocument(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// =============================================
// SPECIFIC HELPERS
// =============================================

async function getStudentsByGroup(groupId) {
  const links = await getDocuments(COLLECTIONS.studentGroups, [{ field: "groupId", op: "==", value: groupId }]);
  const studentIds = links.map(l => l.studentId);
  if (studentIds.length === 0) return [];
  const all = await getDocuments(COLLECTIONS.students);
  return all.filter(s => studentIds.includes(s.id));
}

async function getSessionsByGroup(groupId) {
  return getDocuments(COLLECTIONS.sessions, [{ field: "groupId", op: "==", value: groupId }]);
}

async function getPaymentsByStudent(studentId) {
  return getDocuments(COLLECTIONS.payments, [{ field: "studentId", op: "==", value: studentId }]);
}

async function getDashboardStats() {
  const [courses, students, groups, sessions, payments] = await Promise.all([
    getDocuments(COLLECTIONS.courses),
    getDocuments(COLLECTIONS.students),
    getDocuments(COLLECTIONS.groups),
    getDocuments(COLLECTIONS.sessions),
    getDocuments(COLLECTIONS.payments)
  ]);
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  return { courses: courses.length, students: students.length, groups: groups.length, sessions: sessions.length, totalRevenue, pendingPayments };
}

export {
  db, COLLECTIONS,
  addDocument, getDocuments, getDocument, updateDocument, deleteDocument,
  getStudentsByGroup, getSessionsByGroup, getPaymentsByStudent, getDashboardStats,
  Timestamp
};
