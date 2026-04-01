const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname)); // This serves your HTML/CSS/JS to the browser

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});