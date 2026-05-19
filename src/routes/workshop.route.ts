import express from "express"
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { create, get } from "../controllers/workshop.controller.js";


const router = express.Router();
router.post("/",authorize,restrictTo("admin","instructor"), create);
router.get("/", get);

export default router