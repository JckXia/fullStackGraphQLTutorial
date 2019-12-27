const express = require("express");
const bodyParser = require("body-parser");
const graphQLHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/user");
const app = express();
const PORT = 3000;
const dev_db_url =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/graphQLProject";
//const events = [];

app.use(bodyParser.json());

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } }).then(events => {
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event.creator)
      };
    });
  });
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

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
        creator:User!
    }  

    type User{
        _id:ID!
        email:String!
        password:String
        createdEvents:[Event!]
    }

    input UserInput{
        email:String!
        password:String!
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
         createUser(userInput:UserInput):User
      }

      schema{
        query:RootQuery
        mutation:RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .populate("creator")
          .then(events => {
            return events.map(event => {
              return {
                _id: event.id,
                ...event._doc,
                creator: user.bind(this, event._doc.creator)
              };
            });
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
          date: new Date().toISOString(),
          creator: "5e041c26a8aa969b34d7c37a"
        });
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = {
              ...result._doc,
              creator: user.bind(this, result._doc.creator)
            };
            return User.findById("5e041c26a8aa969b34d7c37a");
          })
          .then(user => {
            if (!user) {
              throw new Error("User  not found");
            }

            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            throw err;
          });
      },
      createUser: args => {
        return bcrypt
          .hash(args.userInput.password, 12)
          .then(hashedPassword => {
            console.log(hashedPassword);
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });
            return user
              .save()
              .then(result => {
                return { ...result._doc, password: null };
              })
              .catch(err => {
                throw err;
              });
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
