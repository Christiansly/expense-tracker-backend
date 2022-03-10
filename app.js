const app = require('express')
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolver')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200)
    }
    next();
  });


  app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data
      const message = err.message || 'An error occured'
      const code = err.originalError.code || 500
      return {message: message, status: code, data: data}
    }
  }))

  mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.qfbbp.mongodb.net/feed?retryWrites=true&w=majority"
  )
  .then(() => {
   app.listen(8080);
    console.log('Connected')
  })
  .catch((err) => console.log(err));