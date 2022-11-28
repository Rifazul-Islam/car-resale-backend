const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config() ;
const app = express()
const stripe = require("stripe")(process.env.STRIPE_SCRET_KEY);
const port = process.env.PORT || 5000 ;

//midler awere;

app.use(cors())
app.use(express.json())



   
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o15tjkl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function jwtverify(req,res,next){

      const headerAuth = req.headers.authorization
      if(!headerAuth){

           return res.status(401).send('authorization unaccess')
      }
      const token = headerAuth.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
          
          if(err) {

             return res.status(403).send({message:'forbidend accesss'})
          }
          req.decoded = decoded;
          next();

         })
 
 }






async function run(){

        try{
          
              const categoriesCollection = client.db('carResaledb').collection('categories')
              const allProductCollection = client.db('carResaledb').collection('products')
              const usersCollection = client.db('carResaledb').collection('users')
              const bookingsCollection = client.db('carResaledb').collection('bookings')
              const sellerProductsCollection = client.db('carResaledb').collection('sellerProducts')
              const paymentsCollection = client.db('carResaledb').collection('payments')
           

        //  get categories Api

              app.get('/categories',async(req,res)=>{

                      const query = {}
                      const result = await categoriesCollection.find(query).toArray()
                      res.send(result)
              })


         //  get categories data filter Api

               app.get('/categories/:id',async(req,res)=>{

                  const id = req.params.id;
                  const filter ={_id:ObjectId(id)}
                  const category = await categoriesCollection.findOne(filter)
                  const query = {category:category.category}
                  const result = await allProductCollection.find(query).toArray()
                  res.send(result)
            })




      //  get  users Api

             app.post('/users',async(req,res)=>{
                  const user = req.body;
                  const result = await usersCollection.insertOne(user);
                  res.send(result)
             })
             

             //  get check users role Api

             app.get('/users/buyer/:email',async(req,res)=>{

                  const email = req.params.email;
                   const query = {email}
                   const user = await usersCollection.findOne(query)
   
                   res.send({ isBuyer: user?.role === 'buyer'})
             })

     
             //  get check seller role Api

             app.get('/users/seller/:email',async(req,res)=>{

                  const email = req.params.email;
                   const query = {email}
                   const user = await usersCollection.findOne(query)
   
                   res.send({ isSeller: user?.role === 'seller'})
             })

              //  get check seller role Api

             app.get('/users/admin/:email',async(req,res)=>{

                   const email = req.params.email;
                   const query = {email}
                   const user = await usersCollection.findOne(query)
   
                   res.send({ isAdmin: user?.role === 'admin'})
             })



   
     //  get check seller role Api

     app.get('/users',async(req,res)=>{

      const query = {}
      const user = await usersCollection.find(query).toArray()

     const filter ={role:'seller'}
        
     const result = await usersCollection.find(filter).toArray()
    res.send(result)
      
})



       app.delete('/users/:id',async(req,res)=>{

           const id = req.params.id;
           const query={_id:ObjectId(id)}
           const seller = await usersCollection.deleteOne(query)
           res.send(seller)
      })


 //  get check seller role Api

 app.get('/buyers', jwtverify, async(req,res)=>{

      const query = {}
      const user = await usersCollection.find(query).toArray()

     const filter ={role:'buyer'}
        
     const result = await usersCollection.find(filter).toArray()
    res.send(result)
      
})


  // specing buyer delete 

app.delete('/buyers/:id',async(req,res)=>{

      const id = req.params.id;
      const query={_id:ObjectId(id)}
      const seller = await usersCollection.deleteOne(query)
      res.send(seller)
 })



        // get jwt created  

         app.get('/jwt',async(req,res)=>{

             const email  =req.query.email;
             const query = {email:email}
             const user = await usersCollection.findOne(query)

             if(user){
                  
                 const token = jwt.sign({email},process.env.ACCESS_TOKEN, {expiresIn:'7d'})

              return res.send({accessToken : token})
              }
              res.status(403).send({accessToken: ''})

      })

         
            // post bookings Api
            
             app.post('/bookings',async(req,res)=>{
                  const booking = req.body;
                  const result = await bookingsCollection.insertOne(booking);
                  res.send(result)
             })


             // get  Specefic email Api bookings 

             app.get('/bookings', jwtverify, async (req,res)=>{

                  const email = req.query.email;
                const decodedEmail = req.decoded.email;
                 
                   if( email !== decodedEmail){
                    
                      return res.status(403).send({message:'forbidden'})
                   }

                  
                  const query = {email:email}
                   const result = await bookingsCollection.find(query).toArray()
                   res.send(result)
                   
           })



             // get  Specefic  id  payment  Api 
           app.get('/bookings/:id',async(req,res)=>{

                   const id = req.params.id;
                   const query = {_id: ObjectId(id)}
                   const payment = await bookingsCollection.findOne(query)
                   res.send(payment)
           })

               
          // post Stripe  Api 

           app.post('/create-payment-intent', async(req,res)=>{

            const booking = req.body;
            const price = booking.price;
            const amount = price*100;

            const paymentIntent = await stripe.paymentIntents.create({
              
              currency: "usd",
               amount:amount,
               "payment_method_types": [
                 "card"
               ],

            });

            res.send({
              clientSecret: paymentIntent.client_secret,
            });
   })


    //   post payment methoad 

     app.post('/payments', async(req,res)=>{
      const payment = req.body;
       const result = await paymentsCollection.insertOne(payment)
       
        const id = payment.bookingId;
        const filter = {_id : ObjectId(id)}
         const updateDoc = {

              $set:{
                      
               paid: true,
               transactionId : payment.paymentIntent

              }
         }
       
         const updatedResult = await bookingsCollection.updateOne(filter,updateDoc)

       res.send(result)
}) 



    //   post sellerProducts methoad 
    
           app.post('/sellerProducts',async(req,res)=>{

                 const product = req.body;
                 const result = await sellerProductsCollection.insertOne(product)
                 const resul = await allProductCollection.insertOne(product)
                 res.send(result)
            
           })

                
     //   get sellerProducts methoad 

           app.get('/sellerProducts',async(req,res)=>{

            const query = {};
            const result = await sellerProductsCollection.find(query).toArray()
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