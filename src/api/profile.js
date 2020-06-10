import express from "express";
import aws from "aws-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
var upload = multer({ dest: "uploads/" });

const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

router.post("/", upload.single("file"), function (req, res, next) {
  console.log(req.file)
  if (req.file) {
    uploadFile(req.file.path); //add argument for filename
  }
});

const randomString = (size = 5) => {
  return crypto.randomBytes(size).toString("base64").slice(0, size);
};

const uploadFile = (fileName) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: process.env.BUCKETNAME,
    Key: randomString(), // insert random key name and not hardcode; use crypto to generate random strings; append to original filename; its in req.file
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
