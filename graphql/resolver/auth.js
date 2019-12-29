const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async args => {
    try {
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const checkExistingUserObject = await User.findOne({
        email: args.userInput.email
      });
      if (checkExistingUserObject) {
        throw new Error("422 User exists in database");
      }
      const newUserObject = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const saveNewUserObject = await newUserObject.save();

      return { ...saveNewUserObject._doc, password: null };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("403! User does not exist!");
    }
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      throw new Error("400! Password is incorrect");
    }
    const userToken = jwt.sign(
      { userId: user.id, email: user.email },
      "someSuperSecretKey",
      {
        expiresIn: "1h"
      }
    );
    return { userId: user.id, token: userToken, tokenExpiration: 1 };
  }
};
