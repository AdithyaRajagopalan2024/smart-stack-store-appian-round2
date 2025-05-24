import express, { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

dotenv.config();

const CLOUD_SQL_CONNECTION_NAME = process.env.CLOUD_SQL_CONNECTION_NAME;
const CLOUD_SQL_DATABASE = process.env.CLOUD_SQL_DATABASE;
const CLOUD_SQL_USER = process.env.CLOUD_SQL_IAM_USER;
const CLOUD_SQL_PASSWORD = process.env.CLOUD_SQL_PASSWORD;


const GCS_RAG_BUCKET_NAME = process.env.GCS_RAG_BUCKET_NAME || "product-catalog-images10234";
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "durable-melody-460304-t5";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

let storageClient: Storage;
let vertexAI: VertexAI;
let generativeModel: any;
let mysqlPool: mysql.Pool;
let sqlContext = '';

async function initializeServices() {
    try {
        storageClient = new Storage();
        console.log('Google Cloud Storage client initialized.');

        if (!PROJECT_ID) {
            throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set.');
        }

        vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
        console.log(`Vertex AI client initialized for project: ${PROJECT_ID}, location: ${LOCATION}.`);

        generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('Gemini model initialized (default gemini-2.0-flash).');

        await storageClient.bucket(GCS_RAG_BUCKET_NAME).getMetadata();
        console.log(`Successfully connected to GCS bucket: ${GCS_RAG_BUCKET_NAME}`);

        if (!CLOUD_SQL_CONNECTION_NAME || !CLOUD_SQL_DATABASE || !CLOUD_SQL_USER) {
            console.warn('Cloud SQL connection name, database, or user environment variables are not fully set. Skipping Cloud SQL initialization.');
        } else {
            console.log('Attempting to initialize Cloud SQL MySQL with @google-cloud/cloud-sql-connector...');
            try {
                const connector = new Connector();

                let mysqlConfig: mysql.PoolOptions = {
                    host: process.env.CLOUDSQL_DB_HOST,
                    user: CLOUD_SQL_USER,
                    database: CLOUD_SQL_DATABASE,
                    password: CLOUD_SQL_PASSWORD,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                };


                if (process.env.NODE_ENV === 'production') {

                    const connectionOptions: any = await connector.getOptions({
                        instanceConnectionName: CLOUD_SQL_CONNECTION_NAME,
                        ipType: IpAddressTypes.PUBLIC,
                    });
                    mysqlConfig.port = 3306;
                    console.log('Cloud SQL Connector options:', connectionOptions);
                    if (connectionOptions.socketPath) {
                        mysqlConfig.socketPath = connectionOptions.socketPath;
                        console.log(`Connecting to Cloud SQL via Unix socket: ${mysqlConfig.socketPath}`);
                    } else if (connectionOptions.host && connectionOptions.port) {
                        mysqlConfig.host = connectionOptions.host;
                        mysqlConfig.port = connectionOptions.port;
                        console.log(`Connecting to Cloud SQL via TCP from connector: ${mysqlConfig.host}:${mysqlConfig.port}`);
                    } else {
                        throw new Error("Cloud SQL Connector did not provide a valid connection path (socket or host/port).");
                    }
                } else {
                    mysqlConfig.host = '127.0.0.1';
                    mysqlConfig.port = 3306;
                    console.log(`Connecting to Cloud SQL locally via TCP: ${mysqlConfig.host}:${mysqlConfig.port}`);
                }

                mysqlPool = mysql.createPool(mysqlConfig);

                const [rows] = await mysqlPool.execute('SELECT NOW() AS currentTime;');
                console.log('Successfully connected to Cloud SQL MySQL database:', rows);

                const [rows2] = await mysqlPool.execute('SELECT product_ID, name, brand, category, price, stock, warranty_years, rating FROM product_catalog;');
                const products = rows2 as any[];
                if (products.length > 0) {
                    sqlContext += "--- All Product Information from Database ---\n";
                    products.forEach(product => {
                        sqlContext += `Product_ID: ${product.product_ID}, ` +
                            `Name: ${product.name}, ` +
                            `Brand: ${product.brand}, ` +
                            `Category: ${product.category}, ` +
                            `Price: ${product.price}, ` +
                            `Stock: ${product.stock}, ` +
                            `Warranty_Years: ${product.warranty_years}, ` +
                            `Rating: ${product.rating}\n`;
                    });
                    console.log(sqlContext);
                    sqlContext += "\n";
                }

            } catch (dbError) {
                console.error('Failed to connect to Cloud SQL MySQL during initialization:', dbError);
                process.exit(1);
            }
        }

    } catch (error) {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function fetchAllSqlDataForRAG(): Promise<string> {
    if (!mysqlPool) {
        console.warn("Cloud SQL MySQL pool not initialized, cannot fetch data for RAG.");
        return '';
    }

    // let sqlContext = '';
    // try {
    //     const [rows] = await mysqlPool.execute('SELECT product_ID, name, brand, category, price, stock, warranty_years, rating FROM product_catalog;');
    //     const products = rows as any[];

    //     if (products.length > 0) {
    //         sqlContext += "--- All Product Information from Database ---\n";
    //         products.forEach(product => {
    //             sqlContext += `Product_ID: ${product.product_ID}, ` +
    //                 `Name: ${product.name}, ` +
    //                 `Brand: ${product.brand}, ` +
    //                 `Category: ${product.category}, ` +
    //                 `Price: ${product.price}, ` +
    //                 `Stock: ${product.stock}, ` +
    //                 `Warranty_Years: ${product.warranty_years}, ` +
    //                 `Rating: ${product.rating}\n`;
    //         });
    //         sqlContext += "\n";
    //     } else {
    //         sqlContext += `No products found in the database table 'product_catalog'.\n`;
    //     }
    return sqlContext;
}

app.post('/api/gemini-rag-query', async (req, res: Record<string, any>) => {
    const { prompt, imageBase64 } = req.body;

    if (!prompt && !imageBase64) {
        return res.status(400).json({ error: 'A text prompt or an image is required.' });
    }

    if (!generativeModel || !storageClient || !vertexAI) {
        return res.status(500).json({ error: 'Backend services are not initialized.' });
    }

    try {
        let parts: any[] = [];
        let modelToUse = 'gemini-2.0-flash';

        const allSqlContext = await fetchAllSqlDataForRAG();
        if (allSqlContext) {
            parts.push({ text: `--- Database Context ---\n${allSqlContext}\n\n` });
            console.log('Added Cloud SQL data to prompt.');
        }

        const bucket = storageClient.bucket(GCS_RAG_BUCKET_NAME);
        const [files] = await bucket.getFiles();
        console.log(`Found ${files.length} files in bucket ${GCS_RAG_BUCKET_NAME}`);

        const directGCSSupportedMimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'webp': 'image/webp', 'mp4': 'video/mp4', 'mpeg': 'video/mpeg', 'mov': 'video/quicktime',
            'avi': 'video/x-msvideo', 'wmv': 'video/x-ms-wmv', 'flv': 'video/x-flv', 'ogg': 'video/ogg',
            '3gp': 'video/3gpp', 'webm': 'video/webm'
        };

        let combinedDocumentContent = '';

        for (const file of files) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const gcsUri = `gs://${GCS_RAG_BUCKET_NAME}/${file.name}`;
            const fileMimeType = file.metadata.contentType || directGCSSupportedMimeTypes[fileExtension!] || 'application/octet-stream';

            if (fileExtension && directGCSSupportedMimeTypes[fileExtension]) {
                parts.push({
                    fileData: { mimeType: fileMimeType, fileUri: gcsUri },
                });
                console.log(`Added GCS file URI to parts: ${gcsUri} (MIME: ${fileMimeType})`);
                if (fileMimeType.startsWith('image/') || fileMimeType.startsWith('video/')) {
                    modelToUse = 'gemini-2.0-flash';
                }
            } else if (fileExtension && (fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'json')) {
                try {
                    const fileContentBuffer = await file.download();
                    combinedDocumentContent += `--- Document: ${file.name} ---\n${fileContentBuffer.toString()}\n\n`;
                    console.log(`Downloaded and added text content from: ${file.name}`);
                } catch (fileError) {
                    console.error(`Error downloading file ${file.name}:`, fileError);
                }
            } else {
                console.log(`Skipping unsupported file for direct GCS grounding or text extraction: ${file.name}`);
            }
        }

        if (combinedDocumentContent) {
            console.log(`Combined document content from GCS files: ${combinedDocumentContent}`);
            parts.push({ text: `You are an AI assistant on a shopping platform. Based on the following context, answer the user's query (preferably in human conversation format).  \n\nContext:\n${combinedDocumentContent}\n\n` });
            console.log('Added combined text content from GCS files to prompt for RAG.');
        }

        if (prompt) {
            parts.push({ text: prompt });
        }

        if (imageBase64) {
            parts.push({
                inlineData: { mimeType: 'image/jpeg', data: imageBase64 },
            });
            modelToUse = 'gemini-2.0-flash';
            console.log('Using gemini-2.0-flash model due to client-provided image input.');
        }

        generativeModel = vertexAI.getGenerativeModel({ model: modelToUse });
        console.log(`Using model: ${modelToUse}`);

        const request = {
            contents: [{ role: 'user', parts: parts }],
        };
        const result = await generativeModel.generateContent(request);
        const responseText = result.response.candidates[0].content.parts[0].text;

        res.json({ response: responseText });

    } catch (error) {
        console.error('Error processing Gemini RAG query:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('Backend working');
});

initializeServices().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});