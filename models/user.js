const user = [
  {
    userEmail: "john.doe@example.com",
    userName: "John Doe",
  },
  {
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
  },
  {
    userEmail: "alice.johnson@example.com",
    userName: "Alice Johnson",
  },
  {
    userEmail: "bob.brown@example.com",
    userName: "Bob Brown",
  },
  {
    userEmail: "charlie.davis@example.com",
    userName: "Charlie Davis",
  },
  {
    userEmail: "diana.evans@example.com",
    userName: "Diana Evans",
  },
  {
    userEmail: "frank.garcia@example.com",
    userName: "Frank Garcia",
  },
  {
    userEmail: "george.harris@example.com",
    userName: "George Harris",
  },
  {
    userEmail: "hannah.lee@example.com",
    userName: "Hannah Lee",
  },
  {
    userEmail: "ian.miller@example.com",
    userName: "Ian Miller",
  },
];

module.exports = user;

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const databaseURL = 'mongodb+srv://dlsuAdmin:YtwAp3KwEV9RlZ3C@delasalleusap.5zhp2.mongodb.net/delasalleusap?retryWrites=true&w=majority'

// const options = {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// 	useFindAndModify: false
// };

// mongoose.connect(databaseURL, options);

// var userSchema = new Schema({
//     userEmail: {type: String, required: true},
//     userName: {type: String, required: true},
//     userPassword: {type: String, required: true},
// });

// module.exports = mongoose.model('user', userSchema);
