const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};
const neonColors = ["#ff007f", "#00ffff", "#ffcc00", "#ff6600", "#9933ff", "#ff3333"];

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Explicitly serve index.html on root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("new-user", (username) => {
        if (!username) return;

        // Assign a random neon color
        const userColor = neonColors[Math.floor(Math.random() * neonColors.length)];
        users[socket.id] = { username, color: userColor };

        // Notify others
        io.emit("message", { user: "🔔 System", message: `${username} joined`, color: "#fff" });
    });

    socket.on("message", (data) => {
        if (!users[socket.id]) return;

        const { username, message } = data;
        io.emit("message", { user: username, message, color: users[socket.id].color });
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            io.emit("message", { user: "🔔 System", message: `${users[socket.id].username} left`, color: "#fff" });
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
