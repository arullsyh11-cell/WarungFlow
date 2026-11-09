import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Edit3,
  FileDown,
  FileText,
  History,
  House,
  Menu,
  Minus,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from 'lucide-react'
import {
  APP_VERSION,
  createId,
  formatDate,
  formatTime,
  getTodayGreeting,
  loadData,
  localDateISO,
  money,
  number,
  persistData,
  shiftTotals,
  validateBackup,
} from './storage'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'sales', label: 'Penjualan', icon: ShoppingBag },
  { id: 'history', label: 'Riwayat', icon: History },
  { id: 'reports', label: 'Laporan', icon: BarChart3 },
]

const nowLocalInput = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}


function DatePicker({ value, onChange, label, required = false, id }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const d = value ? new Date(`${value}T12:00:00`) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const wrapRef = useRef(null)
  const selected = value ? new Date(`${value}T12:00:00`) : null
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(view)
  const dateLabel = selected
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(selected)
    : 'Pilih tanggal'
  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return new Date(view.getFullYear(), view.getMonth(), day)
  })
  const toISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const today = toISO(new Date())
  useEffect(() => {
    if (!open) return
    const close = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false) }
    const key = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
  }, [open])
  useEffect(() => {
    if (value) {
      const d = new Date(`${value}T12:00:00`)
      if (!Number.isNaN(d.getTime())) setView(new Date(d.getFullYear(), d.getMonth(), 1))
    }
  }, [value])
  return (
    <div className="themed-date-wrap" ref={wrapRef}>
      {label && <label className="themed-date-label" htmlFor={id}>{label}</label>}
      <button id={id} type="button" className="themed-date-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <CalendarDays size={15} /><span>{dateLabel}</span><ChevronDown size={14} className="date-trigger-chevron" />
      </button>
      {open && <div className="themed-calendar" role="dialog" aria-label="Pilih tanggal">
        <div className="calendar-head">
          <button type="button" aria-label="Bulan sebelumnya" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><ChevronDown size={16} className="calendar-prev" /></button>
          <strong>{monthLabel}</strong>
          <button type="button" aria-label="Bulan berikutnya" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><ChevronDown size={16} className="calendar-next" /></button>
        </div>
        <div className="calendar-grid calendar-weekdays">{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((date, index) => {
            const iso = toISO(date), inMonth = date.getMonth() === view.getMonth()
            return <button type="button" key={index} className={`calendar-day ${inMonth ? '' : 'outside'} ${iso === value ? 'selected' : ''} ${iso === today ? 'today' : ''}`} onClick={() => { onChange(iso); setOpen(false) }}>{date.getDate()}</button>
          })}
        </div>
        <div className="calendar-foot">
          <button type="button" onClick={() => { onChange(''); setOpen(false) }}>Hapus</button>
          <button type="button" onClick={() => { onChange(today); setView(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setOpen(false) }}>Hari ini</button>
        </div>
      </div>}
    </div>
  )
}

