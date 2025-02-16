const cors = require('cors');
<<<<<<< HEAD
app.use(cors({ origin: "http://localhost:5173", credentials: true })
);


=======
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
>>>>>>> 48523a7 (Updated feature X with fixes)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "No record existed" });
    }
    if (user.password !== password) {
        return res.status(401).json({ message: "Incorrect password" });
    }
    res.json({ message: "Success" });
}

);


app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new EmployeeModel({ email, password });
    await newUser.save();
    res.json({ message: "User registered successfully" });
}
);