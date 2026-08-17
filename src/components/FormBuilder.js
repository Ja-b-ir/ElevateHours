'use client'
import { Plus, Trash2, GripVertical } from 'lucide-react'

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'select', label: 'Dropdown' },
]

function newField() {
  return { id: crypto.randomUUID(), label: '', type: 'text', required: true, options: [] }
}

// Controlled component: parent owns `fields` state and passes it in,
// along with `onChange` to receive updates. The parent includes the
// resulting array as `application_form` when saving the program.
export default function FormBuilder({ fields, onChange }) {
  const list = fields || []

  const addField = () => onChange([...list, newField()])
  const updateField = (id, patch) => onChange(list.map(f => f.id === id ? { ...f, ...patch } : f))
  const removeField = (id) => onChange(list.filter(f => f.id !== id))

  const addOption = (id) => {
    const field = list.find(f => f.id === id)
    updateField(id, { options: [...(field.options || []), ''] })
  }
  const updateOption = (id, idx, value) => {
    const field = list.find(f => f.id === id)
    const options = [...(field.options || [])]
    options[idx] = value
    updateField(id, { options })
  }
  const removeOption = (id, idx) => {
    const field = list.find(f => f.id === id)
    updateField(id, { options: (field.options || []).filter((_, i) => i !== idx) })
  }

  return (
    <div>
      {list.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1rem', lineHeight: 1.6 }}>
          No questions yet. Add fields below to collect applications from students before they join —
          leave this empty and students will be able to join instantly instead.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {list.map((field, idx) => (
          <div key={field.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <GripVertical size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                type="text" value={field.label} placeholder={`Question ${idx + 1}`}
                onChange={e => updateField(field.id, { label: e.target.value })}
                className="form-input" style={{ flex: 1 }}
              />
              <select
                value={field.type}
                onChange={e => updateField(field.id, {
                  type: e.target.value,
                  options: e.target.value === 'select' ? (field.options?.length ? field.options : ['']) : field.options
                })}
                className="form-select" style={{ width: 140, flexShrink: 0 }}
              >
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button type="button" onClick={() => removeField(field.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                <Trash2 size={15} />
              </button>
            </div>

            {field.type === 'select' && (
              <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                {(field.options || []).map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text" value={opt} placeholder={`Option ${oi + 1}`}
                      onChange={e => updateOption(field.id, oi, e.target.value)}
                      className="form-input" style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    />
                    <button type="button" onClick={() => removeOption(field.id, oi)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button" onClick={() => addOption(field.id)}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--brand)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add option
                </button>
              </div>
            )}

            <label style={{ marginLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-2)' }}>
              <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} />
              Required
            </label>
          </div>
        ))}
      </div>

      <button
        type="button" onClick={addField}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'var(--surface-2)', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)',
          padding: '0.6rem 1rem', color: 'var(--brand)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
        }}
      >
        <Plus size={14} /> Add Question
      </button>
    </div>
  )
}
