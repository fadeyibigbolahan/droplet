const router = require("express").Router();
const Task = require("../models/Tasks");
const User = require("../models/User");
const mongoose = require("mongoose");

// Route to update user's completed tasks
router.post("/complete-task", async (req, res) => {
  try {
    const { email, taskId } = req.body;

    if (!email || !taskId) {
      return res
        .status(400)
        .json({ message: "Email and Task ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the task was already completed
    const taskExists = user.compeltedTasks.find(
      (t) => t.taskId.toString() === taskId
    );
    if (taskExists) {
      return res.status(400).json({ message: "Task already completed" });
    }

    // Add the completed task with lastRewardDate
    user.compeltedTasks.push({ taskId, lastRewardDate: new Date() });

    // Update the user's wallet balance with the reward
    user.walletBalance += task.reward;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Task marked as completed and reward added",
      completedTasks: user.compeltedTasks,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
