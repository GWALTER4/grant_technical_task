import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import rl from 'readline-promise';

import DataStore from './store.js';
import MartianRobot from './robot.js';

// args
const myArgs = process.argv.slice(2);

// constants
const SERVER_ADDRESS = "http://localhost";
const REST_API_PORT = 80;
const GRAPHQL_API_PORT = 4000;

const STORE_FILE_NAME = "store.db";

const GRID_X_MAX = 6;
const GRID_Y_MAX = 4;
const INSTRUCTION_SIZE_MAX = 100;
const COORDINATE_VALUE_MAX = 50;

const store = DataStore(STORE_FILE_NAME);
const robot = MartianRobot(store, {
	grid_x_max: GRID_X_MAX,
	grid_y_max: GRID_Y_MAX,
	instruction_size_max: INSTRUCTION_SIZE_MAX,
	coordinate_value_max: COORDINATE_VALUE_MAX
});

// rest
const restapp = express();
restapp.get('/', (req, res) => res.send('Be aware of Martian Robots!'));
restapp.get('/command/:args', (req, res) => {
	const args = req.params.args
	return res.send(robot.checkCommandArgs(args));
});
restapp.listen(REST_API_PORT);
console.log('Running a REST API server at ' + SERVER_ADDRESS + ':' + REST_API_PORT);

// graphql
const graphqlapp = express();
const schema = buildSchema(`
	type Query {
		command(args: String): [String]
	}
`);
const root = {
	command: ({args}) => robot.checkCommandArgs(args),
};
graphqlapp.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));
graphqlapp.listen(GRAPHQL_API_PORT);
console.log('Running a GraphQL API server at ' + SERVER_ADDRESS + ':' + GRAPHQL_API_PORT + '/graphql');

// readline
const readline = rl.default;
const rlp = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});
const loadPrompt = () => {
	rlp.questionAsync('Enter command: ').then(questionArgs => {
		console.log(robot.checkCommandArgs(questionArgs));
		loadPrompt();
	});
}

// run
robot.findCommand(myArgs);

loadPrompt();
