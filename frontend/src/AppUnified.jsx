import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fmtLength } from './utils/formatters.js'
import { AppHeader } from './components/AppHeader.jsx'
import { SettingsPanel } from './features/settings/SettingsPanel.jsx'
import { INITIAL_FILES, INITIAL_TREE, createBrowserSample } from './models/sampleModel.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const press = (fn) => (e) => { if (e.button === 0) fn(e) }
const AUDIO_EXT = ['wav', 'aif', 'aiff', 'flac', 'mp3', 'ogg']
const DRAG_THRESHOLD_PX = 4
const VOLUME_MIN = -60
const VOLUME_MAX = 12
const VOLUME_STEP = 0.5
const VOLUME_PX_PER_STEP = 12
const DOUBLE_PRESS_MS = 500

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function makeWaveform(id, n = 160) {
  const rnd = mulberry32(hashCode(id))
  return Array.from({ length: n }, (_, i) => {
    const t = i / n
    const env = Math.pow(1 - t, 0.6) * 0.85 + 0.15
    return Math.max(0.04, Math.min(1, (0.25 + 0.75 * rnd()) * env + rnd() * 0.08))
  })
}

const COLUMNS = [
  { key: 'name', cls: 'name', label: 'Name' },
  { key: 'extension', cls: 'type', label: 'Type' },
  { key: 'duration', cls: 'length', label: 'Length' },
  { key: 'channels', cls: 'channels', label: 'Channels' },
  { key: 'sampleRate', cls: 'sample-rate', label: 'Rate' },
  { key: 'bitDepth', cls: 'bit-depth', label: 'Bits' },
]

const IconPlay = ({ color }) => <svg width="9" height="12" viewBox="0 0 9 12"><path d="M0,12V0L9,6Z" fill={color} /></svg>
const IconStop = ({ color }) => <svg width="12" height="12" viewBox="0 0 12 12"><path d="M0,12V0H12V12Z" fill={color} /></svg>
const IconFolder = () => <svg width="16" height="12" viewBox="0 0 16 12"><path d="M1.5,12C1.1,12 .75,11.85 .45,11.55 .15,11.25 0,10.9 0,10.5V1.5C0,1.08 .15,.73 .45,.44 .75,.15 1.1,0 1.5,0H6L8,2H14.5C14.92,2 15.27,2.15 15.56,2.44 15.85,2.73 16,3.08 16,3.5V10.5C16,10.9 15.85,11.25 15.56,11.55 15.27,11.85 14.92,12 14.5,12Z" fill="#b3b3b3"/></svg>
const ChevronDown = () => <svg width="12" height="7" viewBox="0 0 12 7"><path d="M6,7L0,1.23 1.28,0 6,4.55 10.72,0 12,1.23Z" fill="#b3b3b3"/></svg>
const ChevronRight = () => <svg width="7" height="12" viewBox="0 0 7 12"><path d="M4.55,6L0,1.28 1.23,0 7,6 1.23,12 0,10.72Z" fill="#b3b3b3"/></svg>
const SortAsc = () => <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}><path d="M6,4.95L1.28,9.5 0,8.27 6,2.5 12,8.27 10.72,9.5Z" fill="#b3b3b3"/></svg>
const SortDesc = () => <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}><path d="M6,9.5L0,3.73 1.28,2.5 6,7.05 10.72,2.5 12,3.73Z" fill="#b3b3b3"/></svg>
const IconSortSlot = ({ children }) => <span className="icon-sort-slot" style={{ width: 12, height: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
const IconExpandSlot = ({ children, onMouseDown }) => <span style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseDown={onMouseDown}>{children}</span>

function OverlayScroll({ className, areaClassName, children, tabIndex, onKeyDown }) {
  const scrollRef = useRef(null)
  const contentRef = useRef(null)
  const dragRef = useRef(null)
  const [thumb, setThumb] = useState({ show: false, h: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight <= clientHeight + 0.5) return setThumb((t) => t.show ? { show: false, h: 0, y: 0 } : t)
    const h = Math.max(24, (clientHeight / scrollHeight) * clientHeight)
    const y = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - h)
    setThumb({ show: true, h, y })
  }, [])
  useEffect(() => {
    const ro = new ResizeObserver(update)
    if (scrollRef.current) ro.observe(scrollRef.current)
    if (contentRef.current) ro.observe(contentRef.current)
    update()
    return () => ro.disconnect()
  }, [update])
  const onThumbDown = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragRef.current = { y0: e.clientY, st0: scrollRef.current.scrollTop }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onThumbMove = (e) => {
    const d = dragRef.current; const el = scrollRef.current
    if (!d || !el) return
    const range = el.clientHeight - thumb.h
    if (range > 0) el.scrollTop = d.st0 + ((e.clientY - d.y0) / range) * (el.scrollHeight - el.clientHeight)
  }
  const onThumbUp = () => { dragRef.current = null; setDragging(false) }
  return <div className={className + ' overlay-scroll'}>
    <div ref={scrollRef} className={'overlay-scroll-area' + (areaClassName ? ' ' + areaClassName : '')} onScroll={update} tabIndex={tabIndex} onKeyDown={onKeyDown}>
      <div ref={contentRef}>{children}</div>
    </div>
    {thumb.show && <div className={'overlay-scrollbar-thumb' + (dragging ? ' is-active' : '')} style={{ top: thumb.y, height: thumb.h }} onPointerDown={onThumbDown} onPointerMove={onThumbMove} onPointerUp={onThumbUp} onPointerCancel={onThumbUp} />}
  </div>
}

