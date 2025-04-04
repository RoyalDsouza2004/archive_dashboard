import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import fs from "fs";
import path from "path";
import { Edition, UploadRequestBody, Publication } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, getPrefixSuffixPage, insertLog } from "../utils/features.js";

export const getNewNewspapers = TryCatch(async (req: Request<{}, {}, UploadRequestBody>, res, next) => {
      const { publicationId, editionId } = req.query as {
            editionId?: string;
            publicationId?: string;
      };
      const { date } = req.body;

      if (!editionId || !date || !publicationId) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const year = new Date(date).getFullYear()

      const conn = await getConnection()

      const publicationPromise: Promise<Publication[]> = conn.query("select Publication_Name from publication where Publication_Id = ?", publicationId.toUpperCase())
      const editionPromise: Promise<Edition[]> = conn.query(`SELECT e.Edition_Name FROM edition e 
            JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
            WHERE pe.Publication_Id = ? AND pe.Edition_Id = ?` , [publicationId.toUpperCase(), editionId.toUpperCase()])
      conn.end();

      const [[publication], [edition]] = await Promise.all([publicationPromise, editionPromise])


      const folderPath = path.join(process.env.FOLDER_PATH!, String(year), publication.Publication_Name, edition.Edition_Name.toLowerCase(), String(date));


      if (!fs.existsSync(folderPath)) {
            return next(new ErrorHandler(`"Folder not found" ${folderPath}`, 404))
      }

      const files = fs.readdirSync(folderPath).filter((file) => {
            return path.extname(file).toLowerCase() === ".pdf";
      });


      res.status(200).json({
            success: true,
            folderPath,
            files
      });

})

export const addNewNewsPapers = TryCatch(async (req: Request<{}, {}, UploadRequestBody>, res, next) => {
      const { publicationId, editionId } = req.query as {
            editionId?: string;
            publicationId?: string;
      };
      
      const { date } = req.body;

      if (!editionId || !date || !publicationId) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const year = new Date(date).getFullYear()

      const conn = await getConnection()

      const publicationPromise: Promise<Publication[]> = conn.query("select Publication_Name from publication where Publication_Id = ?", publicationId.toUpperCase())
      const editionPromise: Promise<Edition[]> = conn.query(`SELECT e.Edition_Name FROM edition e 
            JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
            WHERE pe.Publication_Id = ? AND pe.Edition_Id = ?` , [publicationId.toUpperCase(), editionId.toUpperCase()])

      const [[publication], [edition]] = await Promise.all([publicationPromise, editionPromise])


      const folderPath = path.join(process.env.FOLDER_PATH!, String(year), publication.Publication_Name, edition.Edition_Name.toLowerCase(), String(date));


      if (!fs.existsSync(folderPath)) {
            return next(new ErrorHandler(`"Folder not found" ${folderPath}`, 404))
      }

      const files = fs.readdirSync(folderPath).filter((file) => {
            return path.extname(file).toLowerCase() === ".pdf";
      });


      const subEditionPromises = files.map(async (file) => {
            const details = getPrefixSuffixPage(file);
            if (!details) return { file, subEditionId: null, pageNo: 1 };

            const { prefix, sufix, pageNo } = details;

            const [result] = await conn.query(
                  `SELECT Sub_Edition_Id 
                 FROM pdf_naming 
                 WHERE Prefix = ? 
                 AND Sufix = ?`,
                  [prefix.toUpperCase(), sufix.toUpperCase()]
            );


            return { file, subEditionId: result.Sub_Edition_Id, pageNo };
      });

      const subEditionResults = await Promise.all(subEditionPromises);
      conn.end();

      const skippedEntries: string[] = [];
      const uploadPromises = subEditionResults.map(({ file, subEditionId, pageNo }) => {
            if (!subEditionId) return next(new ErrorHandler("Sub Edition id not found for this file", 400))

            const filePath = path.join(folderPath, file);

            return insertLog({
                  subEditionId,
                  date,
                  pageNoFrom: pageNo,
                  pageNoTo: pageNo,
                  filePath
            }, skippedEntries);
      });

      await Promise.all(uploadPromises.filter(Boolean));

      const totalFiles = files.length - skippedEntries.length

      return res.status(200).json({
            success: true,
            message: totalFiles ? "Files uploaded successfully" : "Skipped Uploading Duplicate files",
            totalFiles,
            skippedEntries
      })
})


