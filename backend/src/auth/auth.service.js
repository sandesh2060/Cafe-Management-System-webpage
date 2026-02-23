const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const { JWT_SECRET, JWT_EXPIRE } = require("../config/jwt");

class AuthService {
  /**
   * Register a new user
   */
  async register({
    username,
    email,
    password,
    role = "customer",
    phone,
    name,
  }) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }],
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create user (password will be hashed by pre-save hook)
      const user = await User.create({
        name: name || username,
        email,
        password,
        role,
        phoneNumber: phone,
        status: "active",
      });

      // Generate token
      const token = this.generateToken(user._id);

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      return {
        user: userObject,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    try {
      console.log("🔐 Login attempt for:", email);

      // Find user by email (populate restaurant for staff)
      const user = await User.findOne({ email })
        .select("+password")
        .populate("restaurant", "name address");

      if (!user) {
        console.log("❌ User not found");
        throw new Error("Invalid email or password");
      }

      console.log("✅ User found:", user.email);
      console.log("📋 User role:", user.role);
      console.log("📋 User status:", user.status);
      console.log("🔑 Password hash exists:", !!user.password);
      console.log("🔑 Password hash length:", user.password?.length);

      // Check if user status is active
      if (user.status !== "active") {
        console.log("❌ User status is not active:", user.status);
        throw new Error(
          `Account is ${user.status}. Please contact administrator.`,
        );
      }

      console.log("🔍 Comparing passwords...");
      console.log("Input password:", password);

      // Verify password using model method
      const isPasswordValid = await user.comparePassword(password);

      console.log("✅ Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Password comparison failed");
        throw new Error("Invalid email or password");
      }

      // Update last login - skip validation to avoid restaurant requirement
      await User.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } },
      );

      // Generate token
      const token = this.generateToken(user._id);

      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;

      console.log("✅ Login successful");

      return {
        user: userObject,
        token,
      };
    } catch (error) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  }
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "active") {
        throw new Error(`Account is ${user.status}`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select("+password");

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password using model method
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Update password (will be hashed by pre-save hook)
      user.password = newPassword;
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(oldToken) {
    try {
      const decoded = this.verifyToken(oldToken);
      const user = await this.getUserById(decoded.id);

      if (user.status !== "active") {
        throw new Error(`Account is ${user.status}`);
      }

      const newToken = this.generateToken(user._id);

      return {
        user,
        token: newToken,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
