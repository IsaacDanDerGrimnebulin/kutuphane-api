export const corsOptions = {
  origin: process.env.FRONTEND_URL, // Dynamically get the domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 200,
};
