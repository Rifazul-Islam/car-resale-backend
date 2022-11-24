const express = require('express');
const cors = require('cors');
require('dotenv').config() ;

const app = express()

const port = process.env.PORT || 5000 ;

//midler awere;

app.use(cors())
app.use(express.json())

app.get('/', async(req,res)=>{

    res.send('Car Resale started ... ')
})

app.listen(port , ()=>{

      console.log(`car resale running on  ${port}`)
})