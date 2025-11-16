import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIkEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

/////////////////////////
// Uploads an image file
/////////////////////////
const uploadImage = async (localImagePath) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    if (!localImagePath) return null;
    // Upload the image
    const result = await cloudinary.uploader.upload(localImagePath, options);
    console.log("cloudinary result: ", result);
    fs.unlinkSync(localImagePath);
    return result;
  } catch (error) {
    console.error(error);
    fs.unlinkSync(localImagePath);

    return null;
  }
};

export default uploadImage;
