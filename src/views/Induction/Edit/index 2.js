import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Box
} from '@mui/material'; // Removed 'Autocomplete' from imports

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const TrainingModule = () => {
    const [texts, setTexts] = useState([]);
    const [selectedText, setSelectedText] = useState({ title: '', text: '', id: null });
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
            .then(response => response.json())
            .then(data => {
                setTexts(data.data.map(text => ({
                    label: text.attributes.Title,
                    id: text.id,
                    title: text.attributes.Title,
                    text: text.attributes.text
                })));
                // Automatically select the text for "Induction"
                const inductionText = data.data.find(t => t.attributes.Title === "Induction");
                if (inductionText) {
                    setSelectedText({
                        title: inductionText.attributes.Title,
                        text: inductionText.attributes.text,
                        id: inductionText.id
                    });
                    setTitle(inductionText.attributes.Title);
                    setText(inductionText.attributes.text);
                }
            });
    }, []);

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
            // Update local state to reflect changes
            setTexts(texts.map(t => t.id === selectedText.id ? { ...t, title, text } : t));
            setSelectedText(null);
            setTitle('');
            setText('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <MainCard title="Edit Induction Content">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SubCard title="Induction Text">
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
