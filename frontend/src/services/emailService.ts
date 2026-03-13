import api from './api'

export interface Email {
  _id: string
  subject: string
  toEmail: string
  fromEmail: string
  body: string
  status: 'pending' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
  error?: string
  externalId?: string
  ownerId: string
}

export interface PaginatedEmailsResponse {
  success: boolean
  emails: Email[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const emailService = {
  // Erstelle 1000 Emails
  createBatch: async () => {
    const response = await api.post('/emails/create-batch')
    return response.data
  },
  postSendEmails: async () => {
    const response = await api.post('/emails/send-emails')
    return response.data
  },
  // Hole paginierte Emails (TODO: Muss vom Bewerber implementiert werden)
  getPaginated: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PaginatedEmailsResponse> => {
    const params: any = { page, limit }
    if (status) params.status = status
    params.page = page

    const response = await api.get('/emails/paginated', { params })
    return response.data
  },

  // Hole alle Emails (Fallback)
  getAll: async (limit: number = 100, skip: number = 0, status?: string) => {
    const params: any = { limit, skip }
    if (status) params.status = status

    const response = await api.get('/emails', { params })
    return response.data
  },

  // Hole Statistiken
  getStats: async () => {
    const response = await api.get('/emails/stats')
    return response.data
  },
}
