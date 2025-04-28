import { TryCatch } from "../middlewares/error.js";
import { UploadRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, insertLog } from "../utils/features.js";
import { Request } from "express";
import fs from "fs";

export const addNewMagazines = TryCatch(async (req: Request<{}, {}, UploadRequestBody>, res, next) => {
  const { publicationId, editionId } = req.query;
  const { date, pages } = req.body;
  const files = req.files as Express.Multer.File[];

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
  } else {
    parsedPages = pages;
  }

  const [subEditionId] = await conn.query(
    `SELECT Sub_Edition_Id 
     FROM sub_edition 
     WHERE Publication_Id = ? AND Edition_Id = ?;`, 
    [publicationId, editionId]
  );

  if (!subEditionId) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    return next(new ErrorHandler("SubEdition id is not found", 400));
  }

  const skippedEntries: string[] = [];

  const insertPromises = files.map(async (file, index) => {
    const { pageNoFrom, pageNoTo } = parsedPages[index] || { pageNoFrom: 1, pageNoTo: 1 };

    const fullFilePath = file.path;

    const relativeFilePath = fullFilePath.replace(process.env.FOLDER_PATH as string,'\\Storage');

    await insertLog({
      subEditionId: subEditionId.Sub_Edition_Id,
      date,
      pageNoFrom,
      pageNoTo,
      filePath: relativeFilePath,  
    }, skippedEntries);
  });

  await Promise.all(insertPromises);
  conn.end();

  const totalFiles = files.length - skippedEntries.length;

  return res.status(200).json({
    success: true,
    message: totalFiles ? "Files uploaded successfully" : "Skipped Uploading Duplicate files",
    totalFiles,
    skippedEntries
  });
});
