import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";
import { config } from "./src/config/config.js";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Connect to MongoDB
connectDB();

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
