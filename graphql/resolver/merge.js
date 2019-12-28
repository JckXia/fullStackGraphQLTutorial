const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helper/date");
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
  } catch (error) {
    throw error;
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

exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
