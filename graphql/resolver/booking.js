const Booking = require("../../models/booking");
const Event = require("../../models/event");
const TEMP_USER_ID = "5e0660153f2c9239e44106d7";
const { user, singleEvent } = require("./merge");
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

module.exports = {
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
  }
};
