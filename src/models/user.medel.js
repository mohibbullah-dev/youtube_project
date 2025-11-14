import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { jwt } from "jsonwebtoken";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    avatar: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
      },
    },
    coverImage: {
      url: String,
      public_id: String,
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPassworCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.refresh_token_secret,
    { expiresIn: refresh_token_expired }
  );
};

userSchema.methods.generateSccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.access_token_secret,
    { expiresIn: process.env.access_token_expired }
  );
};

export const User = mongoose.model("User", userSchema);
