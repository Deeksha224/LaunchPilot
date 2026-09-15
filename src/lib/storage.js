const STORAGE_KEY = 'launchpilot.launches'
const SEED_VERSION_KEY = 'launchpilot.seedVersion'
const SAMPLE_SEED_VERSION = 'assessment-v1'

const sampleLaunches = [
  { id: 'launch-1', name: 'Admin Console Redesign', owner: 'Priya', targetDate: '2024-03-30', status: 'At Risk', notes: 'Design is complete, but QA has not started. Legal review is pending.', createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-03-01T10:00:00.000Z' },
  { id: 'launch-2', name: 'AI Summary Feature', owner: 'Rahul', targetDate: '2024-04-15', status: 'On Track', notes: 'Beta feedback is positive. Documentation is in progress.', createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-03-01T10:00:00.000Z' },
  { id: 'launch-3', name: 'SSO Enhancements', owner: 'Anita', targetDate: '2024-03-22', status: 'Blocked', notes: 'Engineering is waiting on identity provider test credentials.', createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-03-01T10:00:00.000Z' },
  { id: 'launch-4', name: 'Usage Analytics Dashboard', owner: 'Neha', targetDate: '2024-04-05', status: 'At Risk', notes: 'Data pipeline is unstable and customer comms are not drafted.', createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-03-01T10:00:00.000Z' },
]

export function loadLaunches() {
  try {
    if (localStorage.getItem(SEED_VERSION_KEY) !== SAMPLE_SEED_VERSION) {
      saveLaunches(sampleLaunches)
      localStorage.setItem(SEED_VERSION_KEY, SAMPLE_SEED_VERSION)
      return sampleLaunches
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleLaunches
  } catch {
    return sampleLaunches
  }
}

export function saveLaunches(launches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(launches))
}
