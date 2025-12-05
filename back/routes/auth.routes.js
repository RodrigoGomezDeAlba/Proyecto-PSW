const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Captcha para login
router.get('/captcha', authController.captcha);

// Registro de usuario
router.post('/register', authController.register);

// Inicio de sesión
router.post('/login', authController.login);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Datos del usuario autenticado
router.get('/me', authMiddleware, authController.me);

// Recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
