import "dotenv/config";
import connectDB from "../db/index.js";
import { app } from "./app.js";
connectDB()
  .then(
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on : http://127.0.0.1:${process.env.PORT} `,);
    })
  )
  .catch((err) => console.log("Connection failed!!!", err));
