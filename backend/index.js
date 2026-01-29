require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require("./config/db");
const problemRoutes = require("./routes/problem.routes");
const quizRoutes = require("./routes/quiz.routes");
const profileRoutes = require("./routes/profile.routes"); 


const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();


connectDB();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

const getHinglishHint = (stderr) => {
  if (!stderr) return null;
  const err = stderr.toLowerCase();
  const lineMatch = stderr.match(/:(?:\s+)?(\d+)(?::\d+)?/);
  const lineNo = lineMatch ? `Line ${lineMatch[1]}` : "Somewhere in code";

  if (err.includes("expected ';'") || err.includes("expected ';' before")) return `Bhai, ${lineNo} pe semicolon (;) lagana bhul gaya kya? Line ke end mein check kar, locha hai! 😅`;
  if (err.includes("undeclared") || err.includes("not defined")) return `Ye kaun sa naya mehmaan hai? ${lineNo} pe jo variable use kiya hai, usko pehle declare toh kar le mere bhai! 🤔`;
  if (err.includes("expected '}'") || err.includes("expected '{'")) return `Bhai, bracket { } ka balance bigad gaya hai. ${lineNo} ke aas-paas check kar, koi akela reh gaya hai! 👐`;
  if (err.includes("format") && err.includes("expects argument")) return `Bhai, scanf mein '&' lagana bhul gaya kya? ${lineNo} pe check kar, variable ka address toh de! 📍`;
  if (err.includes("undefined reference to `main'") || err.includes("main' is not defined")) return "Arre bhai, 'main' function kidhar hai? Bina engine ke car kaise chalegi? 🏎️💨";
  if (err.includes("return") && err.includes("with no value")) return `Bhai, 'int main' hai toh 'return 0' kahan hai? ${lineNo} pe kuch toh return kar! 🤨`;
  if (err.includes("division by zero")) return `Zero se divide mat kar bhai, maths ka khoon ho jayega! ${lineNo} check kar! 💀`;
  if (err.includes("unused variable")) return `Bhai, variable bana ke chod diya? ${lineNo} wala variable rone lag jayega, use toh kar lo! 😢`;

  return `Bhai, ${lineNo} ke aas-paas kuch toh gadbad hai. Code ek baar firse dhyan se dekh le! 🧐`;
};

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ status: "success", user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.json({ status: "error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ status: "success", user: { name: user.name, email: user.email } });
    } else {
      res.json({ status: "error" });
    }
  } catch (error) {
    res.json({ status: "error" });
  }
});


app.post('/run', async (req, res) => {
  
  const { code, language, input } = req.body; 
  
  const langConfig = { 
    c: { version: "10.2.0" }, 
    python: { version: "3.10.0" }, 
    java: { version: "15.0.2" } 
  };

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: language.toLowerCase(),
      version: langConfig[language.toLowerCase()]?.version || "latest",
      files: [{ content: code }],
      stdin: input || ""  
    });

    const stderr = response.data.run.stderr;
    res.json({ 
      output: response.data.run.output, 
      stderr: stderr, 
      hint: stderr ? getHinglishHint(stderr) : null 
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.use("/api/problems", problemRoutes);
app.use("/api/quizzes", quizRoutes); 
app.use("/api/profile", profileRoutes); 

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Entry Point active on port ${PORT}`));