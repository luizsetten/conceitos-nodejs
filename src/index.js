const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) return response.status(404).json({ errror: "User not found!" });

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const user = {
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists) return response.status(400).json({ error: "Username already exists!" });

  users.push(user);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(201).send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const todo = {
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
  };

  todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    body: { title, deadline },
    params: { id }
  } = request;

  const todo = todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "Todo not found!"});

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    params: { id }
  } = request;

  const todo = todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "Todo not found!"});

  todo.done = true;

  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    params: { id }
  } = request;

  const index = todos.findIndex(todo => todo.id === id);
  todos.splice(index, 1);

  if(index === -1) return response.status(404).json({ error: "Todo not found!"});

  return response.status(204).send();
});

module.exports = app;