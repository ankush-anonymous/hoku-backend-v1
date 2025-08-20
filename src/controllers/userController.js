const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserActionsLogController = require("./userActivityController");

/**
 * @description Controller to handle user login, return a JWT, and log the action.
 */
const loginUser = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    const user = await userRepository.findUserByEmailForAuth(email_id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await UserActionsLogController.logAction({
        user_id: user.id,
        action_type: "LOGIN_ATTEMPT_FAILURE",
        source_feature: "Authentication",
        target_entity_type: "USER",
        target_entity_id: user.id,
        status: "FAILURE",
        metadata: { reason: "Invalid password", ip: req.ip },
      });
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid credentials." });
    }

    await UserActionsLogController.logAction({
      user_id: user.id,
      action_type: "LOGIN_SUCCESS",
      source_feature: "Authentication",
      target_entity_type: "USER",
      target_entity_id: user.id,
      status: "SUCCESS",
      metadata: { ip: req.ip },
    });

    // Updated payload to include more user context
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email_id,
      body_type: user.body_type,
      top_size: user.top_size,
      bottom_size: user.bottom_size
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_super_secret_key",
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          success: true,
          message: "Login successful!",
          token: "Bearer " + token,
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

/**
 * @description Controller to handle user creation and log the action.
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // The repository's createUser function now handles all new fields
    const newUser = await userRepository.createUser(userData);

    await UserActionsLogController.logAction({
      user_id: newUser.id,
      action_type: "CREATE_USER",
      source_feature: "UserManagement",
      target_entity_type: "USER",
      target_entity_id: newUser.id,
      status: "SUCCESS",
      metadata: { ip: req.ip },
    });

    delete newUser.password;
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({
          message: "User with this email or phone number already exists.",
        });
    }
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

/**
 * @description Handles user signup with just email and password.
 * A default name is generated from the email.
 */
const signupUser = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    // Automatically generate a name from the email address
    // e.g., "example@email.com" becomes "example"
    const name = email_id.split('@')[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare the user data object for the repository
    const userData = {
      name,
      email_id,
      password: hashedPassword,
    };

    const newUser = await userRepository.createUser(userData);

    // Log the successful signup action
    await UserActionsLogController.logAction({
      user_id: newUser.id,
      action_type: 'SIGNUP_USER',
      source_feature: 'Authentication',
      target_entity_type: 'USER',
      target_entity_id: newUser.id,
      status: 'SUCCESS',
      metadata: { ip: req.ip },
    });

    delete newUser.password; // Never send the password hash in the response
    res.status(201).json(newUser);
  } catch (error) {
    // Handle case where email is already registered (unique constraint violation)
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'User with this email already exists.',
      });
    }

    // General server error
    res.status(500).json({ message: 'Error signing up user', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await userRepository.updateUserById(id, updates);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found or nothing to update" });
    }

    await UserActionsLogController.logAction({
      user_id: id,
      action_type: "UPDATE_USER",
      source_feature: "UserManagement",
      target_entity_type: "USER",
      target_entity_id: id,
      status: "SUCCESS",
      metadata: { updatedFields: Object.keys(updates), ip: req.ip },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userRepository.deleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserActionsLogController.logAction({
      user_id: id,
      action_type: "SOFT_DELETE_USER",
      source_feature: "UserManagement",
      target_entity_type: "USER",
      target_entity_id: id,
      status: "SUCCESS",
      metadata: { ip: req.ip },
    });

    res
      .status(200)
      .json({
        message: "User soft-deleted successfully",
        userId: deletedUser.id,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const hardDeleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userRepository.hardDeleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserActionsLogController.logAction({
      user_id: id,
      action_type: "HARD_DELETE_USER",
      source_feature: "UserManagement",
      target_entity_type: "USER",
      target_entity_id: id,
      status: "SUCCESS",
      metadata: { ip: req.ip },
    });

    res
      .status(200)
      .json({ message: "User permanently deleted successfully", deletedUser });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error permanently deleting user",
        error: error.message,
      });
  }
};

module.exports = {
  createUser,
  loginUser,
  signupUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  hardDeleteUserById,
};
