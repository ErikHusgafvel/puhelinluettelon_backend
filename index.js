require('dotenv').config()
const { request, response } = require('express')
const express = require('express')
const cors = require('cors')
const Person = require('./models/person')
var morgan = require('morgan')


morgan.token('json', function stringifyJson(request) {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    }
    return " "
})

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :json'))

/*
let persons = [
    {
        id : 1, 
        name: "Arto Hellas", 
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    }, 
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]
*/

/*
app.get('/', (request, response) => {
    response.status(200).send('<h1>Hello world!</h1>')
})
*/

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.status(200).json(persons)
    })
    
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        const len = persons.length
        response.status(200).send(`<div><p>Phonebook has info for ${len} people.</p><p>${Date(Date.now())}</p></div>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.status(200).json(person)
        } else {
            response.status(404).end()
        }        
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } 
    
    if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.status(200).json(updatedPerson)
        })
        .catch(error => next(error))
})

/*
const generateId = () => {
    return Math.floor(Math.random()*1000)
}
*/

app.post('/api/persons', (request, response) => {
    
    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } 
    
    if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    /*
    const unique = persons.find(person => person.name === body.name)

    if(unique) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    */

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    
    person.save().then(savedPerson => {
        response.status(200).json(savedPerson)
    })   
})

const unknownEndpoint = (req, res) => {
    response.status(404).json({
        error: 'unknown endpoint'
    })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})