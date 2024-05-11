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

       // get all documents for job page
       app.get('/jobs', async(req,res)=>{
        const result = await jobsCollection.find().toArray()
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