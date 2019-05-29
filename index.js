const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const basicAuth = require('express-basic-auth');

const app = express()
app.use(morgan("dev"))
app.use(express.json())

// servo i file statici nella cartella "www"
app.use( express.static("./www") )

let corsConfig = {
    //methods: "GET,POST,DELETE",
    origin: "http://localhost:*"
}
app.use( cors(corsConfig) )


const database = require('./database')


// ----------------------------------------
// ROUTES RESTful

// /appuntamenti[/id]
app.get( '/appuntamenti',
    (req, res) => {               // GET ALL
  database.getAllAppuntamenti( (app) => {
    res.status(200).json(  { appuntamenti: app } )
  })
})
app.get( '/appuntamenti/:id', (req, res) => {           // GET ONE
  database.getAppuntamento(req.params.id, (app) => {
    if (typeof app === "undefined")
      res.status(404).json( { "Error": "Appuntamento not found" } )
    else
      res.status(200).json( { appuntamento: app } )
  })

})
app.post( '/appuntamenti', (req, res) => {              // CREATE ONE
  database.inserisciAppuntamento(req.body, () =>  {
    res.status(201).json(  { appuntamento: req.body } )
  })
})
app.delete( '/appuntamenti/:id', (req, res) => {        // DELETE ONE
  database.deleteAppuntamento(req.params.id, () => {
    res.status(204).end()
  })
})

// aziende
app.get( '/aziende', (req, res) => {
  database.getAllAzienda( (aziende) => {
    res.status(200).json(  { aziende: aziende } )
  })
})

app.get( '/aziende/:id', (req, res) => {
  database.getAzienda( req.params.id,  (az) => {
    if ( typeof az === 'undefined' )
      res.status(404).json( { "Error": "Azienda not found" } )
    else
      res.status(200).json( { azienda: az } )
  })
})

app.post( '/aziende', (req, res) => {
  //throw new Error("PAPPAPPERO")
  database.inserisciAzienda( req.body, (err) => {
    if (err) throw err
    res.status(201).json( { azienda: req.body } )
  })
})

app.delete( '/aziende/:id', (req, res) => {
  database.deleteAzienda(req.params.id, ()=>{
    res.status(204).end()
  })
})

app.use( (req, res) => {
    res.status(404).json( {"Error": "not found"} )
})

app.use( (err, req, res, next) => {
  console.error("ERRORE:", err.message)
  res.status(500).json( {"Error": err.message} )
})

database.connetti( () => {
  app.listen(8000, () => {
    console.log("PARTENZA!")
  })
})
