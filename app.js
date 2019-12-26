const express = require("express");
const bodyParser = require("body-parser");
const graphQLHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const app = express();
const PORT = 3000;
const dev_db_url =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/graphQLProject";
const events = [];

app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("Hello world!");
});

app.use(
  "/graphql",
  graphQLHttp({
    schema: buildSchema(`

    type Event{
        _id: ID!
        title:String!
        description:String!
        price: Float!
        date: String!
    }  

    input EventInput{
       title:String!
       description:String!
       price:Float!
       date:String! 
    }
    
    type RootQuery{
         events: [Event!]! 
      }

      type RootMutation{
         createEvent(eventInput:EventInput):Event
      }

      schema{
        query:RootQuery
        mutation:RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(res => {
            console.log(res);
            return res;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date().toISOString()
        });
        return event
          .save()
          .then(res => {
            return { ...res._doc };
          })
          .catch(err => {
            throw err;
          });
      }
    },
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
