import React, { useState, useEffect } from 'react';
import { Autocomplete, Grid, TextField, Button, Box, Select, MenuItem, Link } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

const InductionModule = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [textCheckBox, setTextCheckBox] = useState('');
    const [quizElement, setQuizElement] = useState('');
    const [checkboxElement, setCheckboxElement] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [pdfElement, setPdfElement] = useState('');
    const [pdfs, setPdfs] = useState([]);

    useEffect(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
            .then((response) => response.json())
            .then((data) => {
                setPages(
                    data.data.map((page) => ({
                        label: page.attributes.Title,
                        id: page.id,
                        title: page.attributes.Title,
                        text: page.attributes.text,
                        textCheckBox: page.attributes.TextCheckBox,
                        quizElement: page.attributes.QuizElement || '',
                        checkboxElement: page.attributes.CheckboxElement,
                        pdfElement: page.attributes.PdfElement || '',
                        link: getLink(page.attributes.Title)
                    }))
                );
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/quizzes/')
            .then((response) => response.json())
            .then((data) => {
                setQuizzes(
                    data.data.map((quiz) => ({
                        id: quiz.id,
                        question: quiz.attributes.Question
                    }))
                );
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/pdfs/')
            .then((response) => response.json())
            .then((data) => {
                setPdfs(
                    data.data.map((pdf) => ({
                        id: pdf.id,
                        pdfname: pdf.attributes.pdfname
                    }))
                );
            });
    }, []);

    const getLink = (title) => {
        switch (title) {
            case 'About the Fox Group':
                return 'https://induction.vercel.app/intro-page';
            case 'Fox Group Policies':
                return 'https://induction.vercel.app/sign';
            case 'Equality and Diversity':
                return 'https://induction.vercel.app/quiz';
            case 'The Environment':
                return 'https://induction.vercel.app/EnvironmentPage';
            case 'Induction Complete':
                return 'https://induction.vercel.app/ThankYouPage';
            default:
                return 'https://induction.vercel.app/?code=a78c4e2c-758f-4df0-8e63-6316921ac7d8';
        }
    };

    const handlePageChange = (event, newValue) => {
        setSelectedPage(newValue);
        if (newValue) {
            setTitle(newValue.title);
            setText(newValue.text);
            setTextCheckBox(newValue.textCheckBox);
            setQuizElement(newValue.quizElement || '');
            setCheckboxElement(newValue.checkboxElement);
            setPdfElement(newValue.pdfElement || '');
        } else {
            setTitle('');
            setText('');
            setTextCheckBox('');
            setQuizElement('');
            setCheckboxElement('');
            setPdfElement('');
        }
    };

    const handleSubmit = async () => {
        const url = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/${selectedPage.id}`;

        const body = JSON.stringify({
            data: {
                Title: title,
                text: text,
                TextCheckBox: textCheckBox,
                QuizElement: quizElement,
                CheckboxElement: checkboxElement,
                PdfElement: pdfElement
            }
        });

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });

            const responseData = await response.json();
            console.log('Success:', responseData);
            const updatedPages = pages.map((p) =>
                p.id === selectedPage.id ? { ...p, title, text, textCheckBox, quizElement, checkboxElement, pdfElement } : p
            );
            setPages(updatedPages);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <MainCard title="Edit the Induction">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SubCard title="Select Page">
                        <Autocomplete
                            disableClearable
                            options={pages}
                            getOptionLabel={(option) => option.label}
                            onChange={handlePageChange}
                            renderInput={(params) => <TextField {...params} label="Select Page" />}
                        />
                    </SubCard>
                </Grid>

                {selectedPage && (
                    <Grid item xs={12}>
                        <SubCard title="Page Content">
                            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
                            <TextField
                                label="Text"
                                fullWidth
                                multiline
                                rows={4}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                label="Text Check Box"
                                fullWidth
                                value={textCheckBox}
                                onChange={(e) => setTextCheckBox(e.target.value)}
                                sx={{ mt: 2 }}
                            />

                            <Select
                                label="Quiz Element"
                                fullWidth
                                value={quizElement}
                                onChange={(e) => setQuizElement(e.target.value)}
                                sx={{ mt: 2 }}
                            >
                                <MenuItem value="">No Quiz</MenuItem>
                                {quizzes.map((quiz) => (
                                    <MenuItem key={quiz.id} value={quiz.question}>
                                        {quiz.question}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Select
                                label="PDF Element"
                                fullWidth
                                value={pdfElement}
                                onChange={(e) => setPdfElement(e.target.value)}
                                sx={{ mt: 2 }}
                            >
                                <MenuItem value="">No PDF</MenuItem>
                                {pdfs.map((pdf) => (
                                    <MenuItem key={pdf.id} value={pdf.pdfname}>
                                        {pdf.pdfname}
                                    </MenuItem>
                                ))}
                            </Select>
                            {selectedPage && (
                                <Link href={selectedPage.link} target="_blank" sx={{ mt: 2 }}>
                                    View Page
                                </Link>
                            )}
                        </SubCard>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!selectedPage}>
                            Save Changes
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                setSelectedPage(null);
                                setTitle('');
                                setText('');
                                setTextCheckBox('');
                                setQuizElement('');
                                setCheckboxElement('');
                                setPdfElement('');
                            }}
                        >
                            Clear
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default InductionModule;
