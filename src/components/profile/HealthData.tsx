
import React, { useState } from 'react';
import HealthDataDisplay from './HealthDataDisplay';

const HealthData = () => {
  const [healthData, setHealthData] = useState({
    gender: 'Female',
    age: '42',
    height: '5\'7"',
    weight: '152',
    diabetesType: 'Type 2'
  });
  
  return (
    <HealthDataDisplay 
      healthData={healthData}
      setHealthData={setHealthData}
    />
  );
};

export default HealthData;
