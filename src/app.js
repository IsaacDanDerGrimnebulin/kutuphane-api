require("dotenv").config();

const express = require("express");
const cors = require("cors");
const config = require("./config/constants");
const { corsOptions } = require("./config/cors");
const app = express();

const bookRoutes = require("./routes/book.routes");
const reviewRoutes = require("./routes/review.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const feedRoutes = require("./routes/feed.routes");
const likeRoutes = require("./routes/like.routes");
const authorRoutes = require("./routes/author.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
app.use(cors(corsOptions));
app.use(express.json());

app.use("/books", bookRoutes);
app.use("/reviews", reviewRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/feed", feedRoutes);
app.use("/like", likeRoutes);
app.use("/authors", authorRoutes);
app.use("/dashboard", dashboardRoutes);
app.use(errorMiddleware.routeNotFound);
app.use(errorMiddleware.errorHandler);
app.listen(config.port, () => console.log("5000 portu yanıyor!"));
