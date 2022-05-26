require('dotenv').config()
const express = require('express')
const { json } = require('express/lib/response')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const res = require('express/lib/response')

app.use(cors())

app.use(express.json())

app.use(express.static('build'))

morgan.token('bod', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bod'))

// let persons = 
// [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

// const randomId = () => Math.floor(Math.random() * 10000)

app.put('/api/persons/:id',(request,response,next) => {
    // const body = request.body
    const { name, number } = request.body

    // const person = {
    //     name: body.name,
    //     number: body.number
    // }
    Person
    .findByIdAndUpdate(
        request.params.id,
        {name, number},
        { new: true, runValidators: true, context: 'query' }
        )
    .then(updated => {response.json(updated)})
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request,response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)

    // if(person){
    //     response.json(person)
    // }else{
    //     response.status(404).end()
    // }

    Person
    .findById(request.params.id)
    .then(person =>{
        if (person) {
            response.json(person)
        }else{
            response.status(404).end()
        }
        })
    .catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
    const body = request.body
    
    if(!body.name){
        return response.status(400).json({
            error: "name missing"
        })
    }else if (!body.number){
        return response.status(400).json({
            error: "number missing"
        })
    // }else if (Person.some(val => body.name === val.name)){
    //     return response.status(400).json({
    //         error: "name must be unique"
    //     })   
    }
    const person = new Person({
        name: body.name,
        number: body.number,
        // id: randomId(),
    })

    // persons = persons.concat(person)

    // response.json(person)
    person.save()
    .then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
    Person.findByIdAndDelete(request.params.id,)
    .then(result => {
        if (result) {
            response.status(204).end()
        }else{
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
      })
  })

app.get('/info', (request, response, next) => {
    const date = new Date()
    Person.find({})
    .then(people => response.send(`<p>Phonebook has info for ${people.length} people </p> 
    <p> ${date} </p>`))
    .catch(error => next(error))
    
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
    next(error)
  }

app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})