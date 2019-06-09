const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const grapgQlSchema = require("./graphql/schema/index");
const grapgQlResolvers = require("./graphql/resolvers/index");

const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  console.log(req.body);
  next();
});

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHttp({
    schema: grapgQlSchema,
    rootValue: grapgQlResolvers,
    graphiql: true
  })
);

require("dotenv").config({ path: "variables.env" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  });
