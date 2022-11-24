const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config() ;
const app = express()

const port = process.env.PORT || 5000 ;

//midler awere;

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o15tjkl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

        try{
          
              const categoriesCollection = client.db('carResaledb').collection('categories')
              const microbusCollection = client.db('carResaledb').collection('microbus')
              const LexserysCollection = client.db('carResaledb').collection('Lexserys')
              const electicsCollection = client.db('carResaledb').collection('electics')
              

              app.get('/categories',async(req,res)=>{

                      const query = {}
                      const result = await categoriesCollection.find(query).toArray()
                      res.send(result)
              })
             
               
            }

        finally{

        }
}

run().catch(console.dir);
     



app.get('/', async(req,res)=>{

    res.send('Car Resale started ... ')
})

app.listen(port , ()=>{

      console.log(`car resale running on  ${port}`)
})