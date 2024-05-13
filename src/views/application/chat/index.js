import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Typography, Grid, Container } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('https://glowing-paradise-cfe00f2697.strapiapp.com/api/companies?populate=*');
        if (response.data && response.data.data) {
          setCompanies(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  const getLogoUrl = (company) => {
    if (company.attributes.logo && company.attributes.logo.data && company.attributes.logo.data.length > 0) {
      const logoAttributes = company.attributes.logo.data[0].attributes;
      const logoFormats = logoAttributes.formats;

      if (logoFormats) {
        if (logoFormats.medium) {
          return logoFormats.medium.url;
        } else if (logoFormats.small) {
          return logoFormats.small.url;
        } else if (logoFormats.thumbnail) {
          return logoFormats.thumbnail.url;
        }
      }

      return logoAttributes.url;
    }
    return ''; // Return empty string or a default placeholder image URL if no logo is available
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Grid container spacing={4}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Link to={`/dashboard/training/${company.id}`}> 
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {company.attributes.logo && company.attributes.logo.data && company.attributes.logo.data.length > 0 && (
                  <CardMedia
                    component="img"
                    image={getLogoUrl(company)}
                    alt={`${company.attributes.name} Logo`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '140px',
                      objectFit: 'contain',
                      margin: 'auto',
                    }}
                  />
                )}
                <Typography gutterBottom variant="h6" component="div" sx={{ padding: 2 }}>
                  {company.attributes.name}
                </Typography>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CompaniesList;
