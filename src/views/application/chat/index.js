import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Typography, Grid, Container } from '@mui/material';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies/')
      .then(response => response.json())
      .then(data => {
        setCompanies(data.data);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }, []);

  const getImageUrl = (website) => {
    // Assuming logos are stored in the public/images folder and all logos are in png format
    return website ? `images/${website}.png` : 'images/default.png'; // Provide a default image if logo URL is not available
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Grid container spacing={4}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={getImageUrl(company.attributes.website)}
                alt={`${company.attributes.name} Logo`}
                sx={{ paddingTop: '56.25%' }} // 16:9 Aspect Ratio
              />
              <Typography gutterBottom variant="h6" component="div" sx={{ padding: 2 }}>
                {company.attributes.name}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CompaniesList;
