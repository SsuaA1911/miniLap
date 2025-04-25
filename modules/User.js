import { Schema, model } from "mongoose";
//create schema

const UserSchema = new Schema({
  fullName: { type: String,require: true,unique:true,minlength:3,maxlength:30 },
  email: { type: String },
  password:{type:String, required: true, minlength: 6},
  createdOn: { type: Date, default: new Date().getTime() },
});
export const User = model("users", UserSchema)


