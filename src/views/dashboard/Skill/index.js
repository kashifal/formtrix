import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Grid, Card, CardContent, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

const EmployeeBySkill = () => {
  const { skillId, companyId } = useParams();
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?filters[skills][id][$eq]=${skillId}&populate=*`
        );
        const data = await response.json();
        setEmployeeData(data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [skillId, companyId]);

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Grid>
    );
  }

  if (employeeData.length === 0) {
    return (
      <Grid container justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h4">No employees found for the selected skill</Typography>
      </Grid>
    );
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="div">
                Employees with Skill
              </Typography>
              <List>
                {employeeData.map((employee) => (
                  <ListItem key={employee.id}>
                    <ListItemText
                      primary={employee.attributes.fullname}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Job Title: {employee.attributes.jobtitle}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Email: {employee.attributes.email}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default EmployeeBySkill;