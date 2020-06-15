import express from "express";
import aws from "aws-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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
    console.log(file)
      // generate the filename, + the crypto stuff  
      callback(null, file.originalname + '_' + Date.now())
  }
});

const upload = multer({ storage: storage });

let contentData = ""

router.post("/", upload.single("file"), function (req, res, next) {
  if (req.file) {
    contentData = req.file.mimetype
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
    ContentType: contentData,
    //random string is being appended to extension 
    //file name local does not match what is in console
  };
  S3.upload(params, async (err, data) => {
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
router.post("/multiple", upload.array("files", 12), function (req, res, next) {
  if (req.files) {
    for(var i = 0; i < req.files.length; i++) {
    uploadFile(req.files[i].path, req.files[i].originalname, (uploadJSONResponse) => {
      return res.status(201).json(uploadJSONResponse);
    });
  }
  }
});

export default router;
