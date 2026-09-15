const endpoints = {
  summary: '/api/ai/summarize-risks',
  risk: '/api/ai/analyze-risk',
  steps: '/api/ai/next-steps',
  checklist: '/api/ai/checklist',
}

export async function requestLaunchAI(action, launch) {
  let response
  try {
    response = await fetch(endpoints[action], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ launch: pickLaunchFields(launch) }),
    })
  } catch {
    throw new Error('Unable to reach the AI assistant.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'The AI assistant is temporarily unavailable.')
  return body
}

export async function requestAllLaunchRisks(launches) {
  let response
  try {
    response = await fetch(endpoints.summary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ launches: launches.map(pickLaunchFields) }),
    })
  } catch {
    throw new Error('Unable to reach the AI assistant.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'The AI assistant is temporarily unavailable.')
  return body
}

function pickLaunchFields(launch) {
  return {
    name: launch.name,
    owner: launch.owner,
    targetDate: launch.targetDate,
    status: launch.status,
    notes: launch.notes,
  }
}
