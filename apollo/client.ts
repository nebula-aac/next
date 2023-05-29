import { ApolloClient, InMemoryCache, NormalizedCacheObject, createHttpLink } from "@apollo/client";
import { useMemo } from "react";
import merge from "deepmerge";
import { AppProps } from "next/app";

const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createIsomorphicLink() {
  if (typeof window === 'undefined') {
  } else {
    return createHttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    })
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphicLink(),
    cache: new InMemoryCache(),
  });
}

type InitialState = NormalizedCacheObject | undefined;

type IInitializeApollo = {
  initialState?: InitialState | null
}

export function initializeApollo(initialState: IInitializeApollo) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    const data = merge(initialState, existingCache);
    _apolloClient.cache.restore(data);
  }

  if (typeof window === 'undefined') return _apolloClient;

  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export const addApolloState = (client: ApolloClient<NormalizedCacheObject>, pageProps: AppProps['pageProps']) => {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps: AppProps['pageProps']) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo({ initialState: state }), [state]);
  return store;
}
