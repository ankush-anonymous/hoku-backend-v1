require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");

//connectDB
const connect_MongoNoSQL_DB = require("./src/infrastructure/MongoDB/connect");
const {connect_PgSQL_DB} = require("./src/infrastructure/PgDB/connect");

//routers
const googleAuthRouter = require("./src/routers/googleAuthRouter")
const userRouter = require("./src/routers/userRouter")
const userActivityRouter = require("./src/routers/userActivityRouter")
const wardrobeRouter = require("./src/routers/wardrobeRouter")
const dressRouter = require("./src/routers/dressRouter")

const corsOptions = {
  origin: "*"
};

// extra packages
app.use(express.json());
app.use(cors(corsOptions));

//routes
app.use("/api/v1/google", googleAuthRouter);
app.use("/api/v1/users",userRouter)
app.use("/api/v1/logs",userActivityRouter)
app.use("/api/v1/wardrobes",wardrobeRouter)
app.use("/api/v1/dresses",dressRouter)

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connect_MongoNoSQL_DB(process.env.MONGO_DB_URL);
    await connect_PgSQL_DB(process.env.PGSQL_DB_URL);
    app.listen(port, () =>
      console.log(`Hoku Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
