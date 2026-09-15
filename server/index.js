import 'dotenv/config'
import express from 'express'
import { generateLaunchAI, validateLaunch, validateLaunches } from './aiService.js'

const app = express()
const port = process.env.PORT || 3001
const actionByPath = {
  '/api/ai/summarize-risks': 'summary',
  '/api/ai/analyze-risk': 'risk',
  '/api/ai/next-steps': 'steps',
  '/api/ai/checklist': 'checklist',
}

app.use(express.json({ limit: '32kb' }))

for (const [path, action] of Object.entries(actionByPath)) {
  app.post(path, async (request, response) => {
    const validInput = action === 'summary' ? validateLaunches(request.body?.launches) : validateLaunch(request.body?.launch)
    if (!validInput) {
      return response.status(400).json({ error: 'A complete launch object is required.' })
    }

    try {
      const result = await generateLaunchAI(action, action === 'summary' ? request.body.launches : request.body.launch)
      return response.json(result)
    } catch (error) {
      console.error(`AI ${action} request failed`)
      return response.status(error.message === 'AI service is not configured' ? 503 : 502).json({ error: 'The AI assistant is temporarily unavailable.' })
    }
  })
}

app.get('/api/health', (_request, response) => response.json({ ok: true }))

app.use((_error, _request, response, _next) => {
  response.status(400).json({ error: 'Invalid request.' })
})

app.listen(port, () => {
  console.log(`LaunchPilot API listening on port ${port}`)
})

