
import Database from 'better-sqlite3';

const DataStore = (store_name) => {
	// database
	const options = { 
		verbose: (/*message*/) => { /*console.log(message)*/ } 
	};
	const BetterSqlite3 = new Database(store_name, options);

	const createTable = (query) => {
		BetterSqlite3.exec(query);
	}

	const insert = (query, ...parameters) => {
		return BetterSqlite3.prepare(query).run(...parameters);
	}

	const fetch = (query, ...parameters) => {
		return BetterSqlite3.prepare(query).all(...parameters);
	}

	createTable("CREATE TABLE IF NOT EXISTS inputs(" +
		"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
		"type VARCHAR(1)," +
		"instruction VARCHAR(255)," +
		"timestamp DATETIME DEFAULT 0" +
	")");

	createTable("CREATE TABLE IF NOT EXISTS movements(" +
		"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
		"input INTEGER," +
		"result VARCHAR(255)," +
		"timestamp DATETIME DEFAULT 0" +
	")");

	createTable("CREATE TABLE IF NOT EXISTS outputs(" +
		"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
		"input INTEGER," +
		"result VARCHAR(255)," +
		"timestamp DATETIME DEFAULT 0" +
	")");

	return { fetch, insert };
}

export default DataStore;
