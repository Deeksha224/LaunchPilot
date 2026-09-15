import { useMemo, useState } from 'react'
import './App.css'
import AiLaunchAssistant from './components/AiLaunchAssistant'
import LaunchRiskSummary from './components/LaunchRiskSummary'
import { requestAllLaunchRisks, requestLaunchAI } from './lib/aiApi'
import { loadLaunches, saveLaunches } from './lib/storage'

const statuses = ['All', 'On Track', 'At Risk', 'Blocked']
const emptyForm = { name: '', owner: '', targetDate: '', status: 'On Track', notes: '' }
const slug = (value) => value.toLowerCase().replace(' ', '-')

function App() {
  const [launches, setLaunches] = useState(loadLaunches)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [aiOutput, setAiOutput] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const visibleLaunches = useMemo(() => filter === 'All' ? launches : launches.filter((launch) => launch.status === filter), [filter, launches])
  const counts = statuses.slice(1).reduce((result, status) => ({ ...result, [status]: launches.filter((launch) => launch.status === status).length }), {})

  function updateLaunches(next) { setLaunches(next); saveLaunches(next) }
  function openCreate() { setEditing('new'); setForm(emptyForm) }
  function openEdit(launch) { setEditing(launch.id); setForm({ name: launch.name, owner: launch.owner, targetDate: launch.targetDate, status: launch.status, notes: launch.notes }); setSelected(null) }
  function submitForm(event) {
    event.preventDefault()
    const now = new Date().toISOString()
    const existing = launches.find((launch) => launch.id === editing)
    const nextLaunch = { ...form, id: editing === 'new' ? `launch-${Date.now()}` : editing, createdAt: existing?.createdAt || now, updatedAt: now }
    updateLaunches(editing === 'new' ? [nextLaunch, ...launches] : launches.map((launch) => launch.id === editing ? nextLaunch : launch))
    setEditing(null)
  }
  function deleteLaunch(id) {
    if (window.confirm('Delete this launch?')) { updateLaunches(launches.filter((launch) => launch.id !== id)); setSelected(null) }
  }
  async function runAI(action, launch) {
    setAiLoading(true)
    setAiError('')
    try { setAiOutput({ type: action, data: await requestLaunchAI(action, launch) }) } catch (error) { setAiOutput(null); setAiError(error.message) } finally { setAiLoading(false) }
  }

  async function summarizeRisks() {
    if (summaryLoading) return
    setSummaryLoading(true)
    setSummaryError('')
    try { setSummary(await requestAllLaunchRisks(launches)) } catch (error) { setSummary(null); setSummaryError(error.message) } finally { setSummaryLoading(false) }
  }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">LP</span><span>LaunchPilot</span></div><div className="workspace-label">WORKSPACE</div><div className="workspace"><span className="workspace-avatar">P</span><span>Product team</span><span className="chevron">⌄</span></div><nav className="nav-list" aria-label="Main navigation"><button className="nav-item active"><span>▦</span> Launches</button><button className="nav-item"><span>◫</span> Readiness board</button><button className="nav-item"><span>◌</span> Reports</button></nav><div className="sidebar-bottom"><div className="help-mark">?</div><span>Help center</span></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Launches</div><div className="topbar-actions"><button className="icon-button" title="Search">⌕</button><button className="icon-button" title="Notifications">♢</button><div className="user-avatar">AR</div></div></header>
      <section className="page-intro"><div><p className="eyebrow">PRODUCT OPERATIONS <span className="live-dot" /> LIVE</p><h1>LaunchPilot</h1><p className="intro-copy">A launch readiness workspace for keeping product teams aligned.</p></div><button className="primary-button" onClick={openCreate}><span>＋</span> New Launch</button></section>
      <section className="metric-grid" aria-label="Launch summary"><Metric label="Total launches" value={launches.length} detail="Across this workspace" tone="neutral" /><Metric label="On track" value={counts['On Track']} detail="Healthy momentum" tone="green" /><Metric label="At risk" value={counts['At Risk']} detail="Needs attention" tone="amber" /><Metric label="Blocked" value={counts.Blocked} detail="Needs intervention" tone="red" /></section><LaunchRiskSummary summary={summary} launches={launches} loading={summaryLoading} error={summaryError} onSummarize={summarizeRisks} />
      <section className="launch-section"><div className="section-heading"><div><h2>Launch readiness</h2><p>{visibleLaunches.length} of {launches.length} launches shown</p></div><div className="filter-tabs" role="tablist">{statuses.map((status) => <button key={status} className={filter === status ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(status)}>{status}{status !== 'All' && <span className={`tab-count ${slug(status)}`}>{counts[status]}</span>}</button>)}</div></div><div className="launch-table"><div className="table-header"><span>Launch</span><span>Owner</span><span>Target date</span><span>Status</span><span>Notes</span><span /></div>{visibleLaunches.length ? visibleLaunches.map((launch) => <LaunchRow key={launch.id} launch={launch} onOpen={() => { setSelected(launch); setAiOutput(null) }} onEdit={() => openEdit(launch)} onDelete={() => deleteLaunch(launch.id)} />) : <div className="empty-state"><div>◌</div><h3>No launches here</h3><p>Try another filter or create a new launch.</p></div>}</div></section><footer className="footer"><span>LaunchPilot</span><span>Last synced just now</span></footer></main>
    {editing && <Modal title={editing === 'new' ? 'Create a launch' : 'Edit launch'} onClose={() => setEditing(null)}><LaunchForm form={form} setForm={setForm} onSubmit={submitForm} onCancel={() => setEditing(null)} /></Modal>}
    {selected && <DetailPanel launch={selected} aiOutput={aiOutput} aiLoading={aiLoading} aiError={aiError} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} onDelete={() => deleteLaunch(selected.id)} onAI={runAI} />}
  </div>
}

