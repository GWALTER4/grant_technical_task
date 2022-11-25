const MartianRobot = (store, options) => {
  const ORIENTATIONS = ["N", "E", "S", "W"];

  const regx_orientation = new RegExp(/[NSEW]/);
  const regx_movement = new RegExp(/[LRF]/);

  // variables
  let map = {
    grid: new Array(options.grid_y_max).fill(0),
    x: 0,
    y: 0,
    o: "N",
  };

  const storeMovement = (id, result) => {
    store.insert(
      "INSERT OR IGNORE INTO movements VALUES (@id, @input, @result, @timestamp)",
      {
        id: null,
        input: id,
        result: result,
        timestamp: getTimestamp(),
      }
    );
  };

  const newPosition = (id) => {
    const result = map.x + " " + map.y + " " + map.o;
    storeMovement(id, result);
    return result;
  };

  const lost = (id, x, y, o) => {
    const result = x + " " + y + " " + o + " LOST";
    storeMovement(id, result);
    return result;
  };

  const setGrid = (x, y, i) => {
    map.grid[options.grid_y_max - y - 1][x] = i;
  };

  const getTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  };

  const setPosition = (id, x, y, o) => {
    if (x >= options.grid_x_max || x < 0) {
      return lost(id, x, y, o);
    } else if (y >= options.grid_y_max || y < 0) {
      return lost(id, x, y, o);
    } else if (regx_orientation.test(o) === false) {
      return "Orientation error, expected N S E or W";
    } else {
      setGrid(map.x, map.y, 0);
      setGrid(x, y, 1);
      map.x = x;
      map.y = y;
      map.o = o;
      return newPosition(id);
    }
  };

  const moveForward = (id) => {
    switch (map.o) {
      case "N":
        return setPosition(id, map.x, map.y + 1, map.o);
      case "E":
        return setPosition(id, map.x + 1, map.y, map.o);
      case "S":
        return setPosition(id, map.x, map.y - 1, map.o);
      case "W":
        return setPosition(id, map.x - 1, map.y, map.o);
      default:
        return "Orientation not found";
    }
  };

  const processMovement = (id, m) => {
    let index = ORIENTATIONS.indexOf(map.o);
    switch (m) {
      case "L":
        if (index > 0) index--;
        else index = ORIENTATIONS.length - 1;
        break;

      case "R":
        if (ORIENTATIONS.length - 1 > index) index++;
        else index = 0;
        break;

      case "F":
        return moveForward(id);
      default:
        return "Movement not found";
    }
    map.o = ORIENTATIONS[index];
    return newPosition(id);
  };

  const processCommand = (id, args) => {
    if (args.length === 3) {
      const posx = parseInt(args[0]);
      const posy = parseInt(args[1]);
      const o = args[2].substring(0, 1);
      if (
        posx > options.coordinate_value_max ||
        posy > options.coordinate_value_max
      ) {
        return ["Coordinate max is " + options.coordinate_value_max];
      }
      return [setPosition(id, posx, posy, o)];
    } else {
      return ["Missing args"];
    }
  };

  const processMovementArgs = (id, args) => {
    if (args.length === 1) {
      const characters = args[0];
      let results = [];
      if (options.instruction_size_max >= characters.length) {
        for (let i = 0; i < characters.length; i++) {
          const char = characters.charAt(i);
          if (regx_movement.test(char)) {
            results.push(processMovement(id, char));
          } else {
            results.push("error char " + char);
          }
        }
      } else {
        return [
          "To many instructions, " + options.instruction_size_max + " max",
        ];
      }
      return results;
    } else {
      return ["Missing args"];
    }
  };

  const getPastRuns = (id, args) => {
    const rows = store.fetch("SELECT * FROM inputs");
    const results = [];
    for (let row of rows) {
      results.push(
        row.timestamp + " " + row.id + ": " + row.type + " " + row.instruction
      );
    }
    return results;
  };

  const getRunHistory = (id, args) => {
    if (args.length === 1) {
      const id = parseInt(args[0]);
      const rows = store.fetch("SELECT * FROM movements WHERE input=?", id);
      const results = [];
      for (let row of rows) {
        results.push(row.result);
      }
      return results;
    } else {
      return ["ID required"];
    }
  };

  const getOutput = (id, args) => {
    if (args.length === 1) {
      const id = parseInt(args[0]);
      const rows = store.fetch("SELECT * FROM outputs WHERE input=?", id);
      const results = [];
      for (let row of rows) {
        results.push(row.result);
      }
      return results;
    } else {
      return ["ID required"];
    }
  };

  const printGrid = (id, args) => {
    let results = [];
    for (var y = 0; y < options.grid_y_max; y++) {
      let row = "";
      const gridY = map.grid[y];
      for (var x = 0; x < options.grid_x_max; x++) {
        row += gridY[x] === 1 ? map.o : "0";
      }
      results.push(row);
    }
    return results;
  };

  const commands = [
    {
      command: "h",
      description: "help",
      syntax: "h",
      func: () => {
        let stringArray = [];
        commands.forEach((c) => {
          if (c.command.length > 0) {
            stringArray.push(
              c.command + " " + c.description + " - usage: " + c.syntax
            );
          }
        });
        return stringArray;
      },
    },
    {
      command: "c",
      description: "Command drop robot on the grid",
      syntax: "c x y o",
      func: (id, qargs) => processCommand(id, qargs),
    },
    {
      command: "m",
      description: "Make movements on the grid",
      syntax: "m LFRF",
      func: (id, qargs) => processMovementArgs(id, qargs),
    },
    {
      command: "l",
      description: "List the input history",
      syntax: "l",
      func: (id, qargs) => getPastRuns(id, qargs),
    },
    {
      command: "r",
      description: "Show results by input id",
      syntax: "r id",
      func: (id, qargs) => getRunHistory(id, qargs),
    },
    {
      command: "p",
      description: "Print grid",
      syntax: "p",
      func: (id, qargs) => printGrid(id, qargs),
    },
    {
      command: "o",
      description: "Get the output by input id",
      syntax: "o id",
      func: (id, qargs) => getOutput(id, qargs),
    },
  ];

  const getInstructionFromArgs = (...args) => {
    return args
      .sort(function (a, b) {
        return a - b;
      })
      .toString()
      .replace(/,/g, " ");
  };

  const findCommand = (qargs) => {
    if (qargs.length > 0) {
      const command = qargs[0];
      const found = commands.find((element) => element.command === command);
      qargs.shift();
      if (typeof found !== "undefined") {
        const newRun = store.insert(
          "INSERT OR IGNORE INTO inputs VALUES (@id, @type, @instruction, @timestamp)",
          {
            id: null,
            type: command,
            instruction: getInstructionFromArgs(qargs),
            timestamp: getTimestamp(),
          }
        );
        const results = found.func(newRun.lastInsertRowid, qargs);
        if (results.length > 0) {
          const lastResult = results[results.length - 1];
          store.insert(
            "INSERT OR IGNORE INTO outputs VALUES (@id, @input, @result, @timestamp)",
            {
              id: null,
              input: newRun.lastInsertRowid,
              result: lastResult,
              timestamp: getTimestamp(),
            }
          );
          return results;
        } else {
          return ["No results found!"];
        }
      }
    }
    return ["Command not found!"];
  };

  const checkCommandArgs = (commandArgs) => {
    const qargs = commandArgs.split(/(\s+)/).filter((e) => e.trim().length > 0);
    return findCommand(qargs);
  };

  // init the map data
  for (var y = 0; y < options.grid_y_max; y++) {
    map.grid[y] = new Array(options.grid_x_max);
    map.grid[y].fill(0);
  }

  // set default position in grid
  setGrid(map.x, map.y, 1);

  return { findCommand, checkCommandArgs };
};

export default MartianRobot;
