require("dotenv").config();

const express = require("express");
const config = require("./config/constants");
const app = express();
const bookRoutes = require("./routes/book.routes");
const reviewRoutes = require("./routes/review.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const errorMiddleware = require("./middlewares/error.middleware");
app.use(express.json());

app.use("/books", bookRoutes);
app.use("/reviews", reviewRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use(errorMiddleware.errorHandler);
app.listen(config.port, () => console.log("5000 portu yanıyor!"));
