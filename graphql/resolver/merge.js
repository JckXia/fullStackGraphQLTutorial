const Event = require("../../models/event");
const User = require("../../models/user");

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

exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
