const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const EmployeeModel = mongoose.model("Employee", EmployeeSchema);
module.exports = EmployeeModel;
