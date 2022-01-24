const { request, response } = require('express')
const express = require('express')
const cors = require('cors')
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


app.get('/', (request, response) => {
    response.status(200).send('<h1>Hello world!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.status(200).json(persons)
})

app.get('/info', (request, response) => {
    const len = persons.length
    response.status(200).send(`<div><p>Phonebook has info for ${len} people.</p><p>${Date(Date.now())}</p></div>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.status(200).json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    //console.log(persons)
    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random()*1000)
}

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

    const unique = persons.find(person => person.name === body.name)

    if(unique) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }
    
    persons = persons.concat(person)

    response.status(200).json(person)
})

const unknownEndpoint = (req, res) => {
    response.status(404).json({
        error: 'unknown endpoint'
    })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})