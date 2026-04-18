require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// ✅ IMPORTANT ROUTES
app.use("/books", require("./routes/books"));
app.use("/admin", require("./routes/admin"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.get("/test", (req, res) => {
    res.send("Working");
});