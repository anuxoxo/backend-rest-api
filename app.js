require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// ------------------- Connect to Local mongoDB -----------------
mongoose.connect('mongodb://localhost:27017/courseDB', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Successfully connected to database');
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const app = express();

var PORT = process.env.PORT;
if (PORT == "" || PORT == null) {
    PORT = 5000;
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use("/public", express.static('public'));

const courseSchema = new mongoose.Schema({
    name: String,
    price: Number,
    hours: Number
});

const Course = mongoose.model('Course', courseSchema);

app.route('/')
    .get((req, res) => {
        Course.find((err, courses) => {
            if (err) return res.send(err.message);
            res.send(courses);
        });
    })
    .post((req, res) => {
        const { name, price, hours } = req.body;
        if (name && price && hours) {
            const newCourse = new Course({
                name: name,
                price: price,
                hours: hours
            });

            newCourse.save((err) => {
                if (err)
                    res.send(err.message);
                else
                    res.send("Course successfully added!");
            });
        }
        else {
            res.send("Please enter all the fields.");
        }
    })
    .delete((req, res) => {
        Course.deleteMany((err) => {
            if (err) res.send(err.message);
            else res.send("Successfully deleted the all Courses!");
        });
    });

app.route('/:name')
    .get((req, res) => {
        const requestedName = req.params.name;
        Course.findOne({ name: new RegExp(`^${requestedName}$`, 'i') }, (err, course) => {
            if (course) res.send(course);
            else res.send("Course not found!");
        });
    })
    .patch((req, res) => {
        Course.update({ name: req.params.name },
            { $set: req.body },
            (err) => {
                if (err)
                    res.send(err.message);
                else
                    res.send("Successfully updated!");

            });
    })
    .delete((req, res) => {
        Course.deleteOne({ name: req.params.name },
            (err) => {
                if (err)
                    res.send(err.message);
                else
                    res.send("Successfully deleted!");
            });
    });


app.listen(PORT, () => console.log(`Server running at port ${PORT}: http://localhost:${PORT}/`))