const Hapi = require("@hapi/hapi");
const { createLogger, format, transports, config } = require("winston");
const { combine, timestamp, prettyPrint } = format;
const { goodWinston } = require("hapi-good-winston");

// ====================================config logs=====================================================

const logger = createLogger({
  levels: config.syslog.levels,
  format: combine(timestamp(), prettyPrint(), format.json(), format.colorize()),
  transports: [
    new transports.File({
      filename: "./logs/app-logs.log",
      handleExceptions: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      zippedArchive: true,
      response: true
    }),
    new transports.Console()
  ],
  meta: true
});

const goodWinstonOptions = {
  levels: {
    response: "info",
    error: "error",
    request: true
  },
  responsePayload: true
};

const options = {
  ops: {
    interval: 1000
  },
  reporters: {
    winstonWithLogLevels: [goodWinston(logger, goodWinstonOptions)]
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

  server.route({
    method: "GET",
    path: "/error",
    handler: (request, h) => {
      return new Error(
        "This is an error and it should be logged to the console"
      );
    }
  });

  server.route({
    method: "GET",
    path: "/users",
    handler: (request, h) => {
      return "Hello World!";
    }
  });

  server.route({
    method: "POST",
    path: "/users",
    handler: (request, h) => {
      logger.info(`${JSON.stringify(request.payload)}`);
      return {
        username: request.payload.username,
        password: request.payload.password
      };
    }
  });

  server.route({
    method: "PUT",
    path: "/users",
    handler: (request, h) => {
      return "Hello World!";
    }
  });

  server.route({
    method: "DELETE",
    path: "/users",
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
