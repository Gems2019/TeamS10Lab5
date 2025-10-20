const mysql = require('mysql2');
const http = require('http');
const url = require('url');
const {
  MESSAGES,
  DB_DEFAULTS,
  SQL_QUERIES,
  SAMPLE_PATIENTS,
  PATTERNS,
  ENDPOINTS,
  HTTP_STATUS,
  SERVER_CONFIG
} = require('./strings');

const PORT = SERVER_CONFIG.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST || DB_DEFAULTS.HOST,
  port: DB_DEFAULTS.PORT,
  user: process.env.DB_USER || DB_DEFAULTS.USER,
  password: process.env.DB_PASSWORD || DB_DEFAULTS.PASSWORD,
  database: process.env.DB_NAME || DB_DEFAULTS.DATABASE,
});

const db = pool.promise();


const waitForDB = async () => {
  let connected = false;
  while (!connected) {
    try {
      await db.execute(SQL_QUERIES.TEST_CONNECTION);
      connected = true;
    } catch {
      console.log(MESSAGES.WAITING_FOR_DB);
      await new Promise(r => setTimeout(r, SERVER_CONFIG.DB_RETRY_DELAY));
    }
  }
};



async function createTable() {
  try {
    await db.execute(SQL_QUERIES.CREATE_TABLE);
    console.log(MESSAGES.TABLE_CREATED);
  } catch (err) {
    console.error(MESSAGES.TABLE_CREATE_ERROR, err);
  }
}


async function insertPatients() {
  for (const patient of SAMPLE_PATIENTS) {
    await db.execute(
      SQL_QUERIES.INSERT_PATIENT,
      [patient.name, patient.dateOfBirth]
    );
    console.log(`${MESSAGES.PATIENT_INSERTED} ${patient.name}`);
  }
}



const handleOptions = (req, res) => {
  res.writeHead(HTTP_STATUS.OK, {
    ...MESSAGES.CORS_HEADERS,
    'Content-Type': 'application/json'
  });
  res.end();
};






const SQLQuery = async (query) => {

  try {

    const response = await db.execute(query);

    return response;

  } catch (err) {
    throw new Error(err.message);
  }
};







const handleGet = async (req, res, parsedUrl) => {
  try {
    const parsedQuery = parsedUrl.query;
    const query = parsedQuery.query;

    const isSelect = PATTERNS.SELECT.test(query);

    if (!isSelect) {
      throw new Error(MESSAGES.NOT_SELECT_STATEMENT);
    }

    const [sqlq] = await SQLQuery(query);

    res.writeHead(HTTP_STATUS.OK, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
    });
    res.end(JSON.stringify({ sqlq }));

    return;
  } catch (err) {
    console.error(err.message);
    res.writeHead(HTTP_STATUS.BAD_REQUEST, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
    });
    res.end(JSON.stringify({ error: err.message }));
  }
};


const handlePost = async (req, res, parsedUrl) => {
  const parsedQuery = parsedUrl.query;
  const query = parsedQuery.query;

  if (query === "addPatients") {
    try {
      await insertPatients();
      res.writeHead(HTTP_STATUS.OK, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
      });
      res.end(JSON.stringify({ Message: MESSAGES.PATIENTS_INSERTED }));
      return;
    } catch (err) {
      console.error(err.message);
      res.writeHead(HTTP_STATUS.BAD_REQUEST, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
      });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  try {
    const isInsert = PATTERNS.INSERT.test(query);

    if (!isInsert) {
      throw new Error(MESSAGES.NOT_INSERT_STATEMENT);
    }

    await SQLQuery(query);

    res.writeHead(HTTP_STATUS.OK, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
    });
    res.end(JSON.stringify({ Message: MESSAGES.POST_COMPLETED }));

    return;
  } catch (err) {
    console.error(err.message);
    res.writeHead(HTTP_STATUS.BAD_REQUEST, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
    });
    res.end(JSON.stringify({ error: err.message }));
  }
};



const server = http.createServer((req, res) => {

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;


  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  };


  if (pathname === ENDPOINTS.DATABASE || pathname === ENDPOINTS.DATABASE_SLASH) {
    if (req.method === 'POST') {
      handlePost(req, res, parsedUrl);
    } else if (req.method === 'GET') {
      handleGet(req, res, parsedUrl);
    } else {
      res.writeHead(HTTP_STATUS.METHOD_NOT_ALLOWED, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
      });
      res.end(JSON.stringify({
        error: MESSAGES.METHOD_NOT_ALLOWED
      }));
    }
  } else {
    res.writeHead(HTTP_STATUS.NOT_FOUND, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': MESSAGES.CORS_HEADERS['Access-Control-Allow-Origin']
    });
    res.end(JSON.stringify({
      error: MESSAGES.NOT_FOUND
    }));
  }


});







server.listen(PORT, async () => {
  console.log(`${MESSAGES.SERVER_START} ${PORT}`);
  await waitForDB();
  await createTable();
});







