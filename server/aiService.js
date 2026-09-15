import { GoogleGenAI, Type } from '@google/genai'

const MODEL = 'gemini-3.6-flash'
const launchFields = ['name', 'owner', 'targetDate', 'status', 'notes']

const schemas = {
  summary: {
    type: Type.OBJECT,
    properties: {
      overallRiskPicture: { type: Type.STRING },
      mostImportantRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
      launchesRequiringAttention: { type: Type.ARRAY, items: { type: Type.STRING } },
      assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['overallRiskPicture', 'mostImportantRisks', 'launchesRequiringAttention', 'assumptions'],
  },
  risk: {
    type: Type.OBJECT,
    properties: {
      riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
      risks: { type: Type.ARRAY, items: { type: Type.STRING } },
      reasoning: { type: Type.STRING },
      assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['riskLevel', 'risks', 'reasoning', 'assumptions'],
  },
  steps: {
    type: Type.OBJECT,
    properties: {
      nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['nextSteps', 'assumptions'],
  },
  checklist: {
    type: Type.OBJECT,
    properties: {
      checklist: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { task: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['task', 'reason'],
        },
      },
    },
    required: ['checklist'],
  },
}

export async function generateLaunchAI(action, launch) {
  if (!process.env.GEMINI_API_KEY) throw new Error('AI service is not configured')

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(action, launch),
    config: { responseMimeType: 'application/json', responseSchema: schemas[action] },
  })

  let parsed
  try {
    parsed = JSON.parse(response.text)
  } catch {
    throw new Error('Gemini returned malformed JSON')
  }
  validateResponse(action, parsed)
  return parsed
}

export function validateLaunch(launch) {
  if (!launch || typeof launch !== 'object') return false
  return launchFields.every((field) => typeof launch[field] === 'string')
}

export function validateLaunches(launches) {
  return Array.isArray(launches) && launches.length > 0 && launches.every(validateLaunch)
}

function buildPrompt(action, launch) {
  const task = action === 'summary'
    ? 'Summarize the overall risk picture across all launches, identify the most important risks, and list launches requiring attention. Keep the overall risk picture to 1-2 evidence-based sentences. For each attention item, use the exact launch name and include its recorded status as a fact.'
    : action === 'risk'
    ? 'Analyze launch risk and identify practical risks.'
    : action === 'steps'
      ? 'Suggest practical next steps for a Product Operations team.'
      : 'Generate a practical launch readiness checklist.'

  return `You are a Product Operations assistant. ${task}
For risk analysis or an overall risk summary, independently weigh the recorded status, target date, notes, unresolved dependencies, explicit blockers, and testing or review gaps mentioned in the notes. The recorded status is a launch fact and context, not the risk conclusion; determine risk from the available evidence rather than copying status.
Use only facts in the launch object below. Do not invent customer, engineering, legal, security, or business facts.
Separate facts from assumptions. Recommendations are recommendations, not facts.
If information is missing, state what is missing in assumptions. Do not change launch status or execute external actions.
Return only JSON matching the provided response schema.

Launch records:
${JSON.stringify(launch)}`
}

function validateResponse(action, result) {
  if (!result || typeof result !== 'object') throw new Error('Gemini returned an invalid response')
  if (action === 'summary') {
    if (typeof result.overallRiskPicture !== 'string' || !Array.isArray(result.mostImportantRisks) || !Array.isArray(result.launchesRequiringAttention) || !Array.isArray(result.assumptions)) throw new Error('Gemini returned an invalid summary response')
  } else if (action === 'risk') {
    if (!['Low', 'Medium', 'High'].includes(result.riskLevel) || !Array.isArray(result.risks) || typeof result.reasoning !== 'string' || !Array.isArray(result.assumptions)) throw new Error('Gemini returned an invalid risk response')
  } else if (action === 'steps') {
    if (!Array.isArray(result.nextSteps) || !Array.isArray(result.assumptions)) throw new Error('Gemini returned an invalid next-steps response')
  } else if (!Array.isArray(result.checklist) || result.checklist.some((item) => !item || typeof item.task !== 'string' || typeof item.reason !== 'string')) {
    throw new Error('Gemini returned an invalid checklist response')
  }
}
