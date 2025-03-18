import multer from "multer";
import fs from 'fs';
import path from "path";
import { getConnection } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
const storage = multer.diskStorage({
    destination: async (req, file, callback) => {
        try {
            const { publicationId, editionId, date } = req.body;
            if (!publicationId || !editionId || !date) {
                return callback(new ErrorHandler("Publication ID, Edition ID, and Date are required", 400), "");
            }
            const conn = await getConnection();
            // Fetch publication name
            const publicationPromise = conn.query("select Publication_Name from publication where Publication_Id = ?", publicationId.toUpperCase());
            const editionPromise = conn.query(`SELECT e.Edition_Name FROM edition e 
                          JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
                          WHERE pe.Publication_Id = ? AND pe.Edition_Id = ?`, [publicationId.toUpperCase(), editionId.toUpperCase()]);
            conn.end();
            const [[publication], [edition]] = await Promise.all([publicationPromise, editionPromise]);
            conn.end();
            if (!publication || !edition) {
                return callback(new ErrorHandler("Publication or Edition not found", 400), "");
            }
            req.publicationName = publication.Publication_Name;
            req.editionName = edition.Edition_Name;
            const year = new Date(date).getFullYear();
            const uploadDir = path.join(process.env.FOLDER_PATH, "Magazines", String(year), publication.Publication_Name, edition.Edition_Name.toLowerCase(), String(date));
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            callback(null, uploadDir);
        }
        catch (error) {
            callback(error, "");
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
export const upload = multer({ storage }).array("files");
