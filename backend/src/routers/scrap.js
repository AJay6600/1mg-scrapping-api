import { Router } from "express";
import getMediceanCategory from "../controllers/getMediceanCategory.js";

const router = Router();

/** get categories of the Medicean */
router.post("/getCategory", getMediceanCategory);

export default router;