function Button({ children, variant = 'secondary', size, className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${size === 'small' ? 'btn-small' : ''} ${className}`} {...props}>
      {children}
    </button>
  )
}

function IconButton({ label, className = '', ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {props.children}
    </button>
  )
}

function StatCard({ label, value, hint, icon: Icon, accent = false }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card-accent' : ''}`}>
      <div className="stat-card-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={17} strokeWidth={1.7} /></span>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function EmptyState({ icon: Icon = Package, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={25} strokeWidth={1.5} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

function Dialog({ title, description, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <IconButton label="Tutup" onClick={onClose}><X size={18} /></IconButton>
        </div>
        {children}
      </section>
    </div>
  )
}

function TransactionRow({ tx, editable, onEdit, onDelete, compact = false }) {
  return (
    <div className={`transaction-row ${compact ? 'transaction-row-compact' : ''}`}>
      <div className="transaction-product-icon"><ShoppingBag size={16} /></div>
      <div className="transaction-main">
        <div className="transaction-name">{tx.product}</div>
        <div className="transaction-meta">
          {number(tx.quantity)} × {money(tx.unitPrice)} <span className="dot-separator">·</span> {formatTime(tx.createdAt)}
          <span className={`payment-chip ${tx.paymentStatus === 'debt' ? 'payment-debt' : 'payment-paid'}`}>{tx.paymentStatus === 'debt' ? 'Utang' : 'Lunas'}</span>
          {tx.paymentStatus === 'debt' && tx.customerName && <span className="tx-customer">· {tx.customerName}</span>}
          {tx.note && <span className="tx-note">· {tx.note}</span>}
        </div>
      </div>
      <div className="transaction-right">
        <strong>{money(Number(tx.quantity) * Number(tx.unitPrice))}</strong>
        {editable && (
          <div className="row-actions">
            <IconButton label="Edit transaksi" onClick={onEdit}><Edit3 size={14} /></IconButton>
            <IconButton label="Hapus transaksi" onClick={onDelete}><Trash2 size={14} /></IconButton>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [data, setData] = useState(() => loadData())
  const [page, setPage] = useState('sales')
  const [toast, setToast] = useState('')
  const [startDialog, setStartDialog] = useState(false)
  const [startForm, setStartForm] = useState({ date: localDateISO(), keeper: 'Saya', startAt: nowLocalInput() })
  const [txDialog, setTxDialog] = useState(null)
  const [txForm, setTxForm] = useState({ product: '', quantity: '1', unitPrice: '', paymentStatus: 'paid', customerName: '', note: '' })
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [selectedShiftId, setSelectedShiftId] = useState(null)
  const [correctionEnabled, setCorrectionEnabled] = useState(false)
  const [profileDialog, setProfileDialog] = useState(false)
  const [profileName, setProfileName] = useState(data.profile.name || 'Saya')
  const [historySearch, setHistorySearch] = useState('')
  const [historyFrom, setHistoryFrom] = useState('')
  const [historyTo, setHistoryTo] = useState('')
  const [reportType, setReportType] = useState('daily')
  const [reportDate, setReportDate] = useState(localDateISO())
  const restoreInputRef = useRef(null)
  const [lastSaved, setLastSaved] = useState(true)

  useEffect(() => {
    const saved = persistData(data)
    setLastSaved(saved)
  }, [data])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeShift = data.shifts.find((shift) => shift.status === 'active') || null
  const lastShift = [...data.shifts].sort((a, b) => new Date(b.startAt) - new Date(a.startAt))[0] || null
  const selectedShift = data.shifts.find((shift) => shift.id === selectedShiftId) || null
  const today = localDateISO()
  const todayShifts = data.shifts.filter((shift) => shift.date === today)
  const todayTotals = todayShifts.reduce((acc, shift) => {
    const totals = shiftTotals(shift)
    return { revenue: acc.revenue + totals.revenue, items: acc.items + totals.items, count: acc.count + totals.count }
  }, { revenue: 0, items: 0, count: 0 })
  const activeTotals = shiftTotals(activeShift)
  const activePaid = (activeShift?.transactions || []).filter((tx) => (tx.paymentStatus || 'paid') === 'paid').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)
  const activeDebt = (activeShift?.transactions || []).filter((tx) => tx.paymentStatus === 'debt').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)

  const updateShift = (shiftId, updater) => {
    setData((current) => ({
      ...current,
      shifts: current.shifts.map((shift) => shift.id === shiftId ? updater(shift) : shift),
    }))
  }

  const notify = (message) => setToast(message)

  const openStartDialog = () => {
    if (activeShift) {
      setPage('sales')
      notify('Masih ada shift aktif. Selesaikan shift tersebut terlebih dahulu.')
      return
    }
    setStartForm({ date: today, keeper: data.profile.name || 'Saya', startAt: nowLocalInput() })
    setStartDialog(true)
  }

  const startShift = (event) => {
    event.preventDefault()
    if (activeShift) return
    if (!startForm.date) {
      notify('Tanggal penjagaan belum dipilih.')
      return
    }
    if (!startForm.keeper.trim()) {
      notify('Nama penjaga belum diisi.')
      return
    }
    const startAt = new Date(startForm.startAt)
    if (Number.isNaN(startAt.getTime())) {
      notify('Waktu mulai tidak valid.')
      return
    }
    const shift = {
      id: createId(),
      date: startForm.date,
      keeper: startForm.keeper.trim(),
      startAt: startAt.toISOString(),
      endAt: null,
      status: 'active',
      transactions: [],
    }
    setData((current) => ({ ...current, shifts: [shift, ...current.shifts] }))
    setStartDialog(false)
    setPage('sales')
    notify('Shift penjagaan berhasil dimulai.')
  }

  const quickSaveTransaction = (event) => {
    event.preventDefault()
    if (!activeShift) return
    const product = txForm.product.trim()
    const quantity = Number(txForm.quantity)
    const unitPrice = Number(txForm.unitPrice)
    if (!product) return notify('Nama produk wajib diisi.')
    if (txForm.paymentStatus === 'debt' && !txForm.customerName.trim()) return notify('Nama pelanggan perlu diisi untuk transaksi utang.')
    if (!Number.isInteger(quantity) || quantity < 1 || txForm.unitPrice === '' || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return notify('Periksa jumlah dan harga satuan.')
    }
    const timestamp = new Date().toISOString()
    const transaction = { id: createId(), product, quantity, unitPrice, paymentStatus: txForm.paymentStatus || 'paid', customerName: txForm.paymentStatus === 'debt' ? txForm.customerName.trim() : '', note: txForm.note.trim(), createdAt: timestamp, updatedAt: timestamp }
    updateShift(activeShift.id, (current) => ({ ...current, transactions: [transaction, ...current.transactions] }))
    setTxForm({ product: '', quantity: '1', unitPrice: '', paymentStatus: 'paid', customerName: '', note: '' })
    notify('Penjualan berhasil disimpan.')
  }

  const openEditTransaction = (shiftId, tx) => {
    setTxForm({ product: tx.product, quantity: String(tx.quantity), unitPrice: String(tx.unitPrice), paymentStatus: tx.paymentStatus || 'paid', customerName: tx.customerName || '', note: tx.note || '' })
    setTxDialog({ mode: 'edit', shiftId, txId: tx.id })
  }

  const saveTransaction = (event) => {
    event.preventDefault()
    const product = txForm.product.trim()
    const quantity = Number(txForm.quantity)
    const unitPrice = Number(txForm.unitPrice)
    if (!txDialog?.shiftId || !product) {
      notify('Nama produk wajib diisi.')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      notify('Periksa jumlah dan harga satuan.')
      return
    }
    if (txForm.paymentStatus === 'debt' && !txForm.customerName.trim()) {
      notify('Nama pelanggan perlu diisi untuk transaksi utang.')
      return
    }
    const shift = data.shifts.find((item) => item.id === txDialog.shiftId)
    if (!shift) return
    if (shift.status === 'completed' && !correctionEnabled) {
      notify('Aktifkan mode koreksi terlebih dahulu dari detail riwayat.')
      return
    }
    const timestamp = new Date().toISOString()
    if (txDialog.mode === 'create') {
      const transaction = {
        id: createId(),
        product,
        quantity,
        unitPrice,
        paymentStatus: txForm.paymentStatus || 'paid',
        customerName: txForm.paymentStatus === 'debt' ? txForm.customerName.trim() : '',
        note: txForm.note.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      updateShift(txDialog.shiftId, (current) => ({ ...current, transactions: [transaction, ...current.transactions] }))
      setTxForm({ product: '', quantity: '1', unitPrice: '', paymentStatus: 'paid', customerName: '', note: '' })
      notify('Penjualan berhasil disimpan.')
    } else {
      updateShift(txDialog.shiftId, (current) => ({
        ...current,
        transactions: current.transactions.map((item) => item.id === txDialog.txId
          ? { ...item, product, quantity, unitPrice, paymentStatus: txForm.paymentStatus || 'paid', customerName: txForm.paymentStatus === 'debt' ? txForm.customerName.trim() : '', note: txForm.note.trim(), updatedAt: timestamp }
          : item),
      }))
      notify('Transaksi berhasil diperbarui.')
    }
    setTxDialog(null)
  }

  const askDeleteTransaction = (shiftId, tx) => {
    const shift = data.shifts.find((item) => item.id === shiftId)
    if (shift?.status === 'completed' && !correctionEnabled) {
      notify('Aktifkan mode koreksi terlebih dahulu dari detail riwayat.')
      return
    }
    setConfirmDialog({
      title: 'Hapus transaksi?',
      description: `Catatan ${tx.product} akan dihapus dari shift ini. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Ya, hapus',
      danger: true,
      onConfirm: () => {
        updateShift(shiftId, (current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== tx.id) }))
        setConfirmDialog(null)
        notify('Transaksi berhasil dihapus.')
      },
    })
  }

  const finishShift = () => {
    if (!activeShift) return
    setConfirmDialog({
      title: 'Selesaikan penjagaan?',
      description: 'Shift akan ditandai selesai dan waktu selesai dicatat otomatis. Kamu tetap bisa melihat dan mengoreksi catatan melalui Riwayat.',
      confirmLabel: 'Selesaikan shift',
      onConfirm: () => {
        const finished = { ...activeShift, status: 'completed', endAt: new Date().toISOString() }
        updateShift(activeShift.id, () => finished)
        setConfirmDialog(null)
        setSelectedShiftId(finished.id)
        setCorrectionEnabled(false)
        notify('Shift selesai. Rekap akhir sudah tersimpan.')
      },
    })
  }

  const activateCorrection = () => {
    setConfirmDialog({
      title: 'Aktifkan mode koreksi?',
      description: 'Mode ini memungkinkan perubahan pada transaksi shift yang sudah selesai. Pastikan perubahan sesuai catatan sebenarnya.',
      confirmLabel: 'Aktifkan koreksi',
      onConfirm: () => {
        setCorrectionEnabled(true)
        setConfirmDialog(null)
        notify('Mode koreksi aktif untuk shift ini.')
      },
    })
  }

  const saveProfile = (event) => {
    event.preventDefault()
    if (!profileName.trim()) return notify('Nama tidak boleh kosong.')
    setData((current) => ({ ...current, profile: { ...current.profile, name: profileName.trim() } }))
    setProfileDialog(false)
    notify('Nama penjaga berhasil diperbarui.')
  }

  const filteredShifts = useMemo(() => {
    const query = historySearch.trim().toLowerCase()
    return [...data.shifts]
      .filter((shift) => !historyFrom || shift.date >= historyFrom)
      .filter((shift) => !historyTo || shift.date <= historyTo)
      .filter((shift) => !query || shift.keeper.toLowerCase().includes(query) || shift.transactions.some((tx) => tx.product.toLowerCase().includes(query)))
      .sort((a, b) => `${b.date}${b.startAt}`.localeCompare(`${a.date}${a.startAt}`))
  }, [data.shifts, historyFrom, historyTo, historySearch])

  const reportPeriod = useMemo(() => {
    const [year, month, day] = reportDate.split('-').map(Number)
    const reference = new Date(year, month - 1, day)
    let start = new Date(year, month - 1, day)
    let end = new Date(year, month - 1, day)
    if (reportType === 'weekly') {
      const dayOfWeek = (reference.getDay() + 6) % 7
      start.setDate(reference.getDate() - dayOfWeek)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
    } else if (reportType === 'monthly') {
      start = new Date(year, month - 1, 1)
      end = new Date(year, month, 0)
    }
    const toISO = (date) => localDateISO(date)
    return { start: toISO(start), end: toISO(end) }
  }, [reportDate, reportType])

  const reportShifts = useMemo(() => data.shifts
    .filter((shift) => shift.date >= reportPeriod.start && shift.date <= reportPeriod.end)
    .sort((a, b) => `${a.date}${a.startAt}`.localeCompare(`${b.date}${b.startAt}`)), [data.shifts, reportPeriod])

  const reportTotals = reportShifts.reduce((acc, shift) => {
    const totals = shiftTotals(shift)
    return { revenue: acc.revenue + totals.revenue, items: acc.items + totals.items, count: acc.count + totals.count }
  }, { revenue: 0, items: 0, count: 0 })
  const reportTransactions = reportShifts.flatMap((shift) => shift.transactions)
  const reportPaid = reportTransactions.filter((tx) => (tx.paymentStatus || 'paid') === 'paid').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)
  const reportDebt = reportTransactions.filter((tx) => tx.paymentStatus === 'debt').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)

  const productSummary = useMemo(() => {
    const products = new Map()
    reportShifts.forEach((shift) => shift.transactions.forEach((tx) => {
      const key = tx.product.trim().toLocaleLowerCase('id-ID')
      const current = products.get(key) || { name: tx.product, quantity: 0, revenue: 0, transactions: 0 }
      current.quantity += Number(tx.quantity)
      current.revenue += Number(tx.quantity) * Number(tx.unitPrice)
      current.transactions += 1
      products.set(key, current)
    }))
    return [...products.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
  }, [reportShifts])

  const recentTransactions = useMemo(() => data.shifts
    .flatMap((shift) => shift.transactions.map((tx) => ({ ...tx, shiftDate: shift.date, shiftKeeper: shift.keeper, shiftId: shift.id })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5), [data.shifts])

  const buildReportText = () => {
    const periodLabel = reportType === 'daily' ? formatDate(reportPeriod.start) : `${formatDate(reportPeriod.start)} — ${formatDate(reportPeriod.end)}`
    const lines = [
      'LAPORAN PENJUALAN WARUNG',
      `Periode: ${periodLabel}`,
      `Penjaga: ${[...new Set(reportShifts.map((shift) => shift.keeper))].join(', ') || data.profile.name}`,
      '',
      'RINCIAN PER SHIFT',
    ]
    reportShifts.forEach((shift, index) => {
      const totals = shiftTotals(shift)
      lines.push(`${index + 1}. ${formatDate(shift.date)} | ${formatTime(shift.startAt)} - ${shift.endAt ? formatTime(shift.endAt) : 'Masih aktif'} | ${shift.keeper}`)
      shift.transactions.forEach((tx) => lines.push(`   • ${tx.product} — ${tx.quantity} × ${money(tx.unitPrice)} = ${money(Number(tx.quantity) * Number(tx.unitPrice))} | ${(tx.paymentStatus || 'paid') === 'debt' ? `UTANG${tx.customerName ? ` (${tx.customerName})` : ''}` : 'LUNAS'}${tx.note ? ` | Catatan: ${tx.note}` : ''}`))
      lines.push(`   Subtotal shift: ${money(totals.revenue)} | ${totals.items} item | ${totals.count} transaksi`)
    })
    const paidReport = reportShifts.flatMap((shift) => shift.transactions).filter((tx) => (tx.paymentStatus || 'paid') === 'paid').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)
    const debtReport = reportShifts.flatMap((shift) => shift.transactions).filter((tx) => tx.paymentStatus === 'debt').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0)
    lines.push('', `Total barang: ${number(reportTotals.items)} item`, `Total transaksi: ${number(reportTotals.count)}`, `TOTAL OMZET: ${money(reportTotals.revenue)}`, `Uang diterima: ${money(paidReport)}`, `Belum dibayar / utang: ${money(debtReport)}`, '', 'Catatan: Omzet mencakup transaksi lunas dan utang; uang diterima hanya transaksi lunas. Omzet bukan keuntungan bersih.')
    return lines.join('\n')
  }

  const copyReport = async () => {
    const text = buildReportText()
    try {
      await navigator.clipboard.writeText(text)
      notify('Ringkasan laporan berhasil disalin.')
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      textarea.remove()
      notify(success ? 'Ringkasan laporan berhasil disalin.' : 'Gagal menyalin ringkasan.')
    }
  }

  const exportCSV = () => {
    const rows = [['Tanggal', 'Penjaga', 'Status Shift', 'Waktu Mulai', 'Waktu Selesai', 'Produk', 'Jumlah', 'Harga Satuan', 'Subtotal', 'Status Pembayaran', 'Nama Pelanggan', 'Catatan', 'Waktu Transaksi']]
    reportShifts.forEach((shift) => shift.transactions.forEach((tx) => rows.push([
      shift.date,
      shift.keeper,
      shift.status === 'active' ? 'Aktif' : 'Selesai',
      formatTime(shift.startAt),
      shift.endAt ? formatTime(shift.endAt) : '',
      tx.product,
      tx.quantity,
      tx.unitPrice,
      Number(tx.quantity) * Number(tx.unitPrice),
      (tx.paymentStatus || 'paid') === 'debt' ? 'Utang' : 'Lunas',
      tx.customerName || '',
      tx.note || '',
      formatTime(tx.createdAt),
    ])))
    const csv = '\uFEFF' + rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `warungflow-laporan-${reportPeriod.start}-${reportPeriod.end}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('File CSV berhasil dibuat.')
  }

  const exportBackup = () => {
    const payload = { ...data, version: APP_VERSION, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `warungflow-backup-${today}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Backup data berhasil diunduh.')
  }

  const restoreBackup = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const backup = JSON.parse(await file.text())
      if (!validateBackup(backup)) throw new Error('Format backup tidak sesuai.')
      setConfirmDialog({
        title: 'Pulihkan backup?',
        description: 'Data saat ini akan digantikan oleh isi file backup. Unduh backup terbaru terlebih dahulu bila masih diperlukan.',
        confirmLabel: 'Pulihkan data',
        danger: true,
        onConfirm: () => {
          setData({ version: APP_VERSION, profile: { name: backup.profile?.name || 'Saya' }, shifts: backup.shifts })
          setConfirmDialog(null)
          setPage('home')
          setSelectedShiftId(null)
          setCorrectionEnabled(false)
          notify('Backup berhasil dipulihkan.')
        },
      })
    } catch (error) {
      notify(error.message || 'File backup tidak valid.')
    } finally {
      event.target.value = ''
    }
  }

  const printReport = () => window.print()

  const openShiftDetail = (shiftId) => {
    setSelectedShiftId(shiftId)
    setCorrectionEnabled(false)
  }

  const closeShiftDetail = () => {
    setSelectedShiftId(null)
    setCorrectionEnabled(false)
  }

  const navTo = (nextPage) => {
    setPage(nextPage)
    setSelectedShiftId(null)
  }

  const reportTitle = reportType === 'daily' ? 'Laporan Harian' : reportType === 'weekly' ? 'Laporan Mingguan' : 'Laporan Bulanan'

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand-lockup" onClick={() => navTo('home')} aria-label="Ke halaman utama">
          <img className="brand-logo" src="/warung-boim-logo.png" alt="Warung Boim" />
          <div className="brand-copy"><strong>warung<span>flow</span></strong><small>PERSONAL SALES TRACKER</small></div>
        </button>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => navTo(id)} className={`nav-link ${page === id ? 'active' : ''}`}>
              <Icon size={16} strokeWidth={1.8} /> {label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <div className="save-indicator"><span className={lastSaved ? 'save-dot' : 'save-dot error'} />{lastSaved ? 'Tersimpan' : 'Belum tersimpan'}</div>
          <button className="profile-chip" onClick={() => { setProfileName(data.profile.name || 'Saya'); setProfileDialog(true) }}>
            <span className="avatar">{(data.profile.name || 'S').trim().charAt(0).toUpperCase()}</span>
            <span className="profile-name">{data.profile.name || 'Saya'}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {page === 'home' && (
          <>
            <section className="compact-welcome">
              <div>
                <div className="eyebrow"><Sparkles size={12} /> WARUNG BOIM · HARI INI</div>
                <h1>{getTodayGreeting()}, <span>{data.profile.name || 'teman'}.</span></h1>
                <p><CalendarDays size={14} /> {formatDate(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className={`shift-status compact-status ${activeShift ? 'is-active' : ''}`}>
                <i className="status-pulse" /> {activeShift ? 'Jaga aktif' : 'Belum mulai'}
              </span>
            </section>

            <section className="compact-revenue-card">
              <div className="compact-revenue-top">
                <span>OMZET HARI INI</span>
                <span><Wallet size={15} /> {number(todayTotals.count)} transaksi</span>
              </div>
              <strong>{money(todayTotals.revenue)}</strong>
              <div className="compact-revenue-bottom">
                <span>{number(todayTotals.items)} barang terjual</span>
                {activeShift
                  ? <Button variant="primary" onClick={() => navTo('sales')}>Lanjut input <ArrowRight size={15} /></Button>
                  : <Button variant="primary" onClick={openStartDialog}><Plus size={15} /> Mulai jaga</Button>}
              </div>
            </section>

            <section className="compact-shift-strip">
              <div className="compact-shift-icon"><Clock3 size={17} /></div>
              <div className="compact-shift-copy">
                <strong>{activeShift ? 'Shift sedang berjalan' : lastShift ? 'Penjagaan terakhir' : 'Belum ada catatan penjagaan'}</strong>
                <span>{activeShift
                  ? `${formatTime(activeShift.startAt)} · ${activeShift.keeper} · ${number(activeTotals.count)} transaksi`
                  : lastShift
                    ? `${formatDate(lastShift.date)} · ${formatTime(lastShift.startAt)}${lastShift.endAt ? `–${formatTime(lastShift.endAt)}` : ''}`
                    : 'Mulai shift untuk mencatat penjualan.'}</span>
              </div>
              {activeShift && <span className="live-badge"><span /> LIVE</span>}
            </section>

            <section className="compact-activity surface-panel">
              <SectionHeading eyebrow="CATATAN TERBARU" title="Penjualan terakhir" action={<button className="text-action" onClick={() => navTo('history')}>Riwayat <ChevronRight size={14} /></button>} />
              {recentTransactions.length ? (
                <div className="transaction-list compact-list">
                  {recentTransactions.slice(0, 4).map((tx) => (
                    <button className="recent-row" key={tx.id} onClick={() => openShiftDetail(tx.shiftId)}>
                      <span className="recent-icon"><ShoppingBag size={15} /></span>
                      <span className="recent-copy"><b>{tx.product}</b><small>{formatDate(tx.shiftDate, { day: 'numeric', month: 'short' })} · {number(tx.quantity)} item</small></span>
                      <strong>{money(Number(tx.quantity) * Number(tx.unitPrice))}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingBag} title="Belum ada penjualan" description="Transaksi yang kamu catat akan tampil di sini." action={<Button variant="outline" onClick={() => navTo('sales')}>Buka input penjualan</Button>} />
              )}
            </section>
            <p className="private-note"><ShieldCheck size={14} /> Data tersimpan di browser perangkat ini. Backup secara berkala.</p>
          </>
        )}

        {page === 'sales' && (
          <>
            <section className="page-intro">
              <div><div className="eyebrow">INPUT PENJUALAN</div><h1>Catat <span>barang terjual.</span></h1><p>Isi produk, jumlah, dan harga. Total dihitung otomatis.</p></div>
              {activeShift && <span className="live-badge"><span /> SHIFT AKTIF</span>}
            </section>
            {activeShift ? (
              <div className="sales-layout">
                <div className="sales-main-column">
                  <section className="surface-panel add-sale-panel">
                    <SectionHeading eyebrow="NEW ENTRY" title="Tambah penjualan" />
                    <form className="sale-form" onSubmit={quickSaveTransaction}>
                      <div className="field-group field-product"><label htmlFor="quick-product">Nama produk</label><input id="quick-product" autoFocus placeholder="Nama produk, mis. Indomie Goreng" value={txForm.product} onChange={(event) => setTxForm((current) => ({ ...current, product: event.target.value }))}  /></div>
                      <div className="field-row">
                        <div className="field-group"><label htmlFor="quick-qty">Jumlah</label><div className="number-input"><button type="button" onClick={() => setTxForm((current) => ({ ...current, quantity: String(Math.max(1, Number(current.quantity || 1) - 1)) }))}><Minus size={14} /></button><input id="quick-qty" inputMode="numeric" type="number" min="1" step="1" value={txForm.quantity} onChange={(event) => setTxForm((current) => ({ ...current, quantity: event.target.value }))} /><button type="button" onClick={() => setTxForm((current) => ({ ...current, quantity: String(Math.max(1, Number(current.quantity || 0) + 1)) }))}><Plus size={14} /></button></div></div>
                        <div className="field-group"><label htmlFor="quick-price">Harga satuan</label><div className="currency-input"><span>Rp</span><input id="quick-price" inputMode="numeric" type="number" min="0" step="100" placeholder="3.500" value={txForm.unitPrice} onChange={(event) => setTxForm((current) => ({ ...current, unitPrice: event.target.value }))} /></div></div>
                      </div>
                      <div className="field-group payment-field">
                        <label>Status pembayaran</label>
                        <div className="payment-choice" role="group" aria-label="Status pembayaran">
                          <button type="button" className={txForm.paymentStatus === 'paid' ? 'selected' : ''} onClick={() => setTxForm((current) => ({ ...current, paymentStatus: 'paid', customerName: '' }))}><CheckCircle2 size={15} /> Bayar langsung</button>
                          <button type="button" className={txForm.paymentStatus === 'debt' ? 'selected debt-selected' : ''} onClick={() => setTxForm((current) => ({ ...current, paymentStatus: 'debt' }))}><Clock3 size={15} /> Utang</button>
                        </div>
                      </div>
                      {txForm.paymentStatus === 'debt' && <div className="field-group"><label htmlFor="quick-customer">Nama pelanggan yang berutang</label><input id="quick-customer" placeholder="Nama pelanggan" value={txForm.customerName} onChange={(event) => setTxForm((current) => ({ ...current, customerName: event.target.value }))} required /></div>}
                      <div className="field-group"><label htmlFor="quick-note">Catatan <span className="optional-label">Opsional</span></label><input id="quick-note" placeholder="Contoh: titip bayar sore / ambil besok" value={txForm.note} onChange={(event) => setTxForm((current) => ({ ...current, note: event.target.value }))} /></div>
                      <div className="subtotal-strip"><div><small>SUBTOTAL OTOMATIS</small><strong>{money((Number(txForm.quantity) || 0) * (Number(txForm.unitPrice) || 0))}</strong></div><Button variant="primary" type="submit">Simpan penjualan <ArrowRight size={16} /></Button></div>
                    </form>
                    <div className="form-footnote"><ShieldCheck size={14} /> Nama produk bebas diketik. Tidak perlu membuat katalog terlebih dahulu.</div>
                  </section>

                  <section className="surface-panel sales-list-panel">
                    <SectionHeading eyebrow="SHIFT TRANSACTIONS" title="Produk terjual" action={<span className="count-pill">{number(activeTotals.count)} catatan</span>} />
                    {activeShift.transactions.length ? (
                      <div className="transaction-list">
                        {[...activeShift.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((tx) => (
                          <TransactionRow key={tx.id} tx={tx} editable onEdit={() => openEditTransaction(activeShift.id, tx)} onDelete={() => askDeleteTransaction(activeShift.id, tx)} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={ShoppingBag} title="Belum ada produk tercatat" description="Setiap penjualan yang kamu simpan akan muncul di daftar ini." />
                    )}
                  </section>
                </div>
                <aside className="sales-side-column">
                  <section className="summary-card">
                    <div className="summary-card-top"><div><span className="summary-overline">SHIFT SUMMARY</span><span className="summary-live"><i /> ONGOING</span></div><Wallet size={19} /></div>
                    <div className="summary-total-label">TOTAL OMZET SEMENTARA</div>
                    <div className="summary-total">{money(activeTotals.revenue)}</div>
                    <div className="summary-divider" />
                    <div className="summary-detail"><span>Uang diterima</span><b className="paid-amount">{money(activePaid)}</b></div>
                    <div className="summary-detail"><span>Belum dibayar / utang</span><b className="debt-amount">{money(activeDebt)}</b></div>
                    <div className="summary-detail"><span>Total barang</span><b>{number(activeTotals.items)} item</b></div>
                    <div className="summary-detail"><span>Jumlah transaksi</span><b>{number(activeTotals.count)}</b></div>
                    <div className="summary-detail"><span>Mulai pukul</span><b>{formatTime(activeShift.startAt)}</b></div>
                    <div className="summary-date"><CalendarDays size={14} /> {formatDate(activeShift.date)}</div>
                    <Button variant="finish" className="full-width" onClick={finishShift}>Selesaikan shift <CheckCircle2 size={16} /></Button>
                    <p className="summary-caption">Pastikan semua penjualan sudah dicatat sebelum menyelesaikan shift.</p>
                  </section>
                  <div className="tip-card"><Sparkles size={17} /><div><b>Catatan kecil</b><p>Catat transaksi segera setelah produk terjual agar tidak ada yang terlewat.</p></div></div>
                </aside>
              </div>
            ) : (
              <section className="surface-panel no-active-panel"><EmptyState icon={Clock3} title="Belum ada shift berjalan" description="Mulai sesi penjagaan terlebih dahulu untuk mencatat produk yang terjual." action={<Button variant="primary" onClick={openStartDialog}><Plus size={16} /> Mulai jaga warung</Button>} /></section>
            )}
          </>
        )}

        {page === 'history' && (
          <>
            <section className="page-intro"><div><div className="eyebrow">SHIFT ARCHIVE</div><h1>Riwayat <span>penjagaan.</span></h1><p>Semua sesi penjagaan tersimpan rapi dan bisa dibuka kembali.</p></div><div className="history-total"><strong>{number(data.shifts.length)}</strong><span>total shift</span></div></section>
            <section className="surface-panel history-panel">
              <div className="history-toolbar">
                <div className="search-field"><Search size={16} /><input placeholder="Cari penjaga atau nama produk..." value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} /></div>
                <div className="date-filter"><label>Dari <DatePicker value={historyFrom} onChange={setHistoryFrom} /></label><label>Sampai <DatePicker value={historyTo} onChange={setHistoryTo} /></label></div>
              </div>
              {filteredShifts.length ? (
                <div className="shift-list">
                  {filteredShifts.map((shift) => {
                    const totals = shiftTotals(shift)
                    return (
                      <button className="shift-list-row" key={shift.id} onClick={() => openShiftDetail(shift.id)}>
                        <div className="shift-date-icon"><CalendarDays size={18} /></div>
                        <div className="shift-list-main"><strong>{formatDate(shift.date)}</strong><span>{shift.keeper} <i>·</i> {formatTime(shift.startAt)} – {shift.endAt ? formatTime(shift.endAt) : 'Berjalan'}</span></div>
                        <div className="shift-list-stats"><strong>{money(totals.revenue)}</strong><span>{number(totals.items)} item <i>·</i> {number(totals.count)} transaksi</span></div>
                        <span className={`shift-state ${shift.status === 'active' ? 'state-active' : ''}`}>{shift.status === 'active' ? 'Aktif' : 'Selesai'}</span>
                        <ChevronRight size={17} className="shift-chevron" />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon={History} title="Riwayat tidak ditemukan" description={data.shifts.length ? 'Coba ubah kata pencarian atau rentang tanggal.' : 'Shift yang sudah kamu mulai akan tersimpan di sini.'} />
              )}
            </section>
            <section className="backup-panel">
              <div className="backup-copy"><div className="backup-icon"><ShieldCheck size={19} /></div><div><strong>Jaga salinan datamu.</strong><p>Unduh backup secara berkala atau pulihkan data dari file JSON sebelumnya.</p></div></div>
              <div className="backup-actions"><Button variant="outline" onClick={exportBackup}><Download size={15} /> Backup data</Button><Button variant="ghost" onClick={() => restoreInputRef.current?.click()}><Upload size={15} /> Restore</Button><input ref={restoreInputRef} type="file" accept="application/json,.json" hidden onChange={restoreBackup} /></div>
            </section>
          </>
        )}

        {page === 'reports' && (
          <>
            <section className="page-intro"><div><div className="eyebrow">SALES INSIGHTS</div><h1>Laporan <span>penjualan.</span></h1><p>Rekap yang mudah dibaca dan siap dibagikan kepada orang tua.</p></div><div className="report-period-indicator"><FileText size={16} /><span>{reportPeriod.start === reportPeriod.end ? formatDate(reportPeriod.start) : `${formatDate(reportPeriod.start, { day: 'numeric', month: 'short' })} — ${formatDate(reportPeriod.end, { day: 'numeric', month: 'short', year: 'numeric' })}`}</span></div></section>
            <section className="surface-panel report-panel">
              <div className="report-toolbar">
                <div className="segmented-control" role="tablist" aria-label="Periode laporan">
                  {[['daily', 'Harian'], ['weekly', 'Mingguan'], ['monthly', 'Bulanan']].map(([value, label]) => <button key={value} className={reportType === value ? 'selected' : ''} onClick={() => setReportType(value)}>{label}</button>)}
                </div>
                <div className="report-date-input"><DatePicker value={reportDate} onChange={setReportDate} /></div>
              </div>
              <div className="report-total-card">
                <div><span className="eyebrow">{reportTitle.toUpperCase()} · TOTAL OMZET</span><strong>{money(reportTotals.revenue)}</strong><small>{reportShifts.length} shift tercatat pada periode ini</small></div>
                <div className="report-total-mark"><TrendingUp size={24} /></div>
              </div>
              <div className="report-stats-row"><div><span>Uang diterima</span><b className="paid-amount">{money(reportPaid)}</b></div><div><span>Masih utang</span><b className="debt-amount">{money(reportDebt)}</b></div><div><span>Total barang</span><b>{number(reportTotals.items)} <small>item</small></b></div></div>
              <div className="report-payment-note"><span>{number(reportTotals.count)} transaksi · {number(reportShifts.length)} shift</span><span>Omzet = lunas + utang</span></div>
              <div className="report-content-grid">
                <div className="report-detail-section"><SectionHeading eyebrow="PRODUCT PERFORMANCE" title="Produk terlaris" />
                  {productSummary.length ? <div className="product-ranking">{productSummary.slice(0, 6).map((product, index) => <div className="ranking-row" key={product.name.toLowerCase()}><span className="ranking-number">{String(index + 1).padStart(2, '0')}</span><div className="ranking-main"><b>{product.name}</b><small>{number(product.transactions)} transaksi</small></div><div className="ranking-right"><b>{number(product.quantity)} item</b><small>{money(product.revenue)}</small></div></div>)}</div> : <EmptyState icon={BarChart3} title="Belum ada data laporan" description="Transaksi di periode yang dipilih akan dirangkum di sini." />}
                </div>
                <div className="report-detail-section"><SectionHeading eyebrow="SHIFT BREAKDOWN" title="Rincian per shift" />
                  {reportShifts.length ? <div className="report-shift-list">{reportShifts.map((shift) => { const totals = shiftTotals(shift); return <button key={shift.id} className="report-shift-row" onClick={() => openShiftDetail(shift.id)}><span className="report-shift-date">{formatDate(shift.date, { day: 'numeric', month: 'short' })}</span><span className="report-shift-copy"><b>{shift.keeper}</b><small>{formatTime(shift.startAt)} – {shift.endAt ? formatTime(shift.endAt) : 'Aktif'}</small></span><strong>{money(totals.revenue)}</strong><ChevronRight size={15} /></button> })}</div> : <p className="muted small-empty">Belum ada shift di periode ini.</p>}
                </div>
              </div>
              <div className="report-actions"><div className="report-note"><ShieldCheck size={15} /><span>Omzet penjualan, bukan keuntungan bersih. Shift aktif ikut dihitung sementara.</span></div><div className="report-buttons"><Button variant="outline" onClick={copyReport}><Copy size={15} /> Salin ringkasan</Button><Button variant="outline" onClick={exportCSV}><FileDown size={15} /> Export CSV</Button><Button variant="primary" onClick={printReport}><Download size={15} /> Export PDF</Button></div></div>
            </section>
            <div className="print-report">
              <div className="print-brand">WARUNGFLOW <span>PERSONAL SALES TRACKER</span></div>
              <h1>Laporan Penjualan Warung</h1>
              <p className="print-subtitle">Periode: {reportPeriod.start === reportPeriod.end ? formatDate(reportPeriod.start) : `${formatDate(reportPeriod.start)} — ${formatDate(reportPeriod.end)}`}</p>
              <div className="print-total"><span>TOTAL OMZET</span><strong>{money(reportTotals.revenue)}</strong></div>
              <div className="print-metrics">
                <span>Uang diterima <b>{money(reportPaid)}</b></span>
                <span>Belum dibayar / utang <b>{money(reportDebt)}</b></span>
                <span>Total barang <b>{number(reportTotals.items)} item</b></span>
                <span>Transaksi <b>{number(reportTotals.count)}</b></span>
                <span>Jumlah shift <b>{number(reportShifts.length)}</b></span>
              </div>
              <div className="print-payment-legend">
                <span><i className="print-dot paid-dot" /> Lunas — pembayaran sudah diterima</span>
                <span><i className="print-dot debt-dot" /> Utang — pembayaran belum diterima</span>
              </div>
              {reportShifts.map((shift) => <div className="print-shift" key={shift.id}><h3>{formatDate(shift.date)} · {shift.keeper}</h3><p>{formatTime(shift.startAt)} – {shift.endAt ? formatTime(shift.endAt) : 'Masih aktif'}</p><table><thead><tr><th>Produk</th><th>Jumlah</th><th>Harga satuan</th><th>Subtotal</th><th>Pembayaran</th><th>Catatan</th></tr></thead><tbody>{shift.transactions.map((tx) => <tr key={tx.id}><td>{tx.product}{tx.paymentStatus === 'debt' && tx.customerName ? ` (${tx.customerName})` : ''}</td><td>{tx.quantity}</td><td>{money(tx.unitPrice)}</td><td>{money(Number(tx.quantity) * Number(tx.unitPrice))}</td><td>{(tx.paymentStatus || 'paid') === 'debt' ? 'Utang' : 'Lunas'}</td><td>{tx.note || '—'}</td></tr>)}</tbody></table><div className="print-shift-total">Subtotal shift: {money(shiftTotals(shift).revenue)} · Uang diterima: {money(shift.transactions.filter((tx) => (tx.paymentStatus || 'paid') === 'paid').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0))} · Utang: {money(shift.transactions.filter((tx) => tx.paymentStatus === 'debt').reduce((sum, tx) => sum + Number(tx.quantity) * Number(tx.unitPrice), 0))}</div></div>)}
              <p className="print-footnote">Catatan: Omzet mencakup transaksi lunas dan utang. Uang diterima hanya transaksi lunas. Omzet bukan keuntungan bersih.</p>
            </div>
          </>
        )}
      </main>

      <footer className="app-footer"><span>© {new Date().getFullYear()} WarungFlow</span><span>PERSONAL · LOCAL ONLY · V 1.0</span></footer>

      <nav className="mobile-bottom-nav" aria-label="Navigasi mobile">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navTo(id)} className={page === id ? 'active' : ''}><span><Icon size={19} strokeWidth={1.8} /></span><small>{label}</small></button>)}
      </nav>

      {startDialog && <Dialog title="Mulai shift penjagaan" description="Buat sesi baru untuk mencatat semua penjualanmu." onClose={() => setStartDialog(false)}>
        <form className="modal-form" onSubmit={startShift}>
          <div className="field-group"><DatePicker id="shift-date" label="Tanggal penjagaan" required value={startForm.date} onChange={(date) => setStartForm((current) => ({ ...current, date }))} /></div>
          <div className="field-group"><label htmlFor="shift-keeper">Nama penjaga</label><input id="shift-keeper" value={startForm.keeper} onChange={(event) => setStartForm((current) => ({ ...current, keeper: event.target.value }))} placeholder="Nama kamu" required /></div>
          <div className="field-group"><label htmlFor="shift-start">Waktu mulai</label><input id="shift-start" type="datetime-local" required value={startForm.startAt} onChange={(event) => setStartForm((current) => ({ ...current, startAt: event.target.value }))} /></div>
          <div className="modal-actions"><Button variant="ghost" type="button" onClick={() => setStartDialog(false)}>Batal</Button><Button variant="primary" type="submit"><Plus size={16} /> Mulai shift</Button></div>
        </form>
      </Dialog>}

      {txDialog && <Dialog title={txDialog.mode === 'create' ? 'Tambah penjualan' : 'Edit transaksi'} description="Isi detail produk yang terjual." onClose={() => setTxDialog(null)}>
        <form className="modal-form" onSubmit={saveTransaction}>
          <div className="field-group"><label htmlFor="tx-product">Nama produk</label><input id="tx-product" autoFocus placeholder="Contoh: Indomie Goreng" value={txForm.product} onChange={(event) => setTxForm((current) => ({ ...current, product: event.target.value }))} required /></div>
          <div className="field-row"><div className="field-group"><label htmlFor="tx-quantity">Jumlah</label><input id="tx-quantity" type="number" min="1" step="1" value={txForm.quantity} onChange={(event) => setTxForm((current) => ({ ...current, quantity: event.target.value }))} required /></div><div className="field-group"><label htmlFor="tx-price">Harga satuan (Rp)</label><input id="tx-price" type="number" min="0" step="100" value={txForm.unitPrice} onChange={(event) => setTxForm((current) => ({ ...current, unitPrice: event.target.value }))} required /></div></div>
          <div className="field-group payment-field"><label>Status pembayaran</label><div className="payment-choice" role="group" aria-label="Status pembayaran"><button type="button" className={txForm.paymentStatus === 'paid' ? 'selected' : ''} onClick={() => setTxForm((current) => ({ ...current, paymentStatus: 'paid', customerName: '' }))}><CheckCircle2 size={15} /> Bayar langsung</button><button type="button" className={txForm.paymentStatus === 'debt' ? 'selected debt-selected' : ''} onClick={() => setTxForm((current) => ({ ...current, paymentStatus: 'debt' }))}><Clock3 size={15} /> Utang</button></div></div>
          {txForm.paymentStatus === 'debt' && <div className="field-group"><label htmlFor="tx-customer">Nama pelanggan yang berutang</label><input id="tx-customer" placeholder="Nama pelanggan" value={txForm.customerName} onChange={(event) => setTxForm((current) => ({ ...current, customerName: event.target.value }))} required /></div>}
          <div className="field-group"><label htmlFor="tx-note">Catatan <span className="optional-label">Opsional</span></label><input id="tx-note" placeholder="Catatan tambahan" value={txForm.note} onChange={(event) => setTxForm((current) => ({ ...current, note: event.target.value }))} /></div>
          <div className="modal-subtotal"><span>Subtotal otomatis</span><strong>{money((Number(txForm.quantity) || 0) * (Number(txForm.unitPrice) || 0))}</strong></div>
          <div className="modal-actions"><Button variant="ghost" type="button" onClick={() => setTxDialog(null)}>Batal</Button><Button variant="primary" type="submit">{txDialog.mode === 'create' ? 'Simpan penjualan' : 'Simpan perubahan'} <Check size={15} /></Button></div>
        </form>
      </Dialog>}

      {profileDialog && <Dialog title="Profil penjaga" description="Nama ini digunakan pada laporan dan sesi penjagaan." onClose={() => setProfileDialog(false)}>
        <form className="modal-form" onSubmit={saveProfile}><div className="field-group"><label htmlFor="profile-name">Nama penjaga</label><input id="profile-name" autoFocus value={profileName} onChange={(event) => setProfileName(event.target.value)} required /></div><div className="modal-actions"><Button variant="ghost" type="button" onClick={() => setProfileDialog(false)}>Batal</Button><Button variant="primary" type="submit">Simpan nama <Check size={15} /></Button></div></form>
      </Dialog>}

      {confirmDialog && <Dialog title={confirmDialog.title} description={confirmDialog.description} onClose={() => setConfirmDialog(null)}>
        <div className="modal-actions confirm-actions"><Button variant="ghost" onClick={() => setConfirmDialog(null)}>Batal</Button><Button variant={confirmDialog.danger ? 'danger' : 'primary'} onClick={confirmDialog.onConfirm}>{confirmDialog.confirmLabel || 'Konfirmasi'}</Button></div>
      </Dialog>}

      {selectedShift && !txDialog && !confirmDialog && <Dialog wide title="Detail shift" description={`${formatDate(selectedShift.date)} · ${selectedShift.keeper}`} onClose={closeShiftDetail}>
        <div className="detail-summary-grid"><div><span>Status</span><b className={selectedShift.status === 'active' ? 'text-green' : ''}>{selectedShift.status === 'active' ? 'Sedang berjalan' : 'Selesai'}</b></div><div><span>Waktu mulai</span><b>{formatTime(selectedShift.startAt)}</b></div><div><span>Waktu selesai</span><b>{selectedShift.endAt ? formatTime(selectedShift.endAt) : '—'}</b></div><div><span>Total omzet</span><b>{money(shiftTotals(selectedShift).revenue)}</b></div></div>
        <div className="detail-list-heading"><div><b>Daftar produk terjual</b><small>{number(shiftTotals(selectedShift).items)} item · {number(shiftTotals(selectedShift).count)} transaksi</small></div>{selectedShift.status === 'completed' && !correctionEnabled && <Button variant="outline" size="small" onClick={activateCorrection}><Edit3 size={14} /> Aktifkan koreksi</Button>}{correctionEnabled && <span className="correction-badge">MODE KOREKSI AKTIF</span>}</div>
        {selectedShift.transactions.length ? <div className="transaction-list detail-transactions">{selectedShift.transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} editable={selectedShift.status === 'active' || correctionEnabled} onEdit={() => openEditTransaction(selectedShift.id, tx)} onDelete={() => askDeleteTransaction(selectedShift.id, tx)} />)}</div> : <EmptyState icon={ShoppingBag} title="Belum ada transaksi" description="Belum ada produk yang dicatat untuk shift ini." />}
        <div className="detail-footer"><span>Rekap dihitung otomatis dari seluruh transaksi.</span><strong>{money(shiftTotals(selectedShift).revenue)}</strong></div>
      </Dialog>}

      {toast && <div className="toast-message"><CheckCircle2 size={16} /> {toast}</div>}
    </div>
  )
}

export default App
