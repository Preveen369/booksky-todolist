import { db, booksCollection, addDoc, getDocs, deleteDoc, doc, updateDoc, ensureDefaultBook } from "./firebase.js";

// Default book details
const defaultBook = {
    title: "Rich Dad Poor Dad",
    author: "Robert",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident perferendis nostrum magni dolores facere blanditiis omnis quo amet, eius repellendus ratione possimus odio voluptatibus. Ad officia eaque fuga. Quia, accusamus!",
    timestamp: new Date().toISOString()
};

// selecting popup-box, popup-overlay, button
var popupoverlay = document.querySelector(".popup-overlay");
var popupbox = document.querySelector(".popup-box");
var addpopupbutton = document.getElementById("add-popup-button");

addpopupbutton.addEventListener("click", function () {
    popupoverlay.style.display = "block";
    popupbox.style.display = "block";
});

// select cancel button
var cancelpopup = document.getElementById("cancel-popup");
cancelpopup.addEventListener("click", function (event) {
    event.preventDefault();
    popupoverlay.style.display = "none";
    popupbox.style.display = "none";
});

// select container, add-book, book-title-input, book-author-input, book-description-input
var container = document.querySelector(".container");
var addbook = document.getElementById("add-book");
var booktitleinput = document.getElementById("book-title-input");
var bookauthorinput = document.getElementById("book-author-input");
var bookdescriptioninput = document.getElementById("book-description-input");

// Fetch and display books on page load
async function fetchBooks() {
    // Clear the container to ensure it's empty initially
    container.innerHTML = "";

    await ensureDefaultBook(defaultBook); // Ensure the default book exists

    const querySnapshot = await getDocs(booksCollection);

    querySnapshot.forEach((doc) => {
        const book = doc.data();

        const div = document.createElement("div");
        div.setAttribute("class", "book-container");
        div.setAttribute("data-id", doc.id);
        div.innerHTML = `<h2>${book.title}</h2>
        <h5>${book.author}</h5>
        <p>${book.description}</p>
        <button onclick="deletebook(event)">Delete</button>
        <button onclick="editBook(event)">Edit</button>
        <button onclick="viewBook(event)">View</button>`;
        container.append(div);
    });
}
fetchBooks();

// Update addbook functionality to include validations
addbook.addEventListener("click", async function (event) {
    event.preventDefault();

    // Validation checks
    if (!booktitleinput.value.trim()) {
        alert("Please enter a book title.");
        return;
    }
    if (!bookauthorinput.value.trim()) {
        alert("Please enter a book author.");
        return;
    }
    if (!bookdescriptioninput.value.trim()) {
        alert("Please enter a book description.");
        return;
    }

    const book = {
        title: booktitleinput.value.trim(),
        author: bookauthorinput.value.trim(),
        description: bookdescriptioninput.value.trim(),
        timestamp: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(booksCollection, book);
        const div = document.createElement("div");
        div.setAttribute("class", "book-container");
        div.setAttribute("data-id", docRef.id);
        div.innerHTML = `<h2>${book.title}</h2>
        <h5>${book.author}</h5>
        <p>${book.description}</p>
        <button onclick="deletebook(event)">Delete</button>
        <button onclick="editBook(event)">Edit</button>
        <button onclick="viewBook(event)">View</button>`;
        container.append(div);

        // Clear input fields and close popup
        booktitleinput.value = "";
        bookauthorinput.value = "";
        bookdescriptioninput.value = "";
        popupoverlay.style.display = "none";
        popupbox.style.display = "none";
    } catch (error) {
        console.error("Error adding book:", error);
    }
});

// Update deletebook functionality to remove from Firestore
async function deletebook(event) {
    const bookContainer = event.target.parentElement;
    const bookId = bookContainer.getAttribute("data-id");

    if (!bookId) {
        console.error("Error: Missing or invalid data-id attribute.");
        return;
    }

    try {
        await deleteDoc(doc(db, "books", bookId));
        bookContainer.remove();
    } catch (error) {
        console.error("Error deleting book:", error);
    }
}

