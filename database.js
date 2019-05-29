const sqlite3 = require('sqlite3');
const util = require('util');

const dbname = "appuntamenti.sqlite"

const q_create_1 = "CREATE TABLE IF NOT EXISTS aziende (      \
  id            INTEGER PRIMARY KEY,    \
  nome          TEXT, \
  descrizione   TEXT, \
  url           TEXT  \
)"
const q_create_2 = "CREATE TABLE IF NOT EXISTS appuntamenti ( \
  id            INTEGER PRIMARY KEY, \
  data          TEXT, \
  ora           TEXT, \
  azienda_id    INTEGER \
)"
const q_create_3 = "CREATE TABLE IF NOT EXISTS utenti ( \
  id            INTEGER PRIMARY KEY, \
  user          TEXT,  \
  password      TEXT \
)"
const q_insert_user = "INSERT INTO utenti (user, password) VALUES (?,?)"
const q_login = "SELECT * FROM utenti WHERE user=? AND password=?"

const q_insert_az = "INSERT INTO aziende (nome, descrizione, url) VALUES (?, ?, ?)"
const q_get_az = "SELECT * FROM aziende WHERE id=?"
const q_all_az = "SELECT * FROM aziende"
const q_del_az = "DELETE FROM aziende WHERE id=?"

const q_insert_app = "INSERT INTO appuntamenti (data, ora, azienda_id) VALUES (?, ?, ?)"
const q_get_app = "SELECT * FROM appuntamenti WHERE id=?"
const q_all_app = "SELECT * FROM appuntamenti"
const q_del_app = "DELETE FROM appuntamenti WHERE id=?"




let db = null

const connect0 =  ( cb ) => {
    db = new sqlite3.Database(dbname, cb)
}
const connect = util.promisify(connect0)

const dbrun = util.promisify( ( query, cb ) => {
  db.run( query, cb );
})
const dbrunParams = util.promisify( ( query, values, cb ) => {
  db.run( query, values, cb );
})



module.exports.connetti = async function( cb ) {
  try {
    await connect()
    await dbrun(q_create_1)
    await dbrun(q_create_2)
    await dbrun(q_create_3)
    await dbrunParams( q_insert_user, ["enrico", "1234"] )
    if ( typeof cb === 'function' )
      cb()
  }
  catch(err) { cb(err) }
}




module.exports.login = function( usr, psw, cb ) {
  db.get(q_login, [usr, psw], (err, risultato) => {
    if (err) throw err
    cb(risultato)
  })
}




module.exports.inserisciAzienda = function( az, cb ) {
  db.run(q_insert_az, [az.nome, az.descrizione, az.url], (err) =>{
      if (err) throw err
      cb()
  })
}

module.exports.getAzienda = function( id, cb ) {
  // in questo caso: provo a non passare dalle promises
  db.get(q_get_az, [id], (err, risultato) => {
    if (err) throw err
    cb(risultato)
  })
}

module.exports.getAllAzienda = function( cb ) {
  // in questo caso: provo a non passare dalle promises
  db.all(q_all_az, (err, risultato) => {
    if (err) throw err
    cb(risultato)
  })
}

module.exports.deleteAzienda = function( id, cb ) {
  db.run(q_del_az, [id], (err) => {
    if (err) throw err
    cb()
  })
}



module.exports.inserisciAppuntamento = function( app, cb ) {
  db.run(q_insert_app, [app.data, app.ora, app.azienda_id], (err) =>{
      if (err) throw err
      cb()
  })
}

module.exports.getAppuntamento = function( id, cb ) {
  db.get(q_get_app, [id], (err, appuntamento) => {
    if (err) throw err

    if (typeof appuntamento === 'undefined')
      return cb(undefined)

    db.get(q_get_az, [appuntamento.azienda_id], (err, azienda)=>{
      if (err) throw err

      appuntamento.azienda = azienda
      cb(appuntamento)
    })
  })
}

module.exports.getAllAppuntamenti = function( cb ) {
  db.all(q_all_app, (err, risultato) => {
    if (err) throw err
    cb(risultato)
  })
}

module.exports.deleteAppuntamento = function( id, cb ) {
  db.run(q_del_app, [id], (err) => {
    if (err) throw err
    cb()
  })
}



/*
CON LE CLASSICHE PROMISES
module.exports.connetti = function() {

  connect()
  .then( () => {
    return dbrun(q_create_1)
  })
  .then( () => {
    return dbrun(q_create_2)
  })
  .catch(  (err) => { throw err }  )
}
*/
