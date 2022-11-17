const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection')
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const { default: mongoose } = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
    typeDefs,
    resolvers, 
    context: authMiddleware
  });
  
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser:true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("mongodb connected"))
.catch((err) => console.log(err));

const app = express(); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// commenting out to use apollo server for test
// app.use(express.urlenc(path.resolve(_dirname, "./client/build")));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build', "index.html"));
// });
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const startApolloServer = async (typeDefs, resolvers) => {
    await server.start();
    server.applyMiddleware({ app });

    // if (process.env.NODE.ENV === 'production') {
    //   app.use(express.static(path.join(_dirname, '../client/build')));
    // }

    db.once('open', () => {
        app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
        })
    })
 }

  // Call the async function to start the server
  startApolloServer(typeDefs, resolvers);