import React, { useState, useEffect } from 'react';
import {
  Autocomplete, Grid, TextField, Button, Box, Select, MenuItem, Link, Card, CardContent, Typography, Snackbar, Alert
} from '@mui/material';

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
    const [quizOptions, setQuizOptions] = useState([]);
    const [quizCorrectAnswer, setQuizCorrectAnswer] = useState('');
    const [checkboxElement, setCheckboxElement] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [pdfElement, setPdfElement] = useState('');
    const [pdfContent, setPdfContent] = useState('');
    const [pdfs, setPdfs] = useState([]);
    const [videoElement, setVideoElement] = useState('');
    const [videos, setVideos] = useState([]);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
            .then(response => response.json())
            .then(data => {
                setPages(data.data.map(page => ({
                    label: page.attributes.Title,
                    id: page.id,
                    title: page.attributes.Title,
                    text: page.attributes.text,
                    textCheckBox: page.attributes.TextCheckBox,
                    quizElement: page.attributes.QuizElement || '',
                    checkboxElement: page.attributes.CheckboxElement,
                    pdfElement: page.attributes.PdfElement || '',
                    link: getLink(page.attributes.Title)
                })));
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/quizzes/')
            .then(response => response.json())
            .then(data => {
                setQuizzes(data.data.map(quiz => ({
                    id: quiz.id,
                    question: quiz.attributes.Question,
                    options: quiz.attributes.Options,
                    correct: quiz.attributes.Correct
                })));
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/pdfs/')
            .then(response => response.json())
            .then(data => {
                setPdfs(data.data.map(pdf => ({
                    id: pdf.id,
                    pdfname: pdf.attributes.pdfname,
                    pdfcontent: pdf.attributes.pdfcontent
                })));
            });

        fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/video-pages/')
            .then(response => response.json())
            .then(data => {
                setVideos(data.data.map(video => ({
                    id: video.id,
                    name: video.attributes.VideoName,
                    url: video.attributes.URL,
                    description: video.attributes.Description
                })));
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
            setPdfContent('');
            setQuizOptions([]);
            setQuizCorrectAnswer('');
            if (['About the Fox Group', 'Equality and Diversity', 'The Environment'].includes(newValue.title)) {
                const video = videos.find(v => v.name === newValue.title);
                setVideoElement(video ? video.url : '');
            } else {
                setVideoElement('');
            }

            if (newValue.title === 'Equality and Diversity') {
                const quiz = quizzes.find(q => q.question === newValue.quizElement);
                if (quiz) {
                    setQuizOptions(quiz.options);
                    setQuizCorrectAnswer(quiz.correct);
                }
            }
        } else {
            setTitle('');
            setText('');
            setTextCheckBox('');
            setQuizElement('');
            setCheckboxElement('');
            setPdfElement('');
            setPdfContent('');
            setQuizOptions([]);
            setQuizCorrectAnswer('');
            setVideoElement('');
        }
    };

    const handlePdfChange = (event) => {
        const selectedPdf = pdfs.find(pdf => pdf.pdfname === event.target.value);
        setPdfElement(event.target.value);
        setPdfContent(selectedPdf ? selectedPdf.pdfcontent : '');
    };

    const handleQuizChange = (event) => {
        const selectedQuiz = quizzes.find(quiz => quiz.question === event.target.value);
        setQuizElement(event.target.value);
        if (selectedQuiz) {
            setQuizOptions(selectedQuiz.options);
            setQuizCorrectAnswer(selectedQuiz.correct);
        } else {
            setQuizOptions([]);
            setQuizCorrectAnswer('');
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
                PdfElement: pdfElement,
                VideoElement: videoElement
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
            const updatedPages = pages.map(p => p.id === selectedPage.id ? { ...p, title, text, textCheckBox, quizElement, checkboxElement, pdfElement, videoElement } : p);
            setPages(updatedPages);

            // Update quizzes and PDFs separately if they were changed
            if (selectedPage.title === 'Equality and Diversity') {
                const quizUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/quizzes/${quizzes.find(q => q.question === quizElement).id}`;
                const quizBody = JSON.stringify({
                    data: {
                        Question: quizElement,
                        Options: quizOptions,
                        Correct: quizCorrectAnswer
                    }
                });
                await fetch(quizUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: quizBody
                });
            }

            if (selectedPage.title === 'Fox Group Policies') {
                const pdfUrl = `https://glowing-paradise-cfe00f2697.strapiapp.com/api/pdfs/${pdfs.find(p => p.pdfname === pdfElement).id}`;
                const pdfBody = JSON.stringify({
                    data: {
                        pdfcontent: pdfContent
                    }
                });
                await fetch(pdfUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: pdfBody
                });
            }

            setSuccessMessage(true);
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
                            <TextField
                                label="Title"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
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
                            <TextField
                                label="Text Check Box"
                                fullWidth
                                value={textCheckBox}
                                onChange={(e) => setTextCheckBox(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            
                            {selectedPage.title === 'Equality and Diversity' && (
                                <>
                                    <Select
                                        label="Quiz Element"
                                        fullWidth
                                        value={quizElement}
                                        onChange={handleQuizChange}
                                        sx={{ mt: 2 }}
                                    >
                                        <MenuItem value="">No Quiz</MenuItem>
                                        {quizzes.map(quiz => (
                                            <MenuItem key={quiz.id} value={quiz.question}>{quiz.question}</MenuItem>
                                        ))}
                                    </Select>
                                    {quizElement && (
                                        <>
                                            <TextField
                                                label="Quiz Question"
                                                fullWidth
                                                value={quizElement}
                                                onChange={(e) => setQuizElement(e.target.value)}
                                                sx={{ mt: 2 }}
                                            />
                                            {quizOptions.map((option, index) => (
                                                <TextField
                                                    key={index}
                                                    label={`Option ${index + 1}`}
                                                    fullWidth
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...quizOptions];
                                                        newOptions[index] = e.target.value;
                                                        setQuizOptions(newOptions);
                                                    }}
                                                    sx={{ mt: 2 }}
                                                />
                                            ))}
                                            <TextField
                                                label="Correct Answer"
                                                fullWidth
                                                value={quizCorrectAnswer}
                                                onChange={(e) => setQuizCorrectAnswer(e.target.value)}
                                                sx={{ mt: 2 }}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                            
                            {selectedPage.title === 'Fox Group Policies' && (
                                <>
                                    <Select
                                        label="PDF Element"
                                        fullWidth
                                        value={pdfElement}
                                        onChange={handlePdfChange}
                                        sx={{ mt: 2 }}
                                    >
                                        <MenuItem value="">No PDF</MenuItem>
                                        {pdfs.map(pdf => (
                                            <MenuItem key={pdf.id} value={pdf.pdfname}>{pdf.pdfname}</MenuItem>
                                        ))}
                                    </Select>
                                    {pdfElement && (
                                        <TextField
                                            label="PDF Content"
                                            fullWidth
                                            multiline
                                            rows={10}
                                            value={pdfContent}
                                            onChange={(e) => setPdfContent(e.target.value)}
                                            sx={{ mt: 2 }}
                                        />
                                    )}
                                </>
                            )}
                            
                            {(selectedPage.title === 'About the Fox Group' || selectedPage.title === 'Equality and Diversity' || selectedPage.title === 'The Environment') && (
                                <>
                                    <TextField
                                        label="Video URL"
                                        fullWidth
                                        value={videoElement}
                                        onChange={(e) => setVideoElement(e.target.value)}
                                        sx={{ mt: 2 }}
                                    />
                                    <Card sx={{ mt: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6" component="div">Video Preview</Typography>
                                            {videoElement && (
                                                <iframe
                                                    title={`video-preview-${selectedPage.title}`}
                                                    width="100%"
                                                    height="315"
                                                    src={videoElement.replace('watch?v=', 'embed/')}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}
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
                        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!selectedPage}>Save Changes</Button>
                        <Button variant="contained" color="secondary" onClick={() => { setSelectedPage(null); setTitle(''); setText(''); setTextCheckBox(''); setQuizElement(''); setCheckboxElement(''); setPdfElement(''); setPdfContent(''); setQuizOptions([]); setQuizCorrectAnswer(''); setVideoElement(''); }}>Clear</Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(false)}>
                <Alert onClose={() => setSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
                    Changes uploaded successfully!
                </Alert>
            </Snackbar>
        </MainCard>
    );
};

export default InductionModule;
