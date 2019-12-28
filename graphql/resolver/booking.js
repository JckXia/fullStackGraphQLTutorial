const Booking = require("../../models/booking");
const Event = require("../../models/event");
const TEMP_USER_ID = "5e0660153f2c9239e44106d7";
const { transformBooking, transformEvent } = require("./merge");

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
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("403 User unauthenticated!");
    }
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: TEMP_USER_ID,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("403 User unauthenticated!");
    }
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
