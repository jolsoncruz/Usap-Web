const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const databaseURL = 'mongodb+srv://dlsuAdmin:YtwAp3KwEV9RlZ3C@delasalleusap.5zhp2.mongodb.net/delasalleusap?retryWrites=true&w=majority'

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
};

mongoose.connect(databaseURL, options);

var userSchema = new Schema({
    userEmail: {type: String, required: true},
    userPassword: {type: String, required: true},
});

module.exports = mongoose.model('user', userSchema);