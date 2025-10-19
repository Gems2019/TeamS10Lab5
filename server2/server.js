const mysql = require('mysql2');
const http = require('http');
const url = require('url');
const { error } = require('console');


const PORT = 3000;

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'gemgemgem',
  database: 'lab5db',
});

const db = pool.promise();


async function createTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Patients (
        patientid INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dateOfBirth DATE NOT NULL
      ) ENGINE=InnoDB;
    `);
    console.log('Table created successfully with InnoDB engine');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}


async function insertPatients() {
  const patients = [
    { name: 'John Doe', dateOfBirth: '1985-03-25 00:00:00' },
    { name: 'Jane Smith', dateOfBirth: '1990-07-12 00:00:00' },
    { name: 'Alice Johnson', dateOfBirth: '2000-11-05 00:00:00' }
  ];

  for (const p of patients) {
    await db.execute(
      'INSERT INTO Patients (name, dateOfBirth) VALUES (?, ?)',
      [p.name, p.dateOfBirth]
    );
    console.log(`Inserted patient ${p.name}`);
  }
}



const handleOptions = (req, res) => {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  });
  res.end();
};




const SQLQuery = async (query) => {

  try {
    const response = await db.execute(query);

    if (response) {
      return response;
    } else {
      throw new Error("unable to process the query");
    }
  } catch (err) {
    console.log(err.message);
    res.writeHead(400, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: err.message }));
  }
};









const handleGet = async (req, res, parsedUrl) => {

  try {
    const parsedQuery = parsedUrl.query;
    const query = parsedQuery.query;

    const pattern = /^SELECT/;
    const isSelect = pattern.test(query);

    if (!isSelect) {
      throw new Error("Cannot query this, not a SELECT statement");
    }




    const [sqlq] = await SQLQuery(query);


    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ sqlq }));

    return;
  } catch (err) {
    console.error(err.message);
    res.writeHead(400, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: err.message }));
  }

};


const handlePost = async (req, res, parsedUrl) => {
  const parsedQuery = parsedUrl.query;
  const query = parsedQuery.query;

  if (query == "addPatients") {

    try {
      insertPatients();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ Message: "The Patients have been Inserted" }));
      return;
    } catch (err) {
      console.error(err.message);
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: err.message }));
    }
  }




  try {



    const pattern = /^INSERT/;
    const isInsert = pattern.test(query);


    if (!isInsert) {
      throw new Error("Cannot query this, not an INSERT statement");
    }

    await SQLQuery(query);

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ Message: "The Post request has been completed" }));

    return;
  } catch (err) {
    console.error(err.message);
    res.writeHead(400, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
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


  if (pathname === '/api/database' || pathname === '/api/database/') {
    if (req.method === 'POST') {
      handlePost(req, res, parsedUrl);
    } else if (req.method === 'GET') {
      handleGet(req, res, parsedUrl);
    } else {
      res.writeHead(405, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Method not allowed. Use GET or POST.'
      }));
    }
  } else {
    res.writeHead(404, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      error: 'Not found. Use /api/definitions endpoint.'
    }));
  }


});







server.listen(PORT, () => {
  console.log(`API Server is listening to port ${PORT}`);
  createTable();
});







