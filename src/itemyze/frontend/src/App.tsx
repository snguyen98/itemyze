import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [groups, setGroups] = useState<Dict[]>([]);
  useEffect(() => {
    fetch('/api')
    .then(res => res.json())
    .then(data => setGroups(data.data));
  }, []);

  groups.forEach(group => {
    console.log("ID: " + group.id + ", Name: " + group.name);
  });
  
  return (
    <div className="App">
      <select>
        <option value="-1">Please select a group</option>
        { groups.map(group => (
          <option value={ group.id }>{ group.name }</option>
        ))}
      </select>
    </div>
  );
}

interface Dict {
  [key: string]: string
}

export default App;
