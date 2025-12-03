const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../modelo/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-inseguro-cambia-esto';
const SALT_ROUNDS = 10;

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const exists = await UserModel.existsByEmail(email);
    if (exists) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await UserModel.createUser(name, email, passwordHash, 'user');

    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
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
  me,
};