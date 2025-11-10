import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ path: "./env" });

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on tho port of ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MONGODB CONNECTION FAILED", error);
  });
