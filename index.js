const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

// middleware
app.use(express.json())
app.use(
  cors({
      origin: ['http://localhost:5173', 'http://localhost:5173', 'https://enmmedia-19300.web.app'],
      credentials: true,
  }),
)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wal4hcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    const jobsCollection = client.db('jobsphere').collection('jobs')
    const applyJobsCollection = client.db('jobsphere').collection('appliedJobs')

       // get all documents for job page
       app.get('/jobs', async(req,res)=>{
        const result = await jobsCollection.find().toArray()
        res.send(result)
      })

       // get single document for job details dynamic page
       app.get('/job/:id', async(req, res)=>{
         const id = req.params.id
         const query = {_id: new ObjectId(id)}
         const result = await jobsCollection.findOne(query)
         res.send(result)
       })


        // save applied jobs data on database
        app.post('/appliedJobs', async(req, res)=>{
          const appliedJobsData = req.body
          // console.log(appliedJobsData);
          const result = await applyJobsCollection.insertOne(appliedJobsData)
          res.send(result)
        })







    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })