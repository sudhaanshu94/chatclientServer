const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};
const neonColors = ["#ff007f", "#00ffff", "#ffcc00", "#ff6600", "#9933ff", "#ff3333"];

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("new-user", (username) => {
        const userColor = neonColors[Object.keys(users).length % neonColors.length]; // Assign a neon color
        users[socket.id] = { username, color: userColor };
        
        io.emit("message", { user: "🔔 System", message: `${username} joined`, color: "#fff" });
    });

    socket.on("message", (data) => {
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

server.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`);
});
