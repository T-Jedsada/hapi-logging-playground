const Hapi = require("@hapi/hapi");
const winston = require("winston");
const { goodWinston } = require("hapi-good-winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
      zippedArchive: true
    }),
    new winston.transports.File({ filename: "error.log", level: "error" })
  ]
});

const goodWinstonOptions = {
  levels: {
    response: "debug",
    error: "info"
  }
};

const options = {
  ops: {
    interval: 1000
  },
  reporters: {
    winston: [goodWinston(logger)],
    winstonWithLogLevels: [goodWinston(logger, goodWinstonOptions)],
    winston2: [
      {
        module: "hapi-good-winston",
        name: "goodWinston",
        args: [logger, goodWinstonOptions]
      }
    ]
  }
};

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost"
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    }
  });

  await server.register({
    plugin: require("good"),
    options
  });
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

init();
