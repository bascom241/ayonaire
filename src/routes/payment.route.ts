import express from "express"
import bodyParser from "body-parser"
const router = express.Router()

import { restrictTo,  authorize} from "../middlewares/auth.middleware.js"
import { pay, handlePayWebHook, paymentHistory} from "../controllers/payment.controller.js"
router.post("/initialize", authorize,pay );
router.post("/webhook", bodyParser.raw({ type: "application/json" }),handlePayWebHook);
router.get("/get-all-payments", authorize, restrictTo("admin"),paymentHistory )

export default router 