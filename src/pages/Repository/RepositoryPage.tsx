import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import './RepositoryPage.css';

const GET_REPOSITORY = gql`
  query GetRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      description
      stargazerCount
      owner {
        login
        avatarUrl
        url
      }
      languages(first: 10) {
        nodes {
          name
        }
      }
    }
  }
`;

const RepositoryPage: React.FC = () => {
  const { owner, name } = useParams<{ owner: string; name: string }>();

  const { loading, error, data } = useQuery(GET_REPOSITORY, {
    variables: { owner, name },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const repository = data.repository;

  return (
    <div className="container">
      <div className="repository-header">
        <img src={repository.owner.avatarUrl} alt="Owner Avatar" />
        <h1>{repository.name}</h1>
        <a href={repository.owner.url} target="_blank" rel="noopener noreferrer">{repository.owner.login}</a>
        <span>{repository.stargazerCount} stars</span>
      </div>
      <p className="repository-description">{repository.description}</p>
      <div className="languages">
        {repository.languages.nodes.map((lang: any) => (
          <span key={lang.name}>{lang.name}</span>
        ))}
      </div>
    </div>
  );
};

export default RepositoryPage;
