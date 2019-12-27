const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");

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

module.exports = {
  events: () => {
    return Event.find()
      .populate("creator")
      .then(events => {
        return events.map(event => {
          console.log(event);
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
      creator: "5e0660153f2c9239e44106d7"
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById("5e0660153f2c9239e44106d7");
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
};
