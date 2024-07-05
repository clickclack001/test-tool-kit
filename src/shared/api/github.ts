import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  headers: {
    authorization: `Bearer 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`,
  },
  cache: new InMemoryCache(),
});

export default client;
