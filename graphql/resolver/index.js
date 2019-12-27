const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");
const TEMP_USER_ID = "5e0660153f2c9239e44106d7";
const events = async eventIds => {
  console.log(`INFO--- Event IDS ${eventIds}`);
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const userObject = await User.findById(userId);
    return {
      ...userObject._doc,
      createdEvents: events.bind(this, userObject._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    const eventsObject = await Event.find();
    return eventsObject.map(event => {
      return {
        _id: event.id,
        ...event._doc,
        creator: user.bind(this, event._doc.creator)
      };
    });
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date().toISOString(),
      creator: TEMP_USER_ID
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById(TEMP_USER_ID);
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
