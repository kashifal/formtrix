import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardActions, CardContent, Checkbox, Divider, Fab, FormControlLabel, Grid, TextField, IconButton } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper function to make API requests
const api = (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    return fetch(`https://glowing-paradise-cfe00f2697.strapiapp.com/api${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    }).then((response) => response.json());
};

const ToDoList = ({ isLoading }) => {
    const [todos, setTodos] = useState([]);
    const [newTodoTitle, setNewTodoTitle] = useState('');

    useEffect(() => {
        api('/todos').then((data) => {
            if (data.data) {
                setTodos(data.data);
            } else {
                console.error('Unexpected API response format');
                setTodos([]); // Set todos to an empty array as a fallback
            }
        });
    }, []);

    const addTodo = () => {
        api('/todos', 'POST', {
            data: {
                title: newTodoTitle,
                completed: false
            }
        })
            .then((newTodo) => {
                if (newTodo.data) {
                    setTodos([...todos, newTodo.data]);
                    setNewTodoTitle('');
                }
            })
            .catch((error) => console.error('Failed to add todo:', error));
    };

    const toggleTodo = (id, completed) => {
        api(`/todos/${id}`, 'PUT', {
            data: {
                completed: !completed
            }
        })
            .then((updatedTodo) => {
                if (updatedTodo.data) {
                    const newTodos = todos.map((todo) => (todo.id === id ? { ...todo, attributes: updatedTodo.data.attributes } : todo));
                    setTodos(newTodos);
                }
            })
            .catch((error) => console.error('Failed to update todo:', error));
    };

    const deleteTodo = (id) => {
        api(`/todos/${id}`, 'DELETE').then(() => {
            const newTodos = todos.filter((todo) => todo.id !== id);
            setTodos(newTodos);
        });
    };

    return (
        <MainCard title="To Do List" content={false}>
            <CardContent>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <Grid container spacing={2}>
                        {todos.map((todo) => (
                            <Grid item xs={12} key={todo.id}>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={todo.attributes.completed}
                                                    onChange={() => toggleTodo(todo.id, todo.attributes.completed)}
                                                    name={`checked-${todo.id}`}
                                                    color="primary"
                                                />
                                            }
                                            label={todo.attributes.title}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={() => deleteTodo(todo.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="New To Do"
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTodoTitle.trim() !== '') {
                                        addTodo();
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                )}
            </CardContent>
            <Divider />
            <CardActions>
                <Grid container direction="row-reverse">
                    <Grid item>
                        <Fab size="small" color="primary" aria-label="add" onClick={() => newTodoTitle.trim() !== '' && addTodo()}>
                            <AddRoundedIcon />
                        </Fab>
                    </Grid>
                </Grid>
            </CardActions>
        </MainCard>
    );
};

ToDoList.propTypes = {
    isLoading: PropTypes.bool.isRequired
};

export default ToDoList;
