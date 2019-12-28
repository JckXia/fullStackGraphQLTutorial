const bcrypt = require("bcryptjs");

const User = require("../../models/user");

module.exports = {
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
