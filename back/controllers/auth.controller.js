const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../modelo/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-inseguro-cambia-esto';
const SALT_ROUNDS = 10;

// Control simple en memoria de intentos de login
// Estructura: { [email]: { count: number, blocked: boolean } }
const loginAttempts = {};
const MAX_LOGIN_ATTEMPTS = 3;

// Almacén simple en memoria para tokens de recuperación de contraseña
// Estructura: { [token]: { userId: number, expiresAt: number } }
const PASSWORD_RESET_TOKENS = {};
const RESET_TOKEN_EXPIRATION_MS = 60 * 60 * 1000; // 1 hora

function registerFailedAttempt(email) {
  const info = loginAttempts[email] || { count: 0, blocked: false };
  info.count += 1;
  if (info.count >= MAX_LOGIN_ATTEMPTS) {
    info.blocked = true;
  }
  loginAttempts[email] = info;
}

function resetLoginAttempts(email) {
  if (email && loginAttempts[email]) {
    delete loginAttempts[email];
  }
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const exists = await UserModel.existsByEmail(email);
    if (exists) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const hashContrasena = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const nuevoUsuario = await UserModel.createUser(nombre, email, hashContrasena, 'usuario');

    return res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const attemptsInfo = loginAttempts[email];
    if (attemptsInfo && attemptsInfo.blocked) {
      return res.status(403).json({ message: 'Cuenta bloqueada' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      registerFailedAttempt(email);
      return res.status(401).json({ message: 'Error en tus credenciales' });
    }

    const isValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValid) {
      registerFailedAttempt(email);
      const info = loginAttempts[email];
      if (info && info.blocked) {
        return res.status(403).json({ message: 'Cuenta bloqueada' });
      }
      return res.status(401).json({ message: 'Error en tus credenciales' });
    }

    // Login exitoso: limpiar intentos fallidos
    resetLoginAttempts(email);

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    const { contrasena: _, ...usuarioSinContrasena } = user;

    return res.json({
      token,
      usuario: usuarioSinContrasena,
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}

// POST /api/auth/logout
// Con JWT sin estado, el logout se maneja principalmente en el frontend
function logout(req, res) {
  return res.json({ message: 'Logout exitoso' });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es obligatorio' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      // En un sistema real se puede devolver un mensaje genérico para no filtrar emails
      return res.status(404).json({ message: 'No existe un usuario con ese email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + RESET_TOKEN_EXPIRATION_MS;

    PASSWORD_RESET_TOKENS[token] = { userId: user.id, expiresAt };

    // En un sistema real aquí se enviaría el token por correo electrónico
    return res.json({
      message: 'Se ha generado un enlace de recuperación de contraseña',
      // Para fines de proyecto se devuelve el token para que el front lo use directamente
      resetToken: token,
    });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    return res.status(500).json({ message: 'Error al iniciar el proceso de recuperación' });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });
    }

    const entry = PASSWORD_RESET_TOKENS[token];
    if (!entry) {
      return res.status(400).json({ message: 'Token de recuperación inválido' });
    }

    if (entry.expiresAt < Date.now()) {
      delete PASSWORD_RESET_TOKENS[token];
      return res.status(400).json({ message: 'Token de recuperación expirado' });
    }

    const user = await UserModel.findById(entry.userId);
    if (!user) {
      delete PASSWORD_RESET_TOKENS[token];
      return res.status(404).json({ message: 'Usuario no encontrado para este token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await UserModel.updatePassword(user.id, passwordHash);

    // Eliminar el token para que no pueda reutilizarse
    delete PASSWORD_RESET_TOKENS[token];

    // Limpiar intentos de login fallidos para este usuario
    resetLoginAttempts(user.email);

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    return res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
}

// GET /api/auth/me
function me(req, res) {
  // authMiddleware ya llenó req.user
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  return res.json(req.user);
}

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
