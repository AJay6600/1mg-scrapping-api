import express from "express";
import scrapRoute from "./routers/scrap.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Routes
// app.use("/", (req, res) => res.json({ message: "welcome to api" }));

app.use("/", scrapRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
