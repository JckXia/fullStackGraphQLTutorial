const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const TEMP_USER_ID = "5e0660153f2c9239e44106d7";
const { dateToString } = require("../../helper/date");

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    creator: user.bind(this, event.creator)
  };
};

const transformBooking = bookingObject => {
  return {
    ...bookingObject._doc,
    user: user.bind(this, bookingObject._doc.user),
    event: singleEvent.bind(this, bookingObject._doc.event._id),
    createdAt: dateToString(bookingObject._doc.createdAt),
    updatedAt: dateToString(bookingObject._doc.updatedAt)
  };
};

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const eventObject = await Event.findById(eventId);
    return transformEvent(eventObject);
  } catch (error) {}
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
      return transformEvent(event);
    });
  },
  bookings: async () => {
    try {
      const bookingObjects = await Booking.find();
      return bookingObjects.map(bookingObject => {
        return transformBooking(bookingObject);
      });
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: TEMP_USER_ID,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async args => {
    try {
      const bookingObject = await Booking.findById(args.bookingId).populate(
        "event"
      );

      const event = transformEvent(bookingObject.event);
      const deleteBookingResponse = await Booking.deleteOne({
        _id: args.bookingId
      });
      return event;
    } catch (error) {
      throw error;
    }
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

      let eventCreationObject = await event.save();
      eventCreationObject = transformEvent(eventCreationObject);
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
