import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { CustomRequest, Edition, Publication } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { getConnection, getPrefixSuffixPage, insertLog } from "../utils/features.js";

export const addNewMagazines = TryCatch(async (req: CustomRequest, res, next) => {

      const { date, editionId, pages, publicationId } = req.body;
      const files = req.files as Express.Multer.File[]
      const { publicationName, editionName } = req;

      if (!publicationId || !editionId || !date || !pages || !files.length) {
            return next(new ErrorHandler("All fields are required", 400));
      }
      
      const parsedPages = pages.map(page => {
            if (typeof page === "string") {
                  return JSON.parse(page.replace(/(\w+):/g, '"$1":'));
            }
            return pages;
      });


      if (!publicationName || !editionName) {
            return next(new ErrorHandler("Publication or Edition not found in request", 500));

      }
      const conn = await getConnection();

      const insertPromises = files.map(async (file, index) => {

            const { pageFrom, pageTo } = parsedPages[index] || { pageFrom: 1, pageTo: 1 };

            await insertLog({
                  subEditionId: null,
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
            files: files.map(i => i.originalname)

      });


})