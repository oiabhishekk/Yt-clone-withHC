import { ifError } from "assert";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadoncloudinary = async (localfile) => {
  if (!localfile) return null;
  let url;
  await cloudinary.uploader.upload(
    localfile,
    { resource_type: "auto" },
    function (error, result) {
      if (error) {
        console.log("Can't upload", error);
        fs.unlinkSync(localfile);
        return error;
      }
      console.log(result.url);
      url = result.url;
    }
  );
  return url;
};
