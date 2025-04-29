import mariadb from 'mariadb';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
dotenv.config();
const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '3307'),
    connectionLimit: 5,
};
const pool = mariadb.createPool(poolConfig);
export const getConnection = async () => {
    return await pool.getConnection()
        .then((conn) => {
        console.log(`Connected to MariaDB http://${poolConfig.host}:${poolConfig.port}`);
        return conn;
    })
        .catch((err) => {
        console.error('Failed to connect to MariaDB:', err);
        throw err;
    });
};
export const insertLog = async ({ subEditionId, date, pageNoFrom, pageNoTo, filePath }, skippedEntries) => {
    let conn;
    try {
        conn = await getConnection();
        const [existing] = await conn.query(`SELECT COUNT(*) AS count FROM log 
               WHERE Sub_Edition_Id = ? AND Date = ? AND Page_No_From = ? AND Page_No_To = ?`, [subEditionId, date, pageNoFrom, pageNoTo]);
        if (existing.count > 0) {
            const skipMessage = `Skipping duplicate entry for Sub_Edition_Id: ${subEditionId}, Page_No: ${pageNoFrom}-${pageNoTo}`;
            skippedEntries.push(skipMessage);
            return;
        }
        const query = `
          INSERT INTO log (Sub_Edition_Id, Date, Page_No_From, Page_No_To, path)
          VALUES (?, ?, ?, ?, ?);`;
        await conn.query(query, [subEditionId, date, pageNoFrom, pageNoTo, filePath]);
    }
    catch (err) {
        console.error(`Error inserting ${filePath}:`, err);
        throw err;
    }
    finally {
        if (conn)
            conn.release();
    }
};
export const getPrefixSuffixPage = (filename) => {
    const match = filename.match(/^([A-Za-z]+)\d{6}(\d{2})([A-Za-z]+)\.pdf$/);
    return match
        ? {
            prefix: match[1],
            pageNo: parseInt(match[2], 10),
            sufix: match[3],
        }
        : null;
};
export const sendCookie = (user, res, message, statusCode = 200, permissions) => {
    const token = jwt.sign({ id: user.User_Id, userName: user.User_Name }, process.env.JWT_SECRET);
    return res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    }).json({
        success: true,
        message,
        permissions
    });
};
