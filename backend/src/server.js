import express from "express";
import scrapRoute from "./routers/scrap.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Routes
// app.use("/", (req, res) => res.json({ message: "welcome to api" }));

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api", scrapRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
