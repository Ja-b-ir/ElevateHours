'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function MyRequests() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [activeRequest, setActiveRequest] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchRequests(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchRequests = async (uid) => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        skill:skills_catalog(skill_name, track),
        tier:tier_reference(tier_name),
        applications(
          id, status, created_at,
          applicant:profiles(id, full_name, email, completed_transactions, impact_score, tier_level)
        )
      `)
      .eq('receiver_id', uid)
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const handleAccept = async (applicationId, transactionId, applicantId) => {
    setUpdating(applicationId)
    try {
      await supabase.from('applications').update({ status: 'Accepted' }).eq('id', applicationId)
      await supabase.from('applications').update({ status: 'Rejected' }).eq('transaction_id', transactionId).neq('id', applicationId)
      await supabase.from('transactions').update({ provider_id: applicantId, status: 'In Progress' }).eq('id', transactionId)
      await supabase.from('notifications').insert({
        user_id: applicantId,
        title: 'Application Accepted!',
        message: 'Your application has been accepted. Time to get started!',
        type: 'accepted',
        related_id: transactionId
      })
      await fetchRequests(user.id)
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  const handleReject = async (applicationId, applicantId, transactionId) => {
    setUpdating(applicationId)
    try {
      await supabase.from('applications').update({ status: 'Rejected' }).eq('id', applicationId)
      await supabase.from('notifications').insert({
        user_id: applicantId,
        title: 'Application Update',
        message: 'Your application was not selected this time. Keep applying!',
        type: 'rejected',
        related_id: transactionId
      })
      await fetchRequests(user.id)
    } catch (err) {
      console.error(err)
    }
    setUpdating(null)
  }

  const cancelRequest = async (transactionId) => {
    await supabase.from('transactions').update({ status: 'Cancelled' }).eq('id', transactionId)
    await fetchRequests(user.id)
  }

  const reopenRequest = async (transactionId) => {
    await supabase.from('transactions').update({ status: 'Open', provider_id: null }).eq('id', transactionId)
    await fetchRequests(user.id)
  }

  const deleteRequest = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to delete this request? This cannot be undone.')
    if (!confirmed) return
    await supabase.from('applications').delete().eq('transaction_id', transactionId)
    await supabase.from('transactions').delete().eq('id', transactionId)
    await fetchRequests(user.id)
  }

  const STATUS_COLORS = {
    'Open': { bg: '#dcfce7', color: '#166534' },
    'In Progress': { bg: '#dbeafe', color: '#1e40af' },
    'Pending Confirmation': { bg: '#fef3c7', color: '#92400e' },
    'Confirmed': { bg: '#dcfce7', color: '#166534' },
    'Cancelled': { bg: '#f1f5f9', color: '#64748b' },
  }

  if (loading) return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Requests</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage your posted requests and review applicants</p>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No requests posted yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Post a request to find skilled individuals for your needs.</p>
            <a href="/post-request" style={{ background: '#0D7377', color: 'white', padding: '0.65rem 1.5rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
              Post a Request
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {requests.map(req => {
              const pendingApps = req.applications ? req.applications.filter(function(a) { return a.status === 'Pending' }) : []
              const acceptedApp = req.applications ? req.applications.find(function(a) { return a.status === 'Accepted' }) : null
              const statusStyle = STATUS_COLORS[req.status] || { bg: '#f1f5f9', color: '#64748b' }
              const isExpanded = activeRequest === req.id

              return (
                <div key={req.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(13,115,119,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{req.skill ? req.skill.skill_name : 'Unknown Skill'}</h3>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                            {req.status}
                          </span>
                          <span style={{ background: req.track === 'Work' ? '#ede9fe' : '#dbeafe', color: req.track === 'Work' ? '#5b21b6' : '#1e40af', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                            {req.track}
                          </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                          {req.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                          <span>⏱ {req.agreed_hours}h</span>
                          <span>⚡ <strong style={{ color: '#F5A623' }}>{req.total_sparks_transferred} SPK</strong></span>
                          <span>📅 {req.date}</span>
                          <span>👥 <strong>{req.applications ? req.applications.length : 0}</strong> applicants</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        {req.applications && req.applications.length > 0 && (
                          <button
                            onClick={function() { setActiveRequest(isExpanded ? null : req.id) }}
                            style={{ background: '#e8f4f4', color: '#0D7377', padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #0D7377', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            {isExpanded ? 'Hide' : 'View Applicants (' + req.applications.length + ')'}
                          </button>
                        )}
                        {req.status === 'Open' && (
                          <button
                            onClick={function() { cancelRequest(req.id) }}
                            style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            Cancel
                          </button>
                        )}
                        {req.status === 'Cancelled' && (
                          <button
                            onClick={function() { reopenRequest(req.id) }}
                            style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={function() { deleteRequest(req.id) }}
                          style={{ background: '#f1f5f9', color: '#64748b', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {acceptedApp && (
                      <div style={{ marginTop: '1rem', background: '#dcfce7', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>✅</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.875rem' }}>
                            {acceptedApp.applicant ? acceptedApp.applicant.full_name : 'Someone'} accepted
                          </div>
                          <div style={{ color: '#166534', fontSize: '0.8rem', opacity: 0.8 }}>Work is in progress</div>
                        </div>
                      </div>
                    )}

                    {pendingApps.length > 0 && !acceptedApp && (
                      <div style={{ marginTop: '1rem', background: '#fef3c7', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>⏳</span>
                        <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>
                          {pendingApps.length} pending application{pendingApps.length !== 1 ? 's' : ''} waiting for your review
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && req.applications && req.applications.length > 0 && (
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '1.25rem', background: '#fafafa' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        Applicants
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {req.applications.map(function(app) {
                          return (
                            <div key={app.id} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1.5px solid ' + (app.status === 'Accepted' ? '#14A085' : app.status === 'Rejected' ? '#fca5a5' : '#e2e8f0'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #0D7377, #14A085)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                                  {app.applicant && app.applicant.full_name ? app.applicant.full_name[0].toUpperCase() : '?'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{app.applicant ? app.applicant.full_name : 'Unknown'}</div>
                                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                    {app.applicant ? app.applicant.tier_level : ''} · {app.applicant ? app.applicant.completed_transactions || 0 : 0} completed · Impact: {app.applicant ? app.applicant.impact_score || 0 : 0}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {app.status === 'Pending' && req.status === 'Open' && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      onClick={function() { handleAccept(app.id, req.id, app.applicant.id) }}
                                      disabled={updating === app.id}
                                      style={{ background: '#14A085', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: updating === app.id ? 0.7 : 1 }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={function() { handleReject(app.id, app.applicant.id, req.id) }}
                                      disabled={updating === app.id}
                                      style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: updating === app.id ? 0.7 : 1 }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {app.status === 'Accepted' && (
                                  <span style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>Accepted</span>
                                )}
                                {app.status === 'Rejected' && (
                                  <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>Rejected</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
