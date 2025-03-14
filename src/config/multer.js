const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const key = (req, file, cb) => {
  crypto.randomBytes(16, (err, hash) => {
    if (err) cb(err);

    const fileName = `${hash.toString('hex')}-${file.originalname}`;

    cb(null, fileName);
  });
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads", "avatars"),
  storage: multerS3({
    s3: new aws.S3(),
    bucket: 'histopolio',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png"];
    console.log(`FILE TYPE: ${file.mimetype}`);

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  },
};
