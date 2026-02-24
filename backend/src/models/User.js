import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "member"], 
      default: "member",
    },

    // 🎨 NEW: Store the avatar choice
    profilePic: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    }, 

    
    title: {
      type: String,
      default: "Agency Member",
    },
    skills: [{ type: String }],
    hourlyRate: {
      type: Number,
      default: 0, 
    },
    agency_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date },
  },
  { timestamps: true }
);

// 🔐 FIX: Removed 'next' argument. When using async, Mongoose handles the promise return automatically.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;