import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home';
import RepositoryPage from '../pages/Repository';
import client from '../shared/api/github';

const App: React.FC = () => (
  <ApolloProvider client={client}>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repository/:owner/:name" element={<RepositoryPage />} />
      </Routes>
    </Router>
  </ApolloProvider>
);

export default App;
