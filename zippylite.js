#!/usr/bin/env node

/* eslint no-console: 0 */

const unzip = require('unzip');
const fs = require('fs');
const cli = require('cli');
const csv = require('csv');
const sqlite3 = require('sqlite3');
const path = require('path');

const options = cli.parse({
  file: ['f', 'A zip file to process', 'file'],
  output: ['o', 'sqlite database file to output', 'file', 'zip2db.sqlite'],
});

const createDatabase = (databaseName) => {
  const db = new sqlite3.Database(databaseName);
  db.on('error', err => console.log('db error: ', err));
  return db;
};

const getCreateTableStatement = (table, header) => {
  const dataWithType = header.map(one => `${one} TEXT`);
  return `DROP TABLE IF EXISTS ${table}; CREATE TABLE ${table} (${dataWithType.join(', ')})`;
};

const getInsertValuesStatement = (table, data) => {
  const values = data.map(one => `'${one}'`);
  return `INSERT INTO ${table} VALUES (${values.join(', ')})`;
};

const dbExecute = (db, sql) => {
  db.serialize(() => {
    db.exec(`begin transaction; ${sql}; commit;`);
  });
};

const parseCSV = (stream, fileName, db) => {
  const parser = csv.parse({ delimeter: ',' });
  let table = '';
  let sql = [];

  parser.on('readable', () => {
    const data = parser.read();

    if (data != null) {
      if (parser.lines === 1) {
        table = path.parse(fileName).name;
        const createTableSql = getCreateTableStatement(table, data);

        sql.push(createTableSql);
      } else {
        const valueInsertSql = getInsertValuesStatement(table, data);
        sql.push(valueInsertSql);

        if (sql.length > 1000) {
          dbExecute(db, sql.join('; '));
          sql = [];
        }
      }
    }
  });

  parser.on('error', (err) => {
    console.log('parser error: ', err);
  });

  parser.on('end', () => {
    if (sql.length > 0) {
      dbExecute(db, sql.join('; '));
      sql = [];
    }
  });

  stream.pipe(parser);
};

const unZipAndParse = (zipFile, db) => {
  fs.createReadStream(zipFile)
    .pipe(unzip.Parse())
    .on('entry', (entry) => {
      if (entry.type === 'File') {
        parseCSV(entry, entry.path, db);
      } else {
        entry.autodrain();
      }
    })
    .on('close', () => {
      db.close();
    });
};

unZipAndParse(options.file, createDatabase(options.output));
