import mongoose from "mongoose";



export async function connectToDB() {
  await mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connect to DB successfully !');
  }).catch((err) => {
    console.log("Error connecting to DB");

    //stops the server is DB Connection fails
    process.exit(1);
  });
};