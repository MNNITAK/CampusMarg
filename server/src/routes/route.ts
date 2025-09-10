import { Router } from "express";
import { getPath } from "../api/pathApi";

const router = Router();
router.post("/getpath",getPath);

export default router;
