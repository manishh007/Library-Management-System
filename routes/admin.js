const router = require("express").Router();
const Config = require("../models/Config");

// Get fine
router.get("/fine", async (req, res) => {
    let config = await Config.findOne();
    if (!config) config = await Config.create({});
    res.json(config);
});

// Update fine
router.post("/fine", async (req, res) => {
    let config = await Config.findOne();
    config.finePerDay = req.body.fine;
    await config.save();
    res.json({ message: "Fine updated" });
});

module.exports = router;