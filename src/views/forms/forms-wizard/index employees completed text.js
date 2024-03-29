import React, { useEffect, useState } from 'react';

const InductionProgress = () => {
  const [employees, setEmployees] = useState([]);
  const [inductionPages, setInductionPages] = useState([]);

  useEffect(() => {
    // Fetch employee data
    fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/employees?fields[0]=id&fields[1]=inductionProgress')
      .then(response => response.json())
      .then(data => setEmployees(data.data))
      .catch(error => console.error('Error fetching employees:', error));

    // Fetch induction pages
    fetch('https://glowing-paradise-cfe00f2697.strapiapp.com/api/texts/')
      .then(response => response.json())
      .then(data => setInductionPages(data.data))
      .catch(error => console.error('Error fetching induction pages:', error));
  }, []);

  // Count the number of employees who have completed each stage
  const getCompletionCount = (stage) => {
    return employees.filter(employee => employee.attributes.inductionProgress >= stage).length;
  };

  return (
    <div>
      <h2>Induction Progress</h2>
      <ul>
        {inductionPages.map(page => (
          <li key={page.id}>
            {page.attributes.Title}
            <span> - Completed by {getCompletionCount(page.attributes.Order)} employees</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InductionProgress;