// User-facing strings and messages
const MESSAGES = {
  // Server messages
  SERVER_START: 'API Server is listening to port',
  WAITING_FOR_DB: 'Waiting for MySQL...',
  TABLE_CREATED: 'Table created successfully with InnoDB engine',
  TABLE_CREATE_ERROR: 'Error creating table:',
  PATIENT_INSERTED: 'Inserted patient',
  
  // Success messages
  PATIENTS_INSERTED: 'The Patients have been Inserted',
  POST_COMPLETED: 'The Post request has been completed',
  
  // Error messages
  NOT_SELECT_STATEMENT: 'Cannot query this, not a SELECT statement',
  NOT_INSERT_STATEMENT: 'Cannot query this, not an INSERT statement',
  METHOD_NOT_ALLOWED: 'Method not allowed. Use GET or POST.',
  NOT_FOUND: 'Not found. Use /api/definitions endpoint.',
  
  // CORS headers
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
};

// Database configuration defaults
const DB_DEFAULTS = {
  HOST: 'localhost',
  PORT: 3306,
  USER: 'root',
  PASSWORD: 'gemgemgem',
  DATABASE: 'lab5db'
};

// SQL queries
const SQL_QUERIES = {
  TEST_CONNECTION: 'SELECT 1',
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS patient (
      patientid INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      dateOfBirth DATE NOT NULL
    ) ENGINE=InnoDB;
  `,
  INSERT_PATIENT: 'INSERT INTO patient (name, dateOfBirth) VALUES (?, ?)'
};

// Sample patient data
const SAMPLE_PATIENTS = [
  { name: 'Sara Brown', dateOfBirth: '1901-01-01' },
  { name: 'John Smith', dateOfBirth: '1941-01-01' },
  { name: 'Jack Ma', dateOfBirth: '1961-01-30' },
  { name: 'Elon Musk', dateOfBirth: '1999-01-01' }
];

// Regular expressions for query validation
const PATTERNS = {
  SELECT: /^SELECT/i,
  INSERT: /^INSERT/i
};

// API endpoints
const ENDPOINTS = {
  DATABASE: '/api/database',
  DATABASE_SLASH: '/api/database/'
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405
};

// Server configuration
const SERVER_CONFIG = {
  PORT: 3000,
  DB_RETRY_DELAY: 1000
};

module.exports = {
  MESSAGES,
  DB_DEFAULTS,
  SQL_QUERIES,
  SAMPLE_PATIENTS,
  PATTERNS,
  ENDPOINTS,
  HTTP_STATUS,
  SERVER_CONFIG
};
