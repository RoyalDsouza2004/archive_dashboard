import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, insertLog } from "../utils/features.js";
import fs from "fs";
import jwt from "jsonwebtoken";
export const addNewMagazines = TryCatch(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(new ErrorHandler("Login First", 403));
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const { publicationId, editionId } = req.query;
    const { date, pages } = req.body;
    const files = req.files;
    const folderPath = files[0].destination;
    if (!publicationId || !editionId || !date || !pages || !files.length) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log("Folder deleted successfully");
        return next(new ErrorHandler("All fields are required", 400));
    }
    const conn = await getConnection();
    let parsedPages;
    if (typeof pages === "string") {
        parsedPages = JSON.parse(pages);
    }
    else {
        parsedPages = pages;
    }
    const [subEditionId] = await conn.query(`SELECT Sub_Edition_Id 
     FROM sub_edition 
     WHERE Publication_Id = ? AND Edition_Id = ?;`, [publicationId, editionId]);
    if (!subEditionId) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        return next(new ErrorHandler("SubEdition id is not found", 400));
    }
    const skippedEntries = [];
    const insertPromises = files.map(async (file, index) => {
        const { pageNoFrom, pageNoTo } = parsedPages[index] || { pageNoFrom: 1, pageNoTo: 1 };
        const fullFilePath = file.path;
        const relativeFilePath = fullFilePath.replace(process.env.FOLDER_PATH, '\\Storage');
        await insertLog({
            subEditionId: subEditionId.Sub_Edition_Id,
            date,
            pageNoFrom,
            pageNoTo,
            filePath: relativeFilePath,
            id
        }, skippedEntries);
    });
    await Promise.all(insertPromises);
    conn.release();
    const totalFiles = files.length - skippedEntries.length;
    return res.status(200).json({
        success: true,
        message: totalFiles ? "Files uploaded successfully" : "Skipped Uploading Duplicate files",
        totalFiles,
        skippedEntries
    });
});
export const getPublication = TryCatch(async (req, res, next) => {
    const conn = await getConnection();
    const publications = await conn.query("select Publication_Id ,Publication_Name from publication where isNewsPaper = false");
    conn.release();
    res.status(200).json({
        success: true,
        publications
    });
});
