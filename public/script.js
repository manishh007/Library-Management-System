const API = "http://localhost:5000";

let selectedBook = null;

// ================== LOAD BOOKS ==================
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

    if (document.getElementById("books")) {
        document.getElementById("books").innerHTML = html;
    }
}

function selectBook(id) {
    selectedBook = id;
}

// ================== ISSUE (OLD FLOW) ==================
async function issueBook() {
    let issueDate = document.getElementById("issueDate").value;
    let returnDate = document.getElementById("returnDate").value;

    if (!selectedBook || !issueDate || !returnDate) {
        showToast("Fill all fields", "error");
        return;
    }

    let res = await fetch(API + "/books/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook, issueDate, returnDate })
    });

    let data = await res.json();
    showToast(data.msg, "success");

    loadBooks();
}

// ================== RETURN ==================
async function returnBook() {
    let paid = document.getElementById("paid").checked;

    let res = await fetch(API + "/books/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook, paid })
    });

    let data = await res.json();

    if (!res.ok) {
        showToast(data.msg, "error");
        return;
    }

    showToast(`Returned. Fine: ₹${data.fine}`, "success");

    loadBooks();
}

// ================== SEARCH ==================
async function searchBook() {
    let name = document.getElementById("bookName").value.toLowerCase();
    let author = document.getElementById("author").value;

    if (!name && !author) {
        showToast("Enter book name or select author", "error");
        return;
    }

    let res = await fetch(API + "/books");
    let books = await res.json();

    let filtered = books.filter(b =>
        (name ? b.title.toLowerCase().includes(name) : true) &&
        (author ? b.author === author : true)
    );

    if (filtered.length === 0) {
        document.getElementById("results").innerHTML = "<p>No books found</p>";
        return;
    }

    let html = "";

    filtered.forEach(b => {
        html += `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.serialNo || "-"}</td>
            <td class="${b.available ? 'available' : 'issued'}">
                ${b.available ? "Y" : "N"}
            </td>
            <td>
                ${b.available
                ? `<input type="radio" name="selectBook" value="${b._id}">`
                : `<span style="color:red;">Not Available</span>`
            }
            </td>
        </tr>`;
    });

    document.getElementById("results").innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Book Name</th>
                <th>Author</th>
                <th>Serial No</th>
                <th>Available</th>
                <th>Select</th>
            </tr>
        </thead>
        <tbody>${html}</tbody>
    </table>`;
}

// ================== AUTHORS ==================
async function loadAuthors() {
    try {
        let res = await fetch(API + "/books");
        let books = await res.json();

        let authors = [...new Set(books.map(b => b.author))];

        let dropdown = document.getElementById("author");
        if (!dropdown) return;

        dropdown.innerHTML = `<option value="">Select Author</option>`;

        authors.forEach(a => {
            dropdown.innerHTML += `<option value="${a}">${a}</option>`;
        });

    } catch (err) {
        console.error(err);
    }
}

async function filterAuthors() {
    let name = document.getElementById("bookName").value.toLowerCase();

    let res = await fetch(API + "/books");
    let books = await res.json();

    let filtered = books.filter(b =>
        b.title.toLowerCase().includes(name)
    );

    let dropdown = document.getElementById("author");

    dropdown.innerHTML = `<option value="">Select Author</option>`;

    filtered.forEach(b => {
        dropdown.innerHTML += `<option value="${b.author}">${b.author}</option>`;
    });
}

// ================== LOGIN ==================
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if (!username || !password) {
        showToast("Enter username and password", "error");
        return;
    }

    if (role === "admin") {
        if (username === "admin" && password === "admin123") {

            localStorage.setItem("role", "admin"); // ✅ ADD THIS

            window.location = "admin.html";
        } else {
            alert("Invalid admin credentials");
        }
    } else {
        if (username === "user" && password === "user123") {

            localStorage.setItem("role", "user"); // ✅ ADD THIS

            window.location = "dashboard.html";
        } else {
            alert("Invalid user credentials");
        }
    }
}

// ================== NAVIGATION ==================
function logout() {
    localStorage.removeItem("role"); // ✅ IMPORTANT
    window.location = "index.html";
}

function goTransactions() {
    window.location = "transactions.html";
}

function goHome() {
    let role = localStorage.getItem("role");

    if (role === "admin") {
        window.location = "admin.html";
    } else {
        window.location = "dashboard.html";
    }
}

function goAvailable() {
    window.location = "availability.html";
}

function goFine() {
    window.location = "payfine.html";
}

function goIssue() {
    window.location = "issue.html";
}

// ================== DROPDOWNS ==================
async function loadBookNames() {
    let res = await fetch(API + "/books");
    let books = await res.json();

    let datalist = document.getElementById("bookList");
    if (!datalist) return;

    datalist.innerHTML = "";

    books.forEach(b => {
        datalist.innerHTML += `<option value="${b.title}">`;
    });
}

// ================== RESET ==================
function resetSearch() {
    document.getElementById("bookName").value = "";
    document.getElementById("author").value = "";
    document.getElementById("results").innerHTML = "";
}

// ================== FORMS ==================
function handleLogin(e) {
    e.preventDefault();
    login();
}

function handleSearch(e) {
    e.preventDefault();
    searchBook();
}

// ================== CONFIRM FLOW ==================
function confirmBook() {
    let selected = document.querySelector('input[name="selectBook"]:checked');

    if (!selected) {
        showToast("Please select a book", "error");
        return;
    }

    localStorage.setItem("selectedBook", selected.value);
    window.location = "issue.html";
}

// ================== ISSUE PAGE ==================
async function loadIssuePage() {
    let bookId = localStorage.getItem("selectedBook");
    if (!bookId) return;

    let res = await fetch(API + "/books");
    let books = await res.json();

    let book = books.find(b => b._id === bookId);
    if (!book) return;

    document.getElementById("issueBookName").value = book.title;
    document.getElementById("issueAuthor").value = book.author;

    let today = new Date().toISOString().split("T")[0];
    document.getElementById("issueDate").value = today;

    let returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);
    document.getElementById("returnDate").value =
        returnDate.toISOString().split("T")[0];
}

async function submitIssue() {
    let bookId = localStorage.getItem("selectedBook");
    let issueDate = document.getElementById("issueDate").value;
    let returnDate = document.getElementById("returnDate").value;

    if (!bookId) {
        showToast("No book selected", "error");
        return;
    }

    if (!issueDate || !returnDate) {
        showToast("Please select dates", "error");
        return;
    }

    if (new Date(returnDate) <= new Date(issueDate)) {
        showToast("Return date must be after issue date", "error");
        return;
    }

    try {
        let res = await fetch(API + "/books/issue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId, issueDate, returnDate })
        });

        let data = await res.json();

        if (!res.ok) {
            showToast(data.msg || "Error issuing book", "error");
            return;
        }

        showToast("Book issued successfully", "success");

        setTimeout(() => {
            localStorage.removeItem("selectedBook");
            window.location = "transactions.html";
        }, 1500);

    } catch (err) {
        showToast("Server error", "error");
        console.error(err);
    }
}

// ================== ISSUE DROPDOWN ==================
async function loadIssueBooks() {
    let res = await fetch(API + "/books");
    let books = await res.json();

    let datalist = document.getElementById("issueBookList");
    if (!datalist) return;

    datalist.innerHTML = "";

    books.forEach(b => {
        datalist.innerHTML += `<option value="${b.title}">`;
    });
}

async function filterIssueAuthors() {
    let name = document.getElementById("issueBookName").value.toLowerCase();

    let res = await fetch(API + "/books");
    let books = await res.json();

    let filtered = books.filter(b =>
        b.title.toLowerCase().includes(name)
    );

    let dropdown = document.getElementById("issueAuthor");

    dropdown.innerHTML = `<option value="">Select Author</option>`;

    filtered.forEach(b => {
        dropdown.innerHTML += `<option value="${b.author}">${b.author}</option>`;
    });

    // ✅ AUTO SELECT AUTHOR (if exact match)
    let exactBook = books.find(b =>
        b.title.toLowerCase() === name
    );

    if (exactBook) {
        dropdown.value = exactBook.author;

        // ✅ AUTO SET DATES
        let today = new Date().toISOString().split("T")[0];
        document.getElementById("issueDate").value = today;

        let returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 15);
        document.getElementById("returnDate").value =
            returnDate.toISOString().split("T")[0];

        // ✅ store selected book automatically
        localStorage.setItem("selectedBook", exactBook._id);
    }
}

// ================== TOAST ==================
function showToast(message, type = "info") {
    let toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// ================== ON LOAD ==================
window.onload = () => {
    if (document.getElementById("author")) loadAuthors();
    if (document.getElementById("bookList")) loadBookNames();
    if (document.getElementById("books")) loadBooks();
    if (document.getElementById("issueBookName")) loadIssuePage();
    if (document.getElementById("issueBookList")) loadIssueBooks();
    if (document.getElementById("returnBookList")) loadReturnBooks();
    if (document.getElementById("pfBook")) loadPayFine();

};

async function loadReturnBooks() {
    let res = await fetch(API + "/books");
    let books = await res.json();

    // only issued books
    let issued = books.filter(b => !b.available);

    let datalist = document.getElementById("returnBookList");
    if (!datalist) return;

    datalist.innerHTML = "";

    issued.forEach(b => {
        datalist.innerHTML += `<option value="${b.title}">`;
    });
}

async function loadReturnDetails() {
    let name = document.getElementById("returnBookName").value.toLowerCase();

    let res = await fetch(API + "/books");
    let books = await res.json();

    let book = books.find(b =>
        b.title.toLowerCase() === name && !b.available
    );

    if (!book) return;

    // store selected
    localStorage.setItem("returnBook", book._id);

    // auto fill
    document.getElementById("returnAuthor").value = book.author;
    document.getElementById("issueDateReturn").value =
        new Date(book.issueDate).toISOString().split("T")[0];

    document.getElementById("returnDateReturn").value =
        new Date().toISOString().split("T")[0];

    // serial dropdown (single for now)
    let serial = document.getElementById("serialNo");
    serial.innerHTML = `<option value="${book.serialNo}">${book.serialNo}</option>`;
}

async function submitReturn() {
    let bookId = localStorage.getItem("returnBook");

    if (!bookId) {
        showToast("Select a book", "error");
        return;
    }

    // store for next page
    localStorage.setItem("payFineBook", bookId);

    // redirect (NO API CALL HERE)
    window.location = "payfine.html";
}

function goReturn() {
    window.location = "return.html";
}

async function loadPayFine() {
    let bookId = localStorage.getItem("payFineBook");
    if (!bookId) return;

    let res = await fetch(API + "/books");
    let books = await res.json();

    let book = books.find(b => b._id === bookId);
    if (!book) return;

    document.getElementById("pfBook").value = book.title;
    document.getElementById("pfAuthor").value = book.author;
    document.getElementById("pfSerial").value = book.serialNo;

    let issue = new Date(book.issueDate);
    let ret = new Date(book.returnDate);

    document.getElementById("pfIssueDate").value =
        issue.toISOString().split("T")[0];

    document.getElementById("pfReturnDate").value =
        ret.toISOString().split("T")[0];

    let today = new Date().toISOString().split("T")[0];
    document.getElementById("pfActualDate").value = today;

    calculateFine();
}

async function calculateFine() {
    let returnDate = document.getElementById("pfReturnDate").value;
    let actualDate = document.getElementById("pfActualDate").value;

    if (!returnDate || !actualDate) return;

    let returnD = new Date(returnDate);
    let actualD = new Date(actualDate);

    let fine = 0;

    if (actualD > returnD) {
        let days = Math.ceil((actualD - returnD) / (1000 * 60 * 60 * 24));

        try {
            let res = await fetch(API + "/admin/config");
            let config = await res.json();

            let finePerDay = config?.finePerDay || 10;

            fine = days * finePerDay;

        } catch (err) {
            console.error("Config fetch error", err);
            fine = days * 10;
        }
    }

    document.getElementById("pfFine").value = fine;
}

async function confirmFine() {
    let bookId = localStorage.getItem("payFineBook");
    let fine = Number(document.getElementById("pfFine").value);
    let paid = document.getElementById("pfPaid").checked;

    // RULES FROM EXCEL
    if (fine > 0 && !paid) {
        showToast("Please pay fine before proceeding", "error");
        return;
    }

    try {
        let res = await fetch(API + "/books/return", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bookId, paid })
        });

        let data = await res.json();

        if (!res.ok) {
            showToast(data.msg, "error");
            return;
        }

        showToast("Transaction completed", "success");

        setTimeout(() => {
            localStorage.removeItem("payFineBook");
            window.location = "transactions.html";
        }, 1500);

    } catch (err) {
        showToast("Server error", "error");
    }
}

function goReports() {
    window.location = "reports.html";
}

function openReport(type) {

    if (type === "books") {
        showToast("Showing Books Report", "info");
    }

    if (type === "overdue") {
        showToast("Showing Overdue Books", "info");
    }

    // you can expand later
}

function goChart() {
    window.location = "chart.html";
}

