import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbpgr4mejUiJqZr-bqE3T16AB-pn9Zf6o",
    authDomain: "booksky-todolist.firebaseapp.com",
    projectId: "booksky-todolist",
    storageBucket: "booksky-todolist.firebasestorage.app",
    messagingSenderId: "507341951294",
    appId: "1:507341951294:web:f28f28570aba404535dc6f",
    measurementId: "G-W08DSKC6ZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const booksCollection = collection(db, "books");

// Ensure the default book exists in Firestore
async function ensureDefaultBook(defaultBook) {
    const querySnapshot = await getDocs(booksCollection);
    let defaultBookExists = false;

    querySnapshot.forEach((doc) => {
        const book = doc.data();
        if (book.title === defaultBook.title && book.author === defaultBook.author) {
            defaultBookExists = true;
        }
    });

    if (!defaultBookExists) {
        await addDoc(booksCollection, defaultBook);
    }
}

export { db, booksCollection, addDoc, getDocs, deleteDoc, doc, updateDoc, ensureDefaultBook };
