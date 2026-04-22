const router = require("express").Router();
const Book = require("../models/Book");
const Config = require("../models/Config");

// GET books
router.get("/", async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// ISSUE BOOK
router.post("/issue", async (req, res) => {
    const { bookId, issueDate, returnDate } = req.body;

    if (!bookId) return res.status(400).json({ msg: "Select a book" });

    let today = new Date();

    if (new Date(issueDate) < today) {
        return res.status(400).json({ msg: "Issue date invalid" });
    }

    let maxDate = new Date(issueDate);
    maxDate.setDate(maxDate.getDate() + 15);

    if (new Date(returnDate) > maxDate) {
        return res.status(400).json({ msg: "Return date exceeds limit" });
    }

    await Book.findByIdAndUpdate(bookId, {
        available: false,
        issueDate,
        returnDate
    });

    res.json({ msg: "Issued successfully" });
});

// RETURN BOOK + FINE
router.post("/return", async (req, res) => {
    try {
        const { bookId, paid } = req.body;

        let book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ msg: "Book not found" });
        }

        let today = new Date();
        let fine = 0;

        if (today > new Date(book.returnDate)) {

            let days = Math.ceil(
                (today - new Date(book.returnDate)) / (1000 * 60 * 60 * 24)
            );

            let config = await Config.findOne();
            let finePerDay = config ? config.finePerDay : 10;

            fine = days * finePerDay;
        }

        if (fine > 0 && !paid) {
            return res.status(400).json({ msg: "Fine must be paid" });
        }

        await Book.findByIdAndUpdate(bookId, {
            available: true,
            issueDate: null,
            returnDate: null
        });

        res.json({ msg: "Returned successfully", fine });

    } catch (err) {
        console.error("Return API error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;