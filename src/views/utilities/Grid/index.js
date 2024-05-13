import React, { useState, useEffect } from 'react';
import {
  Autocomplete, Grid, TextField, Button, Box
} from '@mui/material'; // Removed 'Link' from imports

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const TrainingModule = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [page, setPage] = useState('');
    const [texts, setTexts] = useState([]);
    const [selectedText, setSelectedText] = useState({ title: '', text: '', id: null });
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/projects/')
            .then(response => response.json())
            .then(data => {
                setProjects(data.data.map(proj => ({
                    label: proj.attributes.Project,
                    id: proj.id
                })));
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
            .then(response => response.json())
            .then(data => {
                setTexts(data.data.map(text => ({
                    label: text.attributes.Title,
                    id: text.id,
                    title: text.attributes.Title,
                    text: text.attributes.text
                })));
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/video-pages/')
            .then(response => response.json())
            .then(data => {
                setVideos(data.data.map(video => ({
                    label: video.attributes.VideoName,
                    id: video.id,
                    URL: video.attributes.URL,
                    Description: video.attributes.Description
                })));
            });
    }, []);

    const handleTextSelectionChange = (event, newValue) => {
        if (!newValue) {
            setSelectedText({ title: '', text: '', id: null });
            setTitle('');
            setText('');
        } else if (newValue.id === 'new') {
            setSelectedText({ title: '', text: '', id: 'new' });
            setTitle('');
            setText('');
        } else {
            setSelectedText(newValue);
            setTitle(newValue.title);
            setText(newValue.text);
        }
    };

    const handleSubmit = async () => {
        const url = selectedText.id === 'new'
            ? 'https://glowing-paradise-cfe00f2697.strapiapp.com/api/new-texts/'
            : `https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/${selectedText.id}`;

        const method = selectedText.id === 'new' ? 'POST' : 'PUT';
        const body = JSON.stringify({
            data: {
                Title: title,
                text: text
            }
        });

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });

            const responseData = await response.json();
            console.log('Success:', responseData);
            if (selectedText.id === 'new') {
                setTexts([...texts, { ...responseData.data, label: responseData.data.Title, id: responseData.data.id }]);
            } else {
                const updatedTexts = texts.map(t => t.id === selectedText.id ? { ...t, title, text } : t);
                setTexts(updatedTexts);
            }
            setSelectedText(null);
            setTitle('');
            setText('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <MainCard title="Training Module">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SubCard title="Select Project (in progress)">
                        <Autocomplete
                            disableClearable
                            options={projects}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, newValue) => setSelectedProject(newValue)}
                            renderInput={(params) => <TextField {...params} label="Select Project" />}
                        />
                        <TextField
                            label="Page Number"
                            type="number"
                            fullWidth
                            value={page}
                            onChange={(e) => setPage(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </SubCard>
                </Grid>

                {selectedProject && (
                    <Grid item xs={12}>
                        <SubCard title="Project Text">
                            <Autocomplete
                                options={texts.concat({ label: 'Create new', id: 'new' })}
                                getOptionLabel={(option) => option.label || ''}
                                onChange={handleTextSelectionChange}
                                renderInput={(params) => <TextField {...params} label="Select or Create Text" />}
                                value={selectedText}
                            />
                            <TextField
                                label="Title"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Text"
                                fullWidth
                                multiline
                                rows={4}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                        </SubCard>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Save Changes</Button>
                        <Button variant="contained" color="secondary" onClick={() => { setTitle(''); setText(''); setSelectedText(null); }}>Clear</Button>
                    </Box>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default TrainingModule;
