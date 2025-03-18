import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import fs from "fs";
import path from "path";
import { NewNewspaperType } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, insertLog } from "../utils/features.js";

export const getNewNewspapers = TryCatch(async (req: Request<{}, {}, NewNewspaperType>, res, next) => {
      const { publicationId, date, editionId } = req.body;

      if (!editionId || !date || !publicationId) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const year = new Date(date).getFullYear()

      const conn = await getConnection()

      const publicationPromise = conn.query("select Publication_Name from publication where Publication_Id = ?", publicationId.toUpperCase())
      const editionPromise = conn.query(`SELECT e.Edition_Name FROM edition e 
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

export const addNewFiles = TryCatch(async (req: Request<{}, {}, NewNewspaperType>, res, next) => {
      const { publicationId, date, editionId } = req.body;

      if (!editionId || !date || !publicationId) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const year = new Date(date).getFullYear()

      const conn = await getConnection()

      const publicationPromise = conn.query("select  Publication_Name from publication where Publication_Id = ?", publicationId.toUpperCase())
      const editionPromise = conn.query(`SELECT e.Edition_Name FROM edition e 
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

      const getPrefixSuffixPage = (filename: string) => {
            const match = filename.match(/^([A-Za-z]+)\d{6}(\d{2})([A-Za-z]+)\.pdf$/);

            return match
                  ? {
                        prefix: match[1],
                        pageNo: parseInt(match[2], 10),
                        sufix: match[3],
                  }
                  : null;
      };



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


      const uploadPromises = subEditionResults.map(({ file, subEditionId, pageNo }) => {
            if (!subEditionId) return next(new ErrorHandler("Sub Edition id not found for this file", 400))

            const filePath = path.join(folderPath, file);
            const dateForDB = new Date(date);

            return insertLog({
                  subEditionId,
                  date: dateForDB,
                  pageNoFrom: pageNo,
                  pageNoTo: pageNo,
                  filePath
            });
      });

      await Promise.all(uploadPromises.filter(Boolean));

      return res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            files
      })
})


export const getPublication = TryCatch(async (req, res, next) => {

      const conn = await getConnection()

      const publications = await conn.query("select * from publication")
      conn.end()

      res.status(200).json({
            success: true,
            publications
      });

})

export const getEdition = TryCatch(async (req, res, next) => {

      const { publicationId } = req.query

      if(!publicationId) return next(new ErrorHandler("Please provide Publication Id" , 400))

      const conn = await getConnection()

      const editions = await conn.query(`SELECT e.Edition_Name, e.Edition_Id FROM edition e
            JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
            WHERE pe.Publication_Id = ?;` , publicationId)
      conn.end()

      res.status(200).json({
            success: true,
            editions
      });

})