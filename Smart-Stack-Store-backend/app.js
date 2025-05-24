const express = require('express')
const app = express()
const path = require('path');
const sqlconn = require('@google-cloud/cloud-sql-connector');
const mysql = require('mysql2/promise');
const {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI
} = require('@google-cloud/vertexai');
// const vertexai = require('@google-cloud/vertexai');
var cors = require('cors');
const project = 'dark-alloy-460810-i1';
const location = 'us-central1';
const textModel =  'gemini-2.0-flash';
const visionModel = 'gemini-1.0-pro-vision';

const vertexAI = new VertexAI({project: project, location: location});

app.use(cors());
const connector = new sqlconn.Connector();
const IpAddressTypes = sqlconn.IpAddressTypes;


// var dashboardRoutes = require('./routes/database');
// app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
res.send("here is the home page");
});

app.get('/getProductCatalog', async (req, res) => {
    try {
        console.log("Connecting to Cloud SQL database...");
        const clientOpts = await connector.getOptions({
            instanceConnectionName: "dark-alloy-460810-i1:us-central1:smartstack-mysql-db",
            ipType: IpAddressTypes.PUBLIC,
        });
//         const dbConfig = {
//     ...clientOpts,
//     user: "smartstack-dbuser", // e.g. 'my-db-user'
//     password: "smartstackappian", // e.g. 'my-db-password'
//     database: "product-catalog-db", // e.g. 'my-database'
//     // ... Specify additional properties here.
//   };
        console.log("Client options:", clientOpts);
        const pool = await mysql.createPool({
            ...clientOpts,
             user: "smartstack-dbuser", // e.g. 'my-db-user'
    password: "smartstackappian", // e.g. 'my-db-password'
    database: "product-catalog-db",
        });
        console.log("Pool created successfully.");
        const conn = await pool.getConnection();
        console.log("Connection established successfully.");
        let sqlContext = "";
        const [rows2] = await conn.query('SELECT * FROM product_catalog LIMIT 1000;');
        const products = rows2;
        
        await pool.end();
        connector.close();
        res.status(200).send(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.get('/sendQuery', async (req, res) => {
    const generativeModel = vertexAI.getGenerativeModel({
    model: textModel,
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
    generationConfig: {maxOutputTokens: 256},
    systemInstruction: {
      role: 'system',
      parts: [{"text": `For example, you are a helpful customer service agent.`}]
    },
});

const generativeVisionModel = vertexAI.getGenerativeModel({
    model: visionModel,
});

const generativeModelPreview = vertexAI.preview.getGenerativeModel({
    model: textModel,
});
const request = {
    contents: [{role: 'user', parts: [{text: req.prompt}]}],
  };
  const result = await generativeModel.generateContent(request);
  const response = result.response;
  console.log('Response: ', JSON.stringify(response));
  res.send(response);
});

app.listen(8080, () => {
    console.log('Server started on port 8080');
});
