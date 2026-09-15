import { useState } from 'react'

export default function AiLaunchAssistant({ launch, output, loading, error, onAction }) {
  const [lastAction, setLastAction] = useState(null)
  const [completedTasks, setCompletedTasks] = useState({})

  function handleAction(action) {
    if (loading) return
    setLastAction(action)
    if (action === 'checklist') setCompletedTasks({})
    onAction(action, launch)
  }

  function toggleTask(task) {
    setCompletedTasks((current) => ({ ...current, [task]: !current[task] }))
  }

  return <section className="ai-section" aria-labelledby="ai-assistant-title">
    <div className="ai-heading">
      <div><span className="ai-spark">✦</span><h3 id="ai-assistant-title">AI Launch Assistant</h3></div>
      <span className="gemini-label">Powered by Gemini</span>
    </div>
    <p className="ai-caption">Turn launch context into a practical readiness plan.</p>
    <div className="ai-buttons">
      <button disabled={loading} onClick={() => handleAction('risk')}>Analyze Risk</button>
      <button disabled={loading} onClick={() => handleAction('steps')}>Suggest Next Steps</button>
      <button disabled={loading} onClick={() => handleAction('checklist')}>Generate Launch Checklist</button>
    </div>
    {loading && <p className="ai-status">{actionLabel(lastAction)} is processing...</p>}
    {error && <div className="ai-error" role="alert"><span>{error}</span><button disabled={loading} onClick={() => lastAction && handleAction(lastAction)}>Retry</button></div>}
    {output && <AssistantResult output={output} completedTasks={completedTasks} onToggleTask={toggleTask} />}
  </section>
}

function AssistantResult({ output, completedTasks, onToggleTask }) {
  if (output.type === 'checklist') return <div className="ai-result"><ResultHeading title="Launch Readiness Checklist" kind="recommendation" /><p className="ai-local-note">Check items to track them locally. This does not update any external system.</p><ul className="checklist">{output.data.checklist.map((item) => <li key={item.task}><label><input type="checkbox" checked={Boolean(completedTasks[item.task])} onChange={() => onToggleTask(item.task)} /><span className="checkmark" /><span><strong>{item.task}</strong><small>{item.reason}</small></span></label></li>)}</ul></div>
  if (output.type === 'steps') return <div className="ai-result"><ResultHeading title="Recommended Next Steps" kind="recommendation" /><ol className="numbered-list">{output.data.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol><Assumptions items={output.data.assumptions} /></div>
  return <div className="ai-result"><ResultHeading title="AI Risk Assessment" kind="assessment" /><div className="risk-level"><span>Risk Level</span><strong className={`risk-${output.data.riskLevel.toLowerCase()}`}>{output.data.riskLevel}</strong></div><ResultBlock title="Risks" kind="recommendation"><ul>{output.data.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></ResultBlock><ResultBlock title="Reasoning" kind="fact"><p>{output.data.reasoning}</p></ResultBlock><Assumptions items={output.data.assumptions} /></div>
}

function ResultHeading({ title, kind }) { return <div className="result-heading"><h4>{title}</h4><span className={`result-kind ${kind}`}>{kind === 'fact' ? 'Launch facts' : kind === 'assessment' ? 'AI assessment' : 'AI recommendation'}</span></div> }
function ResultBlock({ title, kind, children }) { return <div className="result-block"><div className="result-block-title"><span>{title}</span><small>{kind === 'fact' ? 'From launch context' : kind === 'assumption' ? 'Declared uncertainty' : 'Generated guidance'}</small></div>{children}</div> }
function Assumptions({ items }) { return <ResultBlock title="Assumptions" kind="assumption"><ul>{(items.length ? items : ['No additional assumptions were provided.']).map((item) => <li key={item}>{item}</li>)}</ul></ResultBlock> }
function actionLabel(action) { return action === 'risk' ? 'Risk analysis' : action === 'steps' ? 'Next steps' : 'Checklist generation' }