// Attach deletebook to the window object
window.deletebook = deletebook;

// Select edit popup elements
var editPopupOverlay = document.querySelector(".popup-overlay");
var editPopupBox = document.querySelector(".edit-popup-box");
var editBookTitleInput = document.getElementById("edit-book-title-input");
var editBookAuthorInput = document.getElementById("edit-book-author-input");
var editBookDescriptionInput = document.getElementById("edit-book-description-input");
var saveEditBookButton = document.getElementById("save-edit-book");
var cancelEditPopupButton = document.getElementById("cancel-edit-popup");

let currentEditingBookId = null;

// Open edit popup
async function editBook(event) {
    const bookContainer = event.target.parentElement;
    const bookId = bookContainer.getAttribute("data-id");

    if (!bookId) {
        console.error("Error: Missing or invalid data-id attribute.");
        return;
    }

    currentEditingBookId = bookId;

    try {
        const bookDoc = await getDocs(booksCollection);
        bookDoc.forEach((doc) => {
            if (doc.id === bookId) {
                const book = doc.data();
                editBookTitleInput.value = book.title;
                editBookAuthorInput.value = book.author;
                editBookDescriptionInput.value = book.description;
            }
        });

        editPopupOverlay.style.display = "block";
        editPopupBox.style.display = "block";
    } catch (error) {
        console.error("Error fetching book for editing:", error);
    }
}

// Save edited book details
saveEditBookButton.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!currentEditingBookId) {
        console.error("Error: No book selected for editing.");
        return;
    }

    const updatedBook = {
        title: editBookTitleInput.value,
        author: editBookAuthorInput.value,
        description: editBookDescriptionInput.value,
        timestamp: new Date().toISOString()
    };

    try {
        const bookDocRef = doc(db, "books", currentEditingBookId);
        await updateDoc(bookDocRef, updatedBook);

        // Update the book container in the DOM
        const bookContainer = document.querySelector(`[data-id="${currentEditingBookId}"]`);
        bookContainer.querySelector("h2").textContent = updatedBook.title;
        bookContainer.querySelector("h5").textContent = updatedBook.author;
        bookContainer.querySelector("p").textContent = updatedBook.description;

        editPopupOverlay.style.display = "none";
        editPopupBox.style.display = "none";
        currentEditingBookId = null;
    } catch (error) {
        console.error("Error updating book:", error);
    }
});

// Cancel edit popup
cancelEditPopupButton.addEventListener("click", function (event) {
    event.preventDefault();
    editPopupOverlay.style.display = "none";
    editPopupBox.style.display = "none";
    currentEditingBookId = null;
});

// Attach editBook to the window object
window.editBook = editBook;

// Select view popup elements
var viewPopupOverlay = document.querySelector(".popup-overlay");
var viewPopupBox = document.querySelector(".view-popup-box");
var viewBookTitle = document.getElementById("view-book-title");
var viewBookAuthor = document.getElementById("view-book-author");
var viewBookDescription = document.getElementById("view-book-description");
var closeViewPopupButton = document.getElementById("close-view-popup");

// Open view popup
async function viewBook(event) {
    const bookContainer = event.target.parentElement;
    const bookId = bookContainer.getAttribute("data-id");

    if (!bookId) {
        console.error("Error: Missing or invalid data-id attribute.");
        return;
    }

    try {
        const bookDoc = await getDocs(booksCollection);
        bookDoc.forEach((doc) => {
            if (doc.id === bookId) {
                const book = doc.data();
                viewBookTitle.textContent = book.title;
                viewBookAuthor.textContent = book.author;
                viewBookDescription.textContent = book.description;
            }
        });

        viewPopupOverlay.style.display = "block";
        viewPopupBox.style.display = "block";
    } catch (error) {
        console.error("Error fetching book for viewing:", error);
    }
}

// Close view popup
closeViewPopupButton.addEventListener("click", function () {
    viewPopupOverlay.style.display = "none";
    viewPopupBox.style.display = "none";
});

// Attach viewBook to the window object
window.viewBook = viewBook;
