export default function LaunchRiskSummary({ summary, launches, loading, error, onSummarize }) {
  return <section className="risk-summary" aria-labelledby="risk-summary-title">
    <div className="risk-summary-copy">
      <div className="risk-summary-title"><span className="ai-spark">✦</span><h2 id="risk-summary-title">Launch risk pulse</h2><span className="gemini-label">Powered by Gemini</span></div>
      <p>Get a concise view of the risks across your current launches.</p>
    </div>
    <button className="secondary-button" disabled={loading} onClick={onSummarize}>{loading ? 'Summarizing...' : 'Summarize All Launch Risks'}</button>
    {error && <div className="summary-error" role="alert"><span>{error}</span><button disabled={loading} onClick={onSummarize}>Retry</button></div>}
    {summary && <SummaryResult data={summary} launches={launches} />}
  </section>
}

function SummaryResult({ data, launches }) {
  return <div className="summary-result">
    <SummaryBlock title="Overall assessment" className="summary-overview"><p>{data.overallRiskPicture}</p></SummaryBlock>
    <SummaryBlock title="Key risks"><List items={data.mostImportantRisks} empty="No specific risks identified." itemClassName="risk-item" /></SummaryBlock>
    <SummaryBlock title="Launches requiring attention"><LaunchAttentionList items={data.launchesRequiringAttention} launches={launches} /></SummaryBlock>
    <SummaryBlock title="Assumptions / uncertainty"><List items={data.assumptions} empty="No additional assumptions were provided." itemClassName="assumption-item" /></SummaryBlock>
  </div>
}

function SummaryBlock({ title, className = '', children }) {
  return <div className={`summary-block ${className}`}><div className="summary-block-heading"><h3>{title}</h3></div>{children}</div>
}

function List({ items, empty, itemClassName = '' }) {
  const values = items.length ? items : [empty]
  return <ul className={itemClassName}>{values.map((item) => <li key={item}>{item}</li>)}</ul>
}

function LaunchAttentionList({ items, launches }) {
  if (!items.length) return <p className="summary-empty">No launches were identified as requiring attention.</p>
  return <ul className="attention-list">{items.map((item) => {
    const launch = launches.find((candidate) => item.includes(candidate.name))
    return <li key={item}><span>{launch?.name || item}</span>{launch && <span className={`summary-status ${launch.status.toLowerCase().replace(' ', '-')}`}>{launch.status}</span>}</li>
  })}</ul>
}
