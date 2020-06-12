import express from "express";
import aws from "aws-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
// var upload = multer({ dest: "uploads/"});

const router = express.Router();

const S3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  signatureVersion: "v4",
});
const storage = multer.diskStorage({
  destination: function (request, file, callback) {
      callback(null, './uploads/');
  },
  filename: function (request, file, callback) {
      callback(null, file.originalname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });


router.post("/", upload.single("file"), function (req, res, next) {
  console.log(req.file.filename);
  if (req.file) {
    uploadFile(req.file.path, req.file.originalname, (uploadJSONResponse) => {
      return res.status(201).json(uploadJSONResponse);
    });
  }
});

const randomString = (size = 5) => {
  return crypto.randomBytes(size).toString("hex");
};

const uploadFile = (fileName, originalName, cb) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket: process.env.BUCKETNAME,
    Key: randomString().concat("_", originalName),
    Body: fileContent,
  };
  S3.upload(params, async (err, data) => {
    // console.log(data);
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
    const presignedUrl = await S3.getSignedUrlPromise("getObject", {
      Bucket: process.env.BUCKETNAME,
      Key: data.key,
      Expires: 60 * 60,
    });
    cb({
      localFilePath: fileName,
      remoteFilePath: presignedUrl,
    });
  });
};
//partially finished; on postmane changed to 'files' plural
router.post("/multiple", upload.array("files", 12), function (req, res, next) {
  // console.log(req)
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
});

// Display image in browser instead of downloading
export default router;
