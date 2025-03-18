import multer from "multer";
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, process.env.FOLDER_PATH);
    },
    filename(req, file, callback) {
        callback(null, file.originalname);
    }
});
export const singleUpload = multer({ storage }).array("pdf");
