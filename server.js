const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔗 MongoDB Atlas connection
mongoose.connect("mongodb+srv://namkeendb:11223344@cluster0.nalycjh.mongodb.net/?appName=Cluster0")
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

// Routes
app.use("/books", require("./routes/books"));
app.use("/admin", require("./routes/admin"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});