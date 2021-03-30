const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "Username not found!"});
  }
  request.user = user;
  return next();
}



app.post('/users', (request, response) => {
  const {name, username } = request.body;
  const usernameAlreadyExists = users.some((user) => user.username === username);

  if(usernameAlreadyExists) {
    return response.status(400).json({error: "Username already being used!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);


});

app.get('/todos',checksExistsUserAccount , (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);

});

app.post('/todos',checksExistsUserAccount , (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id:uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id',checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline} = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id ===id);

  if(!todo) {
    return response.status(404).json({error: "To Do not found!"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
  
});

app.patch('/todos/:id/done',checksExistsUserAccount , (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id ===id);

  if(!todo) {
    return response.status(404).json({error: "To Do not found!"});
  }

  todo.done = true;

  return response.json(todo);


});

app.delete('/todos/:id',checksExistsUserAccount , (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id ===id);

  if(!todo) {
    return response.status(404).json({error: "To Do not found!"});
  }

  user.todos.splice(todo.id,1);

  return response.status(204).json();
});

module.exports = app;