const express = require('express');
// const bodyParser = require("body-parser");
const user = require("./routes/user");
const InitiateMongoServer = require("./config/db");
require('dotenv') //.config({path: './.env'});
const app = express();

// Initiate Mongo Server
InitiateMongoServer();

// PORT
const PORT=process.env.PORT || 8080;

// Middleware
// app.use(bodyParser.json());

app.use(express.json())

// app.use((req,res,next)=>{
//   console.log('Global middleware')
//   next()
// })

// app.param("id", (req,res,next,id)=> {
//   console.log(`Param working ${id}`)
//   next()
// })

// app.get("/:id", (req, res) => {
//   console.log(`Route working`)
//     res.json({ message: "API Working" });
// });

  app.use("/user", user);

  // app.use((req,res,next)=>{
  //   console.log('Second Global middleware')
  //   next()
  // })

app.listen(PORT,() => {
    console.log(`App listening at http://localhost:${PORT}`.rainbow)
})