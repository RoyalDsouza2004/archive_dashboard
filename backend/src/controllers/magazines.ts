
import { TryCatch } from "../middlewares/error.js";
import { UploadRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, insertLog } from "../utils/features.js";
import { Request } from "express";
import fs from "fs"

export const addNewMagazines = TryCatch(async (req: Request<{}, {}, UploadRequestBody>, res, next) => {

      const { date, editionId, pages, publicationId } = req.body;
      const files = req.files as Express.Multer.File[]

      const folderPath = files[0].destination;

      if (!publicationId || !editionId || !date || !pages || !files.length) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log("Folder deleted successfully");

            return next(new ErrorHandler("All fields are required", 400));
      }

      const parsedPages = pages.map(page => {
            if (typeof page === "string") {
                  return JSON.parse(page.replace(/(\w+):/g, '"$1":'));
            }
            return pages;
      });

      const conn = await getConnection();

      const [subEditionId] = await conn.query(`SELECT Sub_Edition_Id 
            FROM sub_edition 
            WHERE Publication_Id = ? AND Edition_Id = ?;` , [publicationId, editionId])

      if(!subEditionId) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            return next(new ErrorHandler("SubEdition id is not found" , 400))
      }

      const insertPromises = files.map(async (file, index) => {

            const { pageFrom, pageTo } = parsedPages[index] || { pageFrom: 1, pageTo: 1 };

            await insertLog({
                  subEditionId: subEditionId.Sub_Edition_Id,
                  date: new Date(date),
                  pageNoFrom: pageFrom,
                  pageNoTo: pageTo,
                  filePath: file.path,
            });
      });

      await Promise.all(insertPromises);
      conn.end();

      return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            folderPath
      });


})