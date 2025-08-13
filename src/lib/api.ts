const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
  pagination?: {
    current: number
    pages: number
    total: number
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Base fetch wrapper with error handling
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// Authenticated fetch wrapper
async function authenticatedFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('jdr_token')
  
  if (!token) {
    throw new ApiError('No authentication token', 401)
  }

  return apiFetch<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    username: string
    email: string
    password: string
    role: string
    avatar?: string
    background?: string
  }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => authenticatedFetch('/auth/me'),

  updateProfile: (profileData: any) =>
    authenticatedFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    authenticatedFetch('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  completeTutorial: () =>
    authenticatedFetch('/auth/complete-tutorial', {
      method: 'POST',
    }),
}

// Campaigns API
export const campaignsApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    status?: string
    gameSystem?: string
    genre?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/campaigns${query ? `?${query}` : ''}`)
  },

  getMy: () => authenticatedFetch('/campaigns/my'),

  getById: (id: string) => authenticatedFetch(`/campaigns/${id}`),

  create: (campaignData: {
    title: string
    description: string
    gameSystem: string
    genre?: string
    maxPlayers?: number
    visibility?: string
    schedule?: any
    tags?: string[]
  }) =>
    authenticatedFetch('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),

  update: (id: string, campaignData: any) =>
    authenticatedFetch(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    }),

  join: (id: string, inviteCode?: string) =>
    authenticatedFetch(`/campaigns/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  leave: (id: string) =>
    authenticatedFetch(`/campaigns/${id}/leave`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    authenticatedFetch(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  addSession: (id: string, sessionData: {
    summary?: string
    duration?: number
    keyEvents?: string[]
    experience?: any
    participants?: string[]
  }) =>
    authenticatedFetch(`/campaigns/${id}/session`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
}

// Chat API
export const chatApi = {
  getGeneral: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/chat/general${query ? `?${query}` : ''}`)
  },

  sendGeneral: (content: string) =>
    authenticatedFetch('/chat/general', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getCampaign: (campaignId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/chat/campaign/${campaignId}${query ? `?${query}` : ''}`)
  },

  sendCampaign: (campaignId: string, content: string) =>
    authenticatedFetch(`/chat/campaign/${campaignId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  editMessage: (messageId: string, content: string) =>
    authenticatedFetch(`/chat/message/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteMessage: (messageId: string) =>
    authenticatedFetch(`/chat/message/${messageId}`, {
      method: 'DELETE',
    }),

  addReaction: (messageId: string, emoji: string) =>
    authenticatedFetch(`/chat/message/${messageId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  removeReaction: (messageId: string, emoji: string) =>
    authenticatedFetch(`/chat/message/${messageId}/reaction`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji }),
    }),

  search: (params: {
    q: string
    campaignId?: string
    messageType?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    return authenticatedFetch(`/chat/search?${searchParams.toString()}`)
  },
}

// Dice API
export const diceApi = {
  roll: (rollData: {
    campaignId: string
    diceType: string
    numberOfDice?: number
    modifier?: number
    purpose?: string
    visibility?: string
    context?: any
    metadata?: any
  }) =>
    authenticatedFetch('/dice/roll', {
      method: 'POST',
      body: JSON.stringify(rollData),
    }),

  quickRoll: (rollData: {
    diceType: string
    numberOfDice?: number
    modifier?: number
  }) =>
    authenticatedFetch('/dice/quick-roll', {
      method: 'POST',
      body: JSON.stringify(rollData),
    }),

  getHistory: (campaignId: string, params?: {
    page?: number
    limit?: number
    userId?: string
    diceType?: string
    visibility?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/dice/history/${campaignId}${query ? `?${query}` : ''}`)
  },

  getStatistics: (campaignId: string, params?: {
    userId?: string
    period?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/dice/statistics/${campaignId}${query ? `?${query}` : ''}`)
  },

  deleteRoll: (rollId: string) =>
    authenticatedFetch(`/dice/roll/${rollId}`, {
      method: 'DELETE',
    }),
}

// Calendar API
export const calendarApi = {
  getCampaignEvents: (campaignId: string, params?: {
    month?: number
    year?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/calendar/campaign/${campaignId}${query ? `?${query}` : ''}`)
  },

  createEvent: (campaignId: string, eventData: {
    title: string
    description?: string
    startDate: string
    endDate?: string
    type?: string
    participants?: string[]
  }) =>
    authenticatedFetch(`/calendar/campaign/${campaignId}/event`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (campaignId: string, eventId: string, eventData: any) =>
    authenticatedFetch(`/calendar/campaign/${campaignId}/event/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (campaignId: string, eventId: string) =>
    authenticatedFetch(`/calendar/campaign/${campaignId}/event/${eventId}`, {
      method: 'DELETE',
    }),

  respondToEvent: (campaignId: string, eventId: string, response: string) =>
    authenticatedFetch(`/calendar/campaign/${campaignId}/event/${eventId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    }),

  getMyEvents: (params?: { limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/calendar/my-events${query ? `?${query}` : ''}`)
  },
}

// Ranking API
export const rankingApi = {
  getLeaderboard: (params?: {
    period?: string
    role?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ranking/leaderboard${query ? `?${query}` : ''}`)
  },

  getMyRanking: (params?: { period?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ranking/my-ranking${query ? `?${query}` : ''}`)
  },

  vote: (voteData: {
    userId: string
    category: string
    score: number
    period?: string
  }) =>
    authenticatedFetch('/ranking/vote', {
      method: 'POST',
      body: JSON.stringify(voteData),
    }),

  getVotingCandidates: (params?: { period?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ranking/voting-candidates${query ? `?${query}` : ''}`)
  },

  getStatistics: (params?: {
    period?: string
    role?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ranking/statistics${query ? `?${query}` : ''}`)
  },

  getHistory: (userId: string, params?: {
    period?: string
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ranking/history/${userId}${query ? `?${query}` : ''}`)
  },
}

// AI API
export const aiApi = {
  generateNPC: (params?: {
    race?: string
    profession?: string
    personality?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ai/generate/npc${query ? `?${query}` : ''}`)
  },

  generateQuest: (params?: {
    type?: string
    difficulty?: string
    duration?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return authenticatedFetch(`/ai/generate/quest${query ? `?${query}` : ''}`)
  },

  generateHook: () => authenticatedFetch('/ai/generate/hook'),

  generateEvent: () => authenticatedFetch('/ai/generate/event'),

  generateRandom: () => authenticatedFetch('/ai/generate/random'),
}

// Export the main API object
export const api = {
  auth: authApi,
  campaigns: campaignsApi,
  chat: chatApi,
  dice: diceApi,
  calendar: calendarApi,
  ranking: rankingApi,
  ai: aiApi,
}

export default api
