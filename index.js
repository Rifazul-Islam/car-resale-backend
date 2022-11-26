const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
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
              const allProductCollection = client.db('carResaledb').collection('products')
              const usersCollection = client.db('carResaledb').collection('users')
              const bookingsCollection = client.db('carResaledb').collection('bookings')
           
              app.get('/categories',async(req,res)=>{

                      const query = {}
                      const result = await categoriesCollection.find(query).toArray()
                      res.send(result)
              })


               app.get('/categories/:id',async(req,res)=>{

                  const id = req.params.id;
                  const filter ={_id:ObjectId(id)}
                  const category = await categoriesCollection.findOne(filter)
                  const query = {category:category.category}
                  const result = await allProductCollection.find(query).toArray()
                  res.send(result)
            })





             app.post('/users',async(req,res)=>{
                  const user = req.body;
                  const result = await usersCollection.insertOne(user);
                  res.send(result)
             })


             app.get('/users/buyer/:email',async(req,res)=>{

                  const email = req.params.email;
                   const query = {email}
                   const user = await usersCollection.findOne(query)
   
                   res.send({ isBuyer: user?.role === 'buyer'})
             })



             app.get('/users/seller/:email',async(req,res)=>{

                  const email = req.params.email;
                   const query = {email}
                   const user = await usersCollection.findOne(query)
   
                   res.send({ isSeller: user?.role === 'seller'})
             })


             


             app.post('/bookings',async(req,res)=>{
                  const booking = req.body;
                  const result = await bookingsCollection.insertOne(booking);
                  res.send(result)
             })


             app.get('/bookings', async (req,res)=>{
                  const email = req.query.email
                  const query = {email}
                   const result = await bookingsCollection.find(query).toArray()
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