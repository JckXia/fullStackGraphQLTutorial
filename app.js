const express = require("express");
const bodyParser = require("body-parser");
const graphQLHttp = require("express-graphql");
const mongoose = require("mongoose");
const graphQLSchema = require("./graphql/schema/index");
const graphQLResolver = require("./graphql/resolver/index");
const app = express();
const PORT = 3000;
const dev_db_url =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/graphQLProject";
//const events = [];

app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("Hello world!");
});

app.use(
  "/graphql",
  graphQLHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolver,
    graphiql: true
  })
);

mongoose.connect(
  dev_db_url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, db) {
    if (err) {
      throw err;
    }
    console.log("Mongoose successfully connected to database!");
  }
);

app.listen(PORT, () => {
  console.log("Server up and running on 3000");
});
