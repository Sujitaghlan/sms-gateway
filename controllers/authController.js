
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Wallet, sequelize } = require("../models");

async function register(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 8) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create(
      {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      },
      { transaction }
    );

    await Wallet.create(
      {
        userId: user.id,
        balance: 100
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Login failed"
    });
  }
}

module.exports = { register, login };
