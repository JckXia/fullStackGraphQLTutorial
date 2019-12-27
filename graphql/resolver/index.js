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
  createEvent: async args => {
    try {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date().toISOString(),
        creator: TEMP_USER_ID
      });
      const userObject = await User.findById(TEMP_USER_ID);
      if (!userObject) {
        throw new Error("403 User not found!");
      }

      let createdEvent;
      let eventCreationObject = await event.save();
      eventCreationObject = {
        ...eventCreationObject._doc,
        creator: user.bind(this, eventCreationObject._doc.creator)
      };

      userObject.createdEvents.push(event);
      userObject.save();
      return eventCreationObject;
    } catch (err) {
      throw err;
    }
  },
  createUser: async args => {
    try {
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const newUserObject = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const saveNewUserObject = await newUserObject.save();
      console.log(saveNewUserObject);
      return { ...saveNewUserObject._doc, password: null };
    } catch (err) {
      throw err;
    }
  }
};
