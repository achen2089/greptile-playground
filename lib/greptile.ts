import { GreptileError, handleApiResponse } from './greptile-utils'

// Constants
const API_BASE_URL = 'https://api.greptile.com/v2'

// Types
interface RepositoryPayload {
  remote: string
  repository: string
  branch: string
}

interface QueryPayload {
  messages: { content: string; role: string }[]
  repositories: RepositoryPayload[]
}

// API functions
export async function submitRepositoryForIndexing(repository: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string): Promise<unknown> {
  return makeGreptileRequest(`${API_BASE_URL}/repositories`, 'POST', greptileApiKey, githubAccessToken, {
    remote,
    repository,
    branch
  })
}

export async function checkRepositoryIndexingProgress(repository: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string): Promise<unknown> {
  const repositoryIdentifier = encodeURIComponent(`${remote}:${branch}:${repository}`)
  return makeGreptileRequest(`${API_BASE_URL}/repositories/${repositoryIdentifier}`, 'GET', greptileApiKey, githubAccessToken)
}

export async function queryRepository(repository: string, query: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string): Promise<unknown> {
  const payload: QueryPayload = {
    messages: [{ content: query, role: "user" }],
    repositories: [{ remote, repository, branch }],
  }
  return makeGreptileRequest(`${API_BASE_URL}/query`, 'POST', greptileApiKey, githubAccessToken, payload)
}

// Helper functions
async function makeGreptileRequest(url: string, method: string, greptileApiKey: string, githubAccessToken: string, body?: unknown): Promise<unknown> {
  const headers = {
    'Authorization': `Bearer ${greptileApiKey}`,
    'X-Github-Token': githubAccessToken,
    'Content-Type': 'application/json'
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    return handleApiResponse(response)
  } catch (error) {
    console.error(`Error in Greptile API request to ${url}:`, error)
    throw new GreptileError(`Failed to ${method} ${url}`)
  }
}
