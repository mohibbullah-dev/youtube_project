import multer from "multer";

// image start from here

const ImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image_tem");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const imageFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"));
};

const uploadImage = multer({
  storage: ImageStorage,
  fileFilter: imageFilter,
  limits: 5 * 1024 * 1024,
});
// image ends from here

// video statr here
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/video_tem");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "_" + uniqueSuffix);
  },
});

const videoFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/"))
    cb(null, true);
  else cb(new Error("Only video files and thumbnails allowed"));
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: 100 * 1024 * 1024,
});

// video ends here

export { uploadImage, uploadVideo };