function Waveform({ file, position, onSeek }) {
  const bars = useMemo(() => file ? makeWaveform(file.id) : [], [file])
  const progress = file && file.duration ? clamp(position / file.duration, 0, 1) : 0
  const handlePress = (e) => {
    if (e.button !== 0 || !file || !file.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(((e.clientX - r.left) / r.width) * file.duration)
  }
  return <div className="waveform-display" onMouseDown={handlePress}>
    {file && <svg viewBox={`0 0 ${bars.length} 100`} preserveAspectRatio="none">
      {bars.map((h, i) => <rect key={i} x={i + 0.18} width={0.64} y={50 - h * 46} height={h * 92} fill={position > 0 && i / bars.length <= progress ? '#67cf67' : '#4a4a4a'} />)}
      {position > 0 && <rect x={progress * bars.length - 0.25} width={0.5} y={0} height={100} fill="#d9d9d9" />}
    </svg>}
  </div>
}

const displayRate = (value) => value ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : '—'
const displayNumber = (value) => value ? String(value) : '—'

export default function App() {
  const [tree, setTree] = useState(INITIAL_TREE)
  const [filesByFolder, setFilesByFolder] = useState(INITIAL_FILES)
  const [expanded, setExpanded] = useState(() => new Set(['samples', 'drums']))
  const [selectedFolder, setSelectedFolder] = useState('snare')
  const [selectedFile, setSelectedFile] = useState('snare-2')
  const [sort, setSort] = useState({ key: 'name', dir: 1 })
  const [autoPlay, setAutoPlay] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [volume, setVolume] = useState(0.0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => ({
    audio: { driver: 'asio', device: 'example-asio-device', sampleRate: 48000, bufferSize: 256, output: '1-2' },
    library: {
      folders: [
        { id: 'library-1', path: 'D:\\Samples', status: 'online' },
        { id: 'library-2', path: 'E:\\Sound Design', status: 'offline' },
      ],
      scanSubfolders: true,
      scanOnStartup: true,
    },
  }))
  const settingsButtonRef = useRef(null)
  const folderInputRef = useRef(null)
  const volDrag = useRef(null)
  const lastFolderPressRef = useRef({ id: null, time: 0 })

  const folderFiles = filesByFolder[selectedFolder] || []
  const currentFile = useMemo(() => folderFiles.find((f) => f.id === selectedFile) || null, [folderFiles, selectedFile])
  const sortedFiles = useMemo(() => {
    const list = [...folderFiles]
    const value = (f) => sort.key === 'name' || sort.key === 'extension'
      ? String(f[sort.key] || '').toLowerCase()
      : f[sort.key] || 0
    list.sort((a, b) => {
      const av = value(a); const bv = value(b)
      return (typeof av === 'string' ? av.localeCompare(bv) : av - bv) * sort.dir
    })
    return list
  }, [folderFiles, sort])

  useEffect(() => {
    if (!playing || !currentFile || !currentFile.duration) return
    let raf; let last = performance.now()
    const tick = (now) => { setPosition((p) => p + (now - last) / 1000); last = now; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, currentFile])
  useEffect(() => {
    if (currentFile && currentFile.duration && position >= currentFile.duration) { setPosition(currentFile.duration); setPlaying(false) }
  }, [position, currentFile])

  const selectFile = useCallback((id) => { setSelectedFile(id); setPosition(0); setPlaying(!!id && autoPlay) }, [autoPlay])
  const selectFolder = (node) => { setSelectedFolder(node.id); setSelectedFile(null); setPlaying(false); setPosition(0) }
  const toggleFolder = (node) => { if (!node.children?.length) return; setExpanded((prev) => { const s = new Set(prev); s.has(node.id) ? s.delete(node.id) : s.add(node.id); return s }) }
  const handleFolderPress = (node) => (e) => {
    if (e.button !== 0) return
    const now = Date.now(); const last = lastFolderPressRef.current
    if (last.id === node.id && now - last.time <= DOUBLE_PRESS_MS) { lastFolderPressRef.current = { id: null, time: 0 }; toggleFolder(node) }
    else { lastFolderPressRef.current = { id: node.id, time: now }; selectFolder(node) }
  }
  const handlePlay = () => { if (!currentFile) return; if (currentFile.duration && position >= currentFile.duration) setPosition(0); setPlaying(Boolean(currentFile.duration)) }
  const handleStop = () => { setPlaying(false); setPosition(0) }
  const handleSeek = (t) => { if (currentFile?.duration) setPosition(clamp(t, 0, currentFile.duration)) }
  const onSort = (key) => setSort((s) => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 })
  const onVolDown = (e) => { if (e.button === 0) { volDrag.current = { y0: e.clientY, v0: volume, moved: false }; e.currentTarget.setPointerCapture(e.pointerId) } }
  const onVolMove = (e) => {
    const d = volDrag.current; if (!d) return
    const dy = e.clientY - d.y0
    if (!d.moved) { if (Math.abs(dy) < DRAG_THRESHOLD_PX) return; d.moved = true }
    const raw = d.v0 - dy * (VOLUME_STEP / VOLUME_PX_PER_STEP)
    setVolume(clamp(Math.round(raw / VOLUME_STEP) * VOLUME_STEP, VOLUME_MIN, VOLUME_MAX))
  }
  const onVolUp = () => { volDrag.current = null }
  const onTableKeyDown = (e) => {
    if (!sortedFiles.length) return
    if (e.key === 'Enter') { e.preventDefault(); handlePlay(); return }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const idx = sortedFiles.findIndex((f) => f.id === selectedFile)
    const next = e.key === 'ArrowDown' ? sortedFiles[Math.min(idx + 1, sortedFiles.length - 1)] : sortedFiles[Math.max(idx - 1, 0)]
    if (next && next.id !== selectedFile) selectFile(next.id)
  }
  const handleFolderPick = (e) => {
    const list = Array.from(e.target.files || []); e.target.value = ''
    if (!list.length) return
    const rootName = (list[0].webkitRelativePath || 'Folder').split('/')[0]
    const audio = list.filter((f) => AUDIO_EXT.includes((f.name.split('.').pop() || '').toLowerCase()))
    const id = 'local-' + Date.now()
    const files = audio.map((file, i) => createBrowserSample(file, `${id}-${i}`, rootName))
    const path = `browser-folder:${encodeURIComponent(rootName)}`
    setTree((t) => ({ ...t, children: [...t.children, { id, name: rootName, path, parentId: 'samples', status: 'online', children: [] }] }))
    setFilesByFolder((m) => ({ ...m, [id]: files }))
    setExpanded((s) => new Set(s).add(id)); setSelectedFolder(id); setSelectedFile(null); setPlaying(false); setPosition(0)
  }
  const flatTree = useMemo(() => {
    const out = []; const walk = (node, depth) => { out.push({ node, depth }); if (node.children?.length && expanded.has(node.id)) node.children.forEach((c) => walk(c, depth + 1)) }
    walk(tree, 0); return out
  }, [tree, expanded])
  const stopDisabled = !currentFile || (!playing && position === 0)
  const closeSettings = () => { setSettingsOpen(false); settingsButtonRef.current?.focus() }
  const updateAudioSetting = (key, value) => setSettings((current) => ({ ...current, audio: { ...current.audio, [key]: value } }))
  const updateLibrarySettings = (update) => setSettings((current) => ({ ...current, library: update(current.library) }))

  return <div className="sample-browser-app">
    <AppHeader folderInputRef={folderInputRef} onOpenFolder={press(() => folderInputRef.current?.click())} onFolderPick={handleFolderPick} folderIcon={<IconFolder />} settingsOpen={settingsOpen} settingsButtonRef={settingsButtonRef} onToggleSettings={press(() => setSettingsOpen((open) => !open))} />
    <div className="body-layout">
      <OverlayScroll className="folder-tree-container" areaClassName="folder-tree-area">
        {flatTree.map(({ node, depth }) => {
          const hasKids = node.children?.length > 0; const isSel = node.id === selectedFolder
          return <div key={node.id} className={'folder-tree-row' + (isSel ? ' is-selected' : '')} style={{ paddingLeft: 12 + depth * 12 }} onMouseDown={handleFolderPress(node)}>
            {hasKids ? <IconExpandSlot onMouseDown={press((e) => { e.stopPropagation(); toggleFolder(node) })}>{expanded.has(node.id) ? <ChevronDown /> : <ChevronRight />}</IconExpandSlot> : <IconExpandSlot>{null}</IconExpandSlot>}
            <span className="folder-name-text">{node.name}</span>
          </div>
        })}
      </OverlayScroll>
      <OverlayScroll className="file-table-container" areaClassName="file-table-area" tabIndex={0} onKeyDown={onTableKeyDown}>
        <table className="file-table"><colgroup><col className="col-name" /><col className="col-type" /><col className="col-length" /><col className="col-channels" /><col className="col-rate" /><col className="col-bits" /></colgroup>
          <thead><tr>{COLUMNS.map((c) => <th key={c.key} className={`th-${c.cls}` + (sort.key === c.key ? ' is-sorted' : '')} onMouseDown={press(() => onSort(c.key))} title={`Sort by ${c.label}`}><span className="column-title-text">{c.label}</span><IconSortSlot>{sort.key === c.key ? (sort.dir === 1 ? <SortAsc /> : <SortDesc />) : null}</IconSortSlot></th>)}</tr></thead>
          <tbody>
            {!sortedFiles.length && <tr><td colSpan={COLUMNS.length} className="file-table-empty">No files</td></tr>}
            {sortedFiles.map((file) => {
              const sel = file.id === selectedFile
              return <tr key={file.id} className={sel ? 'file-table-row-selected' : 'file-table-row'} onMouseDown={press(() => selectFile(file.id))}>
                <td className="td-name"><span className={sel ? 'file-name-text-selected' : 'file-name-text'}>{file.name}</span></td>
                <td className="td-type"><span className={sel ? 'file-type-text-muted' : 'file-type-text'}>{file.extension || '—'}</span></td>
                <td className="td-length"><span className={sel ? 'file-length-text-muted' : 'file-length-text'}>{file.duration ? fmtLength(file.duration) : '—'}</span></td>
                <td className="td-channels"><span className={sel ? 'file-channels-text-muted' : 'file-channels-text'}>{displayNumber(file.channels)}</span></td>
                <td className="td-rate"><span className={sel ? 'file-sample-rate-text-muted' : 'file-sample-rate-text'}>{displayRate(file.sampleRate)}</span></td>
                <td className="td-bits"><span className={sel ? 'file-bit-depth-text-muted' : 'file-bit-depth-text'}>{displayNumber(file.bitDepth)}</span></td>
              </tr>
            })}
          </tbody>
        </table>
      </OverlayScroll>
    </div>
    <div className="waveform-panel">
      <Waveform file={currentFile} position={position} onSeek={handleSeek} />
      <div className="playback-bar">
        <div className="playback-button-group">
          <button className={'button-auto-play' + (autoPlay ? ' is-on' : '')} onMouseDown={press(() => setAutoPlay((v) => !v))} title="Auto Play on sample selection"><span className="auto-play-text">Auto Play</span></button>
          <button className="button-play" onMouseDown={press(handlePlay)} disabled={!currentFile || !currentFile.duration} title="Play"><IconPlay color={!currentFile || !currentFile.duration ? '#666666' : playing ? '#67cf67' : '#b3b3b3'} /></button>
          <button className="button-stop" onMouseDown={press(handleStop)} disabled={stopDisabled} title="Stop"><IconStop color={playing ? '#b3b3b3' : '#666666'} /></button>
        </div>
        <div className="volume-control-badge" title="Drag vertically to adjust, double-click to reset" onPointerDown={onVolDown} onPointerMove={onVolMove} onPointerUp={onVolUp} onPointerCancel={onVolUp} onDoubleClick={() => setVolume(0)}>
          <div className="volume-label"><span className="volume-label-text">Volume</span></div>
          <div className="volume-value-container"><span className="volume-value-text">{volume.toFixed(1)}</span><span className="volume-unit-text">dB</span></div>
        </div>
      </div>
    </div>
    <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} settings={settings} onAudioSettingChange={updateAudioSetting} onLibraryChange={updateLibrarySettings} />
  </div>
}
