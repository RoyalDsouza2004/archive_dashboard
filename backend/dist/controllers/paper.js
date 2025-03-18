import { TryCatch } from "../middlewares/error.js";
import { getConnection } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
export const getPublication = TryCatch(async (req, res, next) => {
    const conn = await getConnection();
    const publications = await conn.query("select * from publication");
    conn.end();
    res.status(200).json({
        success: true,
        publications
    });
});
export const getEdition = TryCatch(async (req, res, next) => {
    const { publicationId } = req.query;
    if (!publicationId)
        return next(new ErrorHandler("Please provide Publication Id", 400));
    const conn = await getConnection();
    const editions = await conn.query(`SELECT e.Edition_Name, e.Edition_Id FROM edition e
            JOIN publication_edition pe ON e.Edition_Id = pe.Edition_Id
            WHERE pe.Publication_Id = ?;`, publicationId);
    conn.end();
    res.status(200).json({
        success: true,
        editions
    });
});
