import { handleApiResponse } from './greptile-utils'

// Constants
const API_BASE_URL = 'https://api.greptile.com/v2'

// Types
interface RepositoryPayload {
  remote: string
  repository: string
  branch: string
}

interface QueryPayload {
  messages: { id: string; content: string; role: string }[]
  repositories: RepositoryPayload[]
  sessionId?: string
  stream?: boolean
  genius?: boolean
}

// API functions
export async function submitRepositoryForIndexing(repository: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string, reload?: boolean, notify?: boolean): Promise<unknown> {
  return makeGreptileRequest(`${API_BASE_URL}/repositories`, 'POST', greptileApiKey, githubAccessToken, {
    remote,
    repository,
    branch,
    ...(reload !== undefined && { reload }),
    ...(notify !== undefined && { notify })
  })
}

export async function checkRepositoryIndexingProgress(repository: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string): Promise<unknown> {
  const repositoryIdentifier = encodeURIComponent(`${remote}:${branch}:${repository}`)
  return makeGreptileRequest(`${API_BASE_URL}/repositories/${repositoryIdentifier}`, 'GET', greptileApiKey, githubAccessToken)
}

export async function queryRepository(repository: string, query: string, remote: string = "github", branch: string = "main", greptileApiKey: string, githubAccessToken: string, options: {
  messages?: { id: string; content: string; role: string }[],
  repositories?: RepositoryPayload[],
  sessionId?: string,
  stream?: boolean,
  genius?: boolean
}): Promise<unknown> {
  const payload: QueryPayload = {
    messages: options.messages?.length ? options.messages : [{ id: Date.now().toString(), content: query, role: "user" }],
    repositories: options.repositories?.length ? options.repositories : [{ remote, repository, branch }],
    ...(options.sessionId && { sessionId: options.sessionId }),
    ...(options.stream !== undefined && { stream: options.stream }),
    ...(options.genius !== undefined && { genius: options.genius })
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
    const errorResponse = {
      error: true,
      message: `Failed to ${method} ${url}`,
      details: error instanceof Error ? error.message : String(error)
    }
    return errorResponse
  }
}
