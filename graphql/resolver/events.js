const { dateToString } = require("../../helper/date");
const Event = require("../../models/event");
const User = require("../../models/user");
const TEMP_USER_ID = "5e0660153f2c9239e44106d7";
const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    const eventsObject = await Event.find();
    return eventsObject.map(event => {
      return transformEvent(event);
    });
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("403 User unauthenticated!");
    }
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
  }
};
