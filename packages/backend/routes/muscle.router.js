import { Router } from "express";
import { getAllMuscles } from "../controllers/muscle.controller.js";

const router = Router();
router.get("/", getAllMuscles);
export default router;
