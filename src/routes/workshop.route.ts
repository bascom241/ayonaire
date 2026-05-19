import express from "express"
import { restrictTo, authorize } from "../middlewares/auth.middleware.js";
import { create } from "../controllers/workshop.controller.js";


const router = express.Router();
router.post("/",authorize,restrictTo("admin","instructor"), create);


export default router