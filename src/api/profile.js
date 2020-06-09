import express from "express";
import aws from "aws-sdk";
import multerS3 from "multer-s3";
import multer from "multer";
import path from "path";

const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "uaalumni-practice",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: incorrect file type!");
  }
};
router.post("/", (req, res) => {
  fileUpload(req, res, (error) => {
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        const fileName = req.file.key;
        const fileLocation = req.file.location;
        res.json({
          file: fileName,
          location: fileLocation,
        });
      }
    }
  });
});

export default router;
