import express from "express";
import aws from "aws-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";
var upload = multer({ dest: "uploads/" });

const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

router.post("/", upload.single("file"), function (req, res, next) {
  if (req.file) {
    uploadFile(req.file.path);
  }
});

const uploadFile = (fileName) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: "uaalumni-practice",
    Key: "upload.jpg",
    Body: fileContent,
  };
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

export default router;
