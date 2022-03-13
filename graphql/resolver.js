const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const validator = require("validator");
const jsonwebtoken = require("jsonwebtoken");
const Expense = require("../models/expense");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-mail is invalid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password too short" });
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      throw error;
    }
    const hashedPw = await bcryptjs.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email }).populate("expenses");
    if (!user) {
      const error = new Error("User not found");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcryptjs.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect.");
      error.code = 401;
      throw error;
    }


    const token = jsonwebtoken.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "secret",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString(), name: user.name, expenses: user.expenses};
  },
  createExpense: async function ({ expenseInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (validator.isEmpty(expenseInput.title)) {
      errors.push({ message: "Title is invalid." });
    }
    if (validator.isEmpty(expenseInput.amount)) {
      errors.push({ message: "Amount is invalid." });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    console.log(req.userId)
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Invalid user.");
      error.code = 401;
      throw error;
    }
    const expense = new Expense({
      title: expenseInput.title,
      amount: expenseInput.amount,
      date: expenseInput.date,
      owner: user,
    });
    const createdExpense = await expense.save();
    user.expenses.push(createdExpense);
    await user.save();
    return {
      ...createdExpense._doc,
      _id: createdExpense._id.toString(),
    };
  },
  expenses: async function (req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;
      throw error;
    }
    // if (!page) {
    //   page = 1;
    // }
    // const perPage = 2;
    // const totalPs = await Post.find()
    const expenses = await Expense.find().populate("owner");
    return {
      expenses: expenses.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
        };
      }),
    };
  },
};
