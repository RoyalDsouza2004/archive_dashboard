import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { UploadFilesType } from '../types/types.js';

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


export const insertLog = async ({ subEditionId, date, pageNoFrom, pageNoTo, filePath }: UploadFilesType) => {
      let conn;
      try {
            conn = await getConnection()
            const query = `
          INSERT INTO log (Sub_Edition_Id, Date, Page_No_From, Page_No_To, path)
          VALUES (?, ?, ?, ?, ?);
        `;
            await conn.query(query, [subEditionId, date, pageNoFrom, pageNoTo, filePath]);
      } catch (err) {
            console.error(`Error inserting ${filePath}:`, err);
            throw err;
      } finally {
            if (conn) conn.release();
      }
}
