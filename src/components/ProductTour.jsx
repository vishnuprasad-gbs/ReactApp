import Joyride from 'react-joyride';
import React, { useState } from 'react';

function ProductTour() {
  const [run, setRun] = useState(true);

  const [steps] = useState([
    
    {
      target: '.step1',
      content: 'Let"s start the product tour',
    },
    {
      target: '.step2',
      content: 'This is latest saved location',
    },
    {
      target: '.step3',
      content: 'This is the chart for showing the travel path',  
    }, 
    {
      target: '.step4',
      content: 'Here you can generate quick reports',  
    },
    {
      target: '.step5',
      content: 'Here is the logout option',  
    },
     
  
  ]);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}          // Automatically moves to the next step
      scrollToFirstStep={false}   // Scrolls to the first step if needed
      showProgress={true}        // Shows step progress
      showSkipButton={true}      // Adds a skip button
    />
  );
}

export default ProductTour;
