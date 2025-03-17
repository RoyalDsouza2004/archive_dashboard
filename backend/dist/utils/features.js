"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLog = exports.getConnection = void 0;
const mariadb_1 = __importDefault(require("mariadb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 5,
};
const pool = mariadb_1.default.createPool(poolConfig);
const getConnection = async () => {
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
exports.getConnection = getConnection;
const insertLog = async ({ Sub_Edition_Id, date, Page_No_From, Page_No_To, filePath }) => {
    let conn;
    try {
        conn = await (0, exports.getConnection)();
        const query = `
          INSERT INTO log (Sub_Edition_Id, Date, Page_No_From, Page_No_To, path)
          VALUES (?, ?, ?, ?, ?);
        `;
        await conn.query(query, [Sub_Edition_Id, date, Page_No_From, Page_No_To, filePath]);
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
exports.insertLog = insertLog;
