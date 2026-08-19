import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required for creating a user."],
    trim: true,
    lowercase: true,
    match: [/^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Please enter a valid email address.'],
    unique: [true, "Email already exists."]
  },
  name: {
    type: String,
    required: [true, "Name is required for creating  an account"],
  },
  password: {
    type: String,
    required: [true, "Password is required for creating an account"],
    minLength: [6, "Password should contain more than 6 characters"],
    select: false
  }
}, { timestamps: true });



//Performs hashing of password before saving data o DB if password is modified of new user is created
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  };

  this.password = await bcrypt.hash(this.password, 10);
  return;
});



//Compare the password entered by the user with password stored in DB
userSchema.methods.comparePassword = async function (password) {
  bcrypt.compare(password, this.password);
};


const userModel = mongoose.model('User', userSchema);


//==================================================
export default userModel;