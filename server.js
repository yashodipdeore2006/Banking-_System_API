import dotenv from 'dotenv';

//=== Local Module ===
import app from "./src/app.js";
import { connectToDB } from './src/config/db.js';


//======================================
dotenv.config();
connectToDB();




//=======================================
const PORT = 3000;

app.listen(PORT, () => {
  console.log('server is running at : http://localhost:' + PORT);
});