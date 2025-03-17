import { Request } from "express";
import { TryCatch } from "../middlewares/error";
import fs from "fs";
import path from "path";
import { NewNewspaperType } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { getConnection, insertLog } from "../utils/features";

export const getNewNewspapers = TryCatch(async (req: Request<{}, {}, NewNewspaperType>, res, next) => {
      const { unit, date , publication } = req.body;

      if (!unit || !date || !publication) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const year = new Date(date).getFullYear()

      const folderPath = path.join("C:/Users/HP/OneDrive/Desktop/internship/backend/Storage/Newspapers", String(year + 1),publication, unit, String(date));


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
      const { publication, unit ,  date } = req.body;

      if (!publication || !date || !unit) {
            return next(new ErrorHandler("Please enter all Fields", 404))
      }

      const conn = await getConnection()

      const[{Sub_Edition_Id}] = await conn.query("SELECT Sub_Edition_Id FROM sub_edition WHERE Sub_Edition_Name = ? " , publication)

      const year = new Date(date).getFullYear()

      const folderPath = path.join("C:/Users/HP/OneDrive/Desktop/internship/backend/Storage/Newspapers", String(year + 1), publication , unit, String(date));


      if (!fs.existsSync(folderPath)) {
            return next(new ErrorHandler(`"Folder not found" ${folderPath}`, 404))
      }

      const files = fs.readdirSync(folderPath).filter((file) => {
            return path.extname(file).toLowerCase() === ".pdf";
      });

      const uploadPromises = files.map((file) => {
            const filePath = path.join(folderPath, file);

            const dateForDB = new Date(date);
            const Page_No_From = 1; 
            const Page_No_To = 1; 

            return insertLog({Sub_Edition_Id, date:dateForDB, Page_No_From, Page_No_To, filePath});
      });

      await Promise.all(uploadPromises);

      return res.status(200).json({
            success:true,
            message:"Files uploaded successfully",
            files
      })
})