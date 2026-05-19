import { Router } from "express"
import * as authController from "../controllers/auth-controller.js"

const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/login', authController.login)
authRouter.post('/verify', authController.verifyEmail)
authRouter.post('/forgetPassword', authController.forgotPassword)
authRouter.post('/resetPassword', authController.resetPassword)

export default authRouter

