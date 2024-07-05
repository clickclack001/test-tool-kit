import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { createStore, createEvent } from 'effector';
import { useStore } from 'effector-react';
import { debounce } from '../../shared/utils/debounce';
import './HomePage.css';  // Импортируем стили

const SEARCH_REPOS = gql`
  query SearchRepos($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      edges {
        node {
          ... on Repository {
            name
            stargazerCount
            updatedAt
            url
            owner {
              login
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const updateSearchQuery = createEvent<string>();
const searchQueryStore = createStore<string>('')
  .on(updateSearchQuery, (_, newQuery) => newQuery);

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useStore(searchQueryStore);
  const [page, setPage] = useState(1);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const { loading, error, data, fetchMore, refetch } = useQuery(SEARCH_REPOS, {
    variables: { query: debouncedQuery, first: 10, after: afterCursor },
    skip: debouncedQuery === ''
  });

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    updateSearchQuery(searchQuery);
    setDebouncedQuery(searchQuery);
  }, [searchParams]);

  const debouncedUpdateSearchQuery = useCallback(
    debounce((newQuery: string) => {
      setDebouncedQuery(newQuery);
    }, 300),
    []
  );

  useEffect(() => {
    if (debouncedQuery !== '') {
      refetch({ query: debouncedQuery, first: 10, after: null });
    }
  }, [debouncedQuery, refetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchParams(newQuery ? { q: newQuery } : {});
    updateSearchQuery(newQuery);
    debouncedUpdateSearchQuery(newQuery);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > page && data?.search.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: data.search.pageInfo.endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          return fetchMoreResult ? fetchMoreResult : prevResult;
        },
      }).then(() => {
        setPage(newPage);
        setAfterCursor(data.search.pageInfo.endCursor);
      });
    } else {
      setPage(newPage);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search repositories"
      />
      <ul>
        {data?.search.edges.map(({ node }: any) => (
          <li key={node.url}>
            <Link to={`/repository/${node.owner.login}/${node.name}`}>
              {node.name}
            </Link>
            <span>{node.stargazerCount} stars</span>
            <span>last updated {new Date(node.updatedAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {[...Array(10).keys()].map(i => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={i + 1 === page ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
