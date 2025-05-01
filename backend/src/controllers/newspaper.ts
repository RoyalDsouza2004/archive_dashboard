import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import fs from "fs";
import path from "path";
import { Edition, Publication } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, getPrefixSuffixPage, insertLog } from "../utils/features.js";
import jwt from "jsonwebtoken"

export const getNewNewspapers = TryCatch(async (req: Request, res, next) => {
  const { publicationId, editionId, date } = req.query as {
    editionId?: string;
    publicationId?: string;
    date?: string;
  };

  if (!editionId || !date || !publicationId) {
    return next(new ErrorHandler("Please enter all Fields", 404));
  }

  const year = new Date(date).getFullYear();

  const conn = await getConnection();

  const publicationPromise: Promise<Publication[]> = conn.query(
    "SELECT Publication_Name FROM publication WHERE Publication_Id = ?",
    publicationId.toUpperCase()
  );
  const editionPromise: Promise<Edition[]> = conn.query(
    `SELECT e.Edition_Name FROM edition e
         JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
         WHERE pe.Publication_Id = ? AND pe.Edition_Id = ?`,
    [publicationId.toUpperCase(), editionId.toUpperCase()]
  );

  const [[publication], [edition]] = await Promise.all([publicationPromise, editionPromise]);

  const folderPath = path.join(
    process.env.FOLDER_PATH!,
    String(year),
    publication.Publication_Name,
    edition.Edition_Name.toLowerCase(),
    String(date)
  );

  if (!fs.existsSync(folderPath)) {
    return next(new ErrorHandler(`Folder not found: ${folderPath}`, 404));
  }

  const files = fs.readdirSync(folderPath).filter((file) => {
    return path.extname(file).toLowerCase() === ".pdf";
  });

  // Check if the files are already present in the database
  const checkFilesPromises = files.map(async (file) => {
    const details = getPrefixSuffixPage(file);
    if (!details) return { file, isInDb: false };


    try {
      const fileName = file.split('/').pop(); 

      const [result] = await conn.query(
        `SELECT COUNT(*) AS count FROM log
        WHERE path LIKE ?`,
        [`%${fileName}%`] 
      );

      const count = Number(result.count);  
  
      // Print the result to debug
      console.log(`Query result for file ${file}:`, count);
  
      if (count === 0) {
        return { file, isInDb: false };
      }
  
      return { file, isInDb: count > 0 };
    } catch (error) {
      console.error(`Error checking file ${file}:`, error);
      return { file, isInDb: false };
    }
  });

  const filesStatus = await Promise.all(checkFilesPromises);

  conn.end();

  res.status(200).json({
    success: true,
    folderPath,
    files: filesStatus,
  });
});



export const addNewNewsPapers = TryCatch(async (req: Request, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("Login First", 403));
  }

  const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

  const { publicationId, editionId, date } = req.query as {
    editionId?: string;
    publicationId?: string;
    date?: Date;
  };

  if (!editionId || !date || !publicationId) {
    return next(new ErrorHandler("Please enter all Fields", 404));
  }

  const year = new Date(date).getFullYear();

  const conn = await getConnection();

  const publicationPromise: Promise<Publication[]> = conn.query(
    "SELECT Publication_Name FROM publication WHERE Publication_Id = ?",
    publicationId.toUpperCase()
  );
  const editionPromise: Promise<Edition[]> = conn.query(
    `SELECT e.Edition_Name FROM edition e
         JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
         WHERE pe.Publication_Id = ? AND pe.Edition_Id = ?`,
    [publicationId.toUpperCase(), editionId.toUpperCase()]
  );

  const [[publication], [edition]] = await Promise.all([publicationPromise, editionPromise]);

  const folderPath = path.join(
    process.env.FOLDER_PATH!,
    String(year),
    publication.Publication_Name,
    edition.Edition_Name.toLowerCase(),
    String(date)
  );

  if (!fs.existsSync(folderPath)) {
    return next(new ErrorHandler(`Folder not found: ${folderPath}`, 404));
  }

  const files = fs.readdirSync(folderPath).filter((file) => {
    return path.extname(file).toLowerCase() === ".pdf";
  });

  const skippedEntries: string[] = [];
  const invalidFormatFiles: string[] = [];

  const subEditionPromises = files.map(async (file) => {
    const details = getPrefixSuffixPage(file);
    if (!details) {
      invalidFormatFiles.push(file);
      return null; 
    }

    const { prefix, sufix, pageNo } = details;

    const [result] = await conn.query(
      `SELECT Sub_Edition_Id FROM pdf_naming WHERE Prefix = ? AND Sufix = ?`,
      [prefix.toUpperCase(), sufix.toUpperCase()]
    );

    const subEditionId = result?.Sub_Edition_Id;
    if (!subEditionId) {
      invalidFormatFiles.push(file);
      return null;
    }

    return { file, subEditionId, pageNo };
  });

  const subEditionResults = (await Promise.all(subEditionPromises)).filter(Boolean) as {
    file: string;
    subEditionId: string;
    pageNo: number;
  }[];

  conn.end();

  const uploadPromises = subEditionResults.map(({ file, subEditionId, pageNo }) => {
    const filePath = path.join(folderPath, file);
    const relativeFilePath = filePath.replace(process.env.FOLDER_PATH as string, '\\Storage').replace(/\\/g, "/");

    return insertLog({
      subEditionId,
      date,
      pageNoFrom: pageNo,
      pageNoTo: pageNo,
      filePath:relativeFilePath,
      id,
    }, skippedEntries);
  });

  await Promise.all(uploadPromises);

  const totalFiles = subEditionResults.length - skippedEntries.length;

  res.status(200).json({
    success: true,
    message: totalFiles ? "Files uploaded successfully" : "Skipped Uploading Duplicate files",
    totalFiles,
    skippedEntries,
    invalidFormatFiles
  });
});



export const getPublication = TryCatch(async (req, res, next) => {

  const conn = await getConnection()

  const publications: Publication[] = await conn.query("select Publication_Id ,Publication_Name from publication where isNewsPaper = true")
  conn.end()

  res.status(200).json({
    success: true,
    publications
  });

})