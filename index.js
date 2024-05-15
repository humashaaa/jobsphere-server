const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

// middleware
app.use(express.json())
app.use(
  cors({
      origin: ['https://assignment-11-4768a.web.app', 'https://assignment-11-4768a.firebaseapp.com', 'http://localhost:5173'],
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
         
    
    // jwt generate
    app.post('/jwt', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

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

        // save a job data on database
        app.post('/job', async(req, res)=>{
          const addJobData = req.body
          console.log(addJobData);
          const result = await jobsCollection.insertOne(addJobData)
          res.send(result)
        })

        // get all jobs posted by a specific user
        app.get('/jobs/:email', async(req, res)=>{
          const email = req.params.email
          const query = {'buyer.email': email}
          const result = await jobsCollection.find(query).toArray()
          res.send(result)
        })

        // update a job in db
        app.put('/job/:id', async(req, res)=>{
          const id = req.params.id
          const jobData = req.body
          const query = {_id: new ObjectId(id)}
          const options = {upsert: true}
          const updateDoc = {
            $set : {
              ...jobData,
            }
          }
          const result = await jobsCollection.updateOne(query, updateDoc, options)
          res.send(result)


        })

        // delete a job from db
        app.delete('/job/:id', async(req, res)=>{
          const id = req.params.id
          const query = {_id: new ObjectId(id)}
          const result = await jobsCollection.deleteOne(query)
          res.send(result)
        })


         // get all applied jobs posted by a specific user
         app.get('/appliedJobs/:email', async(req, res)=>{
          const email = req.params.email
          const filter = req.query.filter
          let query = {}
          if(filter) query={category:filter, email}
          console.log(query);

          const result = await applyJobsCollection.find(query).toArray()
          res.send(result)
        })

         // get all applied jobs from db for job owner
         app.get('/jobRequest/:email', async(req, res)=>{
          const email = req.params.email
          const query = { 'buyer.email':email}

          const result = await applyJobsCollection.find(query).toArray()
          res.send(result)
        })

        // update job request status
        app.patch('/myJob/:id', async(req, res)=>{
          const id = req.params.body
          const status = req.body
          const query = {_id: new ObjectId(id)}
          const updateDoc = {
            $set : status,
          }
          const result = await applyJobsCollection.updateOne(query, updateDoc)
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