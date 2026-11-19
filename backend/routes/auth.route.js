import express from "express";
import { login, register, getMe, resetRefreshToken, logout, logoutAll, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../middleware/validate.js";
import authenticate from "../middleware/authenticate.js";
import {
    forgotPasswordLimiter,
    loginLimiter,
    refreshLimiter,
    registerLimiter,
    resetPasswordLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", loginLimiter, validateLogin, login);
router.post("/register", registerLimiter, validateRegister, register);
router.get("/me", authenticate, getMe);
router.post("/refresh", refreshLimiter, resetRefreshToken);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAll);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

export default router;