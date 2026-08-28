//=== Local Module ===
import app from "./src/app.js";
import { connectToDB } from "./src/config/db.js";

//=======================================
connectToDB();

//=======================================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    "server is running at : http://localhost:" + PORT
  );
});