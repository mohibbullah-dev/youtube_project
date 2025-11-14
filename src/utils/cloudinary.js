import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  secure: true,
});

console.log("cloudinary.config: ", cloudinary.config());

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
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    fs.unlinkSync(localImagePath);

    return null;
  }
};

export default uploadImage;
