const API = "http://localhost:5000";

let selectedBook = null;

// LOAD BOOKS
async function loadBooks() {
    let res = await fetch(API + "/books");
    let books = await res.json();

    let html = "";

    books.forEach(b => {
        html += `
    <div class="card">
      <input type="radio" name="book" onchange="selectBook('${b._id}')">
      <h3>${b.title}</h3>
      <p>${b.author}</p>
      <p>${b.available ? "Available" : "Issued"}</p>
    </div>`;
    });

    document.getElementById("books").innerHTML = html;
}

function selectBook(id) {
    selectedBook = id;
}

// ISSUE
async function issueBook() {
    let issueDate = document.getElementById("issueDate").value;
    let returnDate = document.getElementById("returnDate").value;

    if (!selectedBook || !issueDate || !returnDate) {
        alert("Fill all fields");
        return;
    }

    let res = await fetch(API + "/books/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook, issueDate, returnDate })
    });

    let data = await res.json();
    alert(data.msg);
    loadBooks();
}

// RETURN
async function returnBook() {
    let paid = document.getElementById("paid").checked;

    let res = await fetch(API + "/books/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook, paid })
    });

    let data = await res.json();
    alert(data.msg + " Fine: ₹" + data.fine);
    loadBooks();
}

if (document.getElementById("books")) {
    loadBooks();
}
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    // SIMPLE AUTH (for demo)
    if (role === "admin") {
        if (username === "admin" && password === "admin123") {
            window.location = "admin.html";
        } else {
            alert("Invalid admin credentials");
        }
    } else {
        if (username === "user" && password === "user123") {
            window.location = "dashboard.html";
        } else {
            alert("Invalid user credentials");
        }
    }
}

function logout() {
    window.location = "index.html";
}

function goBack() {
    window.history.back();
}
function goTransactions() {
    window.location = "transactions.html";
}

function goHome() {
    window.location = "dashboard.html";
}

// Navigation placeholders (you will connect later)
function goAvailable() {
    alert("Go to Book Available Page");
}

function goIssue() {
    alert("Go to Issue Book Page");
}

function goReturn() {
    alert("Go to Return Book Page");
}

function goFine() {
    alert("Go to Fine Payment Page");
}