"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewFiles = exports.getNewNewspapers = void 0;
const error_1 = require("../middlewares/error");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const features_1 = require("../utils/features");
exports.getNewNewspapers = (0, error_1.TryCatch)(async (req, res, next) => {
    const { unit, date, publication } = req.body;
    if (!unit || !date || !publication) {
        return next(new utility_class_1.default("Please enter all Fields", 404));
    }
    const year = new Date(date).getFullYear();
    const folderPath = path_1.default.join("C:/Users/HP/OneDrive/Desktop/internship/backend/Storage/Newspapers", String(year + 1), publication, unit, String(date));
    if (!fs_1.default.existsSync(folderPath)) {
        return next(new utility_class_1.default(`"Folder not found" ${folderPath}`, 404));
    }
    const files = fs_1.default.readdirSync(folderPath).filter((file) => {
        return path_1.default.extname(file).toLowerCase() === ".pdf";
    });
    res.status(200).json({
        success: true,
        folderPath,
        files
    });
});
exports.addNewFiles = (0, error_1.TryCatch)(async (req, res, next) => {
    const { publication, unit, date } = req.body;
    if (!publication || !date || !unit) {
        return next(new utility_class_1.default("Please enter all Fields", 404));
    }
    const conn = await (0, features_1.getConnection)();
    const [{ Sub_Edition_Id }] = await conn.query("SELECT Sub_Edition_Id FROM sub_edition WHERE Sub_Edition_Name = ? ", publication);
    const year = new Date(date).getFullYear();
    const folderPath = path_1.default.join("C:/Users/HP/OneDrive/Desktop/internship/backend/Storage/Newspapers", String(year + 1), publication, unit, String(date));
    if (!fs_1.default.existsSync(folderPath)) {
        return next(new utility_class_1.default(`"Folder not found" ${folderPath}`, 404));
    }
    const files = fs_1.default.readdirSync(folderPath).filter((file) => {
        return path_1.default.extname(file).toLowerCase() === ".pdf";
    });
    const uploadPromises = files.map((file) => {
        const filePath = path_1.default.join(folderPath, file);
        const dateForDB = new Date(date);
        const Page_No_From = 1;
        const Page_No_To = 1;
        return (0, features_1.insertLog)({ Sub_Edition_Id, date: dateForDB, Page_No_From, Page_No_To, filePath });
    });
    await Promise.all(uploadPromises);
    return res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        files
    });
});