function Metric({ label, value, detail, tone }) { return <div className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-dot" /></div><strong>{value}</strong><small>{detail}</small></div> }
function LaunchRow({ launch, onOpen, onEdit, onDelete }) { return <div className={`launch-row ${slug(launch.status)}`}><div className="launch-name"><span className={`status-icon ${slug(launch.status)}`}>{launch.status === 'On Track' ? '✓' : launch.status === 'At Risk' ? '!' : '×'}</span><div><button className="launch-link" onClick={onOpen}>{launch.name}</button><small>Updated {relativeDate(launch.updatedAt)}</small></div></div><div className="owner"><span className="owner-avatar">{initials(launch.owner)}</span>{launch.owner}</div><div className="target-date">{formatDate(launch.targetDate)}</div><div><StatusBadge status={launch.status} /></div><div className="launch-notes" title={launch.notes}>{launch.notes || 'No notes added'}</div><div className="row-actions"><button title="Edit launch" onClick={onEdit}>✎</button><button title="Delete launch" onClick={onDelete}>⌫</button></div></div> }
function StatusBadge({ status }) { return <span className={`status-badge ${slug(status)}`}><span />{status}</span> }
function Modal({ title, onClose, children }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-header"><h2>{title}</h2><button className="close-button" onClick={onClose}>×</button></div>{children}</div></div> }
function LaunchForm({ form, setForm, onSubmit, onCancel }) { const set = (key, value) => setForm({ ...form, [key]: value }); return <form onSubmit={onSubmit}><div className="form-grid"><label>Launch name<input required value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. New mobile experience" /></label><label>Owner<input required value={form.owner} onChange={(event) => set('owner', event.target.value)} placeholder="e.g. Alex Rivera" /></label><label>Target date<input required type="date" value={form.targetDate} onChange={(event) => set('targetDate', event.target.value)} /></label><label>Status<select value={form.status} onChange={(event) => set('status', event.target.value)}>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label><label className="full-width">Notes<textarea rows="4" value={form.notes} onChange={(event) => set('notes', event.target.value)} placeholder="What should the team know about this launch?" /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" type="submit">{form.name ? 'Save launch' : 'Create launch'}</button></div></form> }
function DetailPanel({ launch, aiOutput, aiLoading, aiError, onClose, onEdit, onDelete, onAI }) { return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="detail-drawer"><div className="drawer-header"><button className="back-button" onClick={onClose}>← Back to launches</button><button className="close-button" onClick={onClose}>×</button></div><div className="drawer-body"><div className="detail-title"><StatusBadge status={launch.status} /><h2>{launch.name}</h2><p>Owned by {launch.owner} <span>·</span> Target {formatDate(launch.targetDate)}</p></div><div className="detail-actions"><button className="secondary-button" onClick={onEdit}>✎ Edit</button><button className="danger-button" onClick={onDelete}>⌫ Delete</button></div><div className="notes-block"><h3>Launch notes</h3><p>{launch.notes || 'No notes added yet.'}</p></div><AiLaunchAssistant launch={launch} output={aiOutput} loading={aiLoading} error={aiError} onAction={onAI} /></div></aside></div> }
function initials(name) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() }
function formatDate(value) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) }
function relativeDate(value) { const days = Math.max(1, Math.round((Date.now() - new Date(value)) / 86400000)); return `${days}d ago` }

export default App
