import { GraphQLClient } from 'graphql-request'
import { getSdk, getSdkWithHooks } from '../server/generated-files/frontend-graphql-definition'

const ENDPOINT = '/api/graphql'

const defaultHeaders = {
  Accept: 'application/json',
}
const graphqlClient = new GraphQLClient(ENDPOINT, { headers: defaultHeaders })

const client = getSdk(graphqlClient)
const apiHooks = getSdkWithHooks(graphqlClient)

const setAuthToken = (token: string | undefined): void => {
  if (!token) {
    graphqlClient.setHeaders(defaultHeaders)
  } else {
    graphqlClient.setHeader('Authorization', `Bearer ${token}`)
  }
}

export { client, apiHooks, setAuthToken }
