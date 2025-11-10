import mongoose from "mongoose";
import { Db_name } from "../constant.js";

const connectDb = async () => {
  try {
    // console.log(Db_name);
    // console.log(`${process.env.MONGODB_URL}/${Db_name}`);
    // const connectionInstance = await mongoose.connect(
    //   `${process.env.MONGODB_URL}/${Db_name}`,

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${Db_name}`
    );
    console.log(
      `MonodoDb connected !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`Database Connection Faild ${error}`);
    process.exit(1);
  }
};

export default connectDb;
