const express = require('express')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 4001
require('dotenv').config()

const app = express()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ruwh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(express.static('doctors'));
app.use(fileUpload());




app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("Tooth-Care").collection("appointments");
    const doctorCollection = client.db("Tooth-Care").collection("doctors");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});




app.listen(port)











