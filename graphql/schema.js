const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Expense {
        _id: ID!
        title: String!
        amount: String!
        owner: User!
        date: String!
    }

    type User {
        _id: ID!
        name: String!
        password: String
        expenses: [Expense!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input ExpenseData {
        title: String!
        amount: String!
        date: String!
    }

    type ExpensesData {
        expenses: [Expense!]!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getExpenses(): ExpensesData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createExpense(expenseInput: ExpensesData): Expense!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)