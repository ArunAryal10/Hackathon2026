import { useState, useRef, useEffect } from 'react'

const PROMPTS = [
  'How are you feeling today?',
  'What has been on your mind lately?',
  'How did you sleep last night?',
]

// Autocorrelation pitch detection on a Float32Array frame
function detectPitch(buffer, sampleRate) {
  const SIZE = buffer.length
  let sumSq = 0
  for (let i = 0; i < SIZE; i++) sumSq += buffer[i] * buffer[i]
  const rms = Math.sqrt(sumSq / SIZE)
  if (rms < 0.005) return { pitch: 0, rms }

  const corr = new Float32Array(SIZE)
  for (let lag = 0; lag < SIZE; lag++) {
    let s = 0
    for (let i = 0; i < SIZE - lag; i++) s += buffer[i] * buffer[i + lag]
    corr[lag] = s
  }

  // Skip initial drop, find first peak
  let d = 0
  while (d < SIZE - 1 && corr[d] > corr[d + 1]) d++
  let maxVal = -Infinity, maxPos = d
  for (let i = d; i < SIZE; i++) {
    if (corr[i] > maxVal) { maxVal = corr[i]; maxPos = i }
  }

  if (maxPos === 0 || corr[0] === 0) return { pitch: 0, rms }
  if (corr[maxPos] / corr[0] < 0.4) return { pitch: 0, rms }  // low confidence
  return { pitch: sampleRate / maxPos, rms }
}

// Map extracted features → voice stress 0–10
function scoreVoice({ pitchMean, rmsMean, wordsPerMin }) {
  // Higher pitch → more stress (baseline ~120 Hz, stressed ~250+ Hz)
  const pitchStress = Math.min(Math.max((pitchMean - 100) / 200, 0), 1)
  // Higher vocal energy → more stress
  const energyStress = Math.min(rmsMean / 0.12, 1)
  // Faster speech → anxiety/stress (normal ~130 wpm, stressed ~200+)
  const rateStress = Math.min(Math.max((wordsPerMin - 90) / 150, 0), 1)
  const raw = 0.4 * pitchStress + 0.3 * energyStress + 0.3 * rateStress
  return Math.round(raw * 100) / 10  // 0–10, 1 decimal
}

export default function VoiceJournal({ onScore }) {
  const [phase, setPhase] = useState('idle')  // idle | recording | done
  const [transcript, setTranscript] = useState('')
  const [features, setFeatures] = useState(null)
  const [voiceStress, setVoiceStress] = useState(null)
  const [duration, setDuration] = useState(0)
  const [promptIdx, setPromptIdx] = useState(0)
  const [supported, setSupported] = useState(true)

  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const timerRef = useRef(null)
  const frameTimerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pitchSamplesRef = useRef([])
  const rmsSamplesRef = useRef([])
  const wordCountRef = useRef(0)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) setSupported(false)
    return () => stopAll()
  }, [])

  function stopAll() {
    clearInterval(timerRef.current)
    clearInterval(frameTimerRef.current)
    try { recognitionRef.current?.stop() } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop())
    try { audioCtxRef.current?.close() } catch {}
  }

  async function startRecording() {
    pitchSamplesRef.current = []
    rmsSamplesRef.current = []
    wordCountRef.current = 0
    setTranscript('')
    setDuration(0)
    setPromptIdx(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      // Speech recognition for transcript + word count
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      const recog = new SR()
      recog.continuous = true
      recog.interimResults = true
      recog.onresult = e => {
        let full = ''
        for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' '
        const text = full.trim()
        setTranscript(text)
        wordCountRef.current = text.split(/\s+/).filter(Boolean).length
      }
      recog.start()
      recognitionRef.current = recog

      startTimeRef.current = Date.now()
      setPhase('recording')

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)
        setPromptIdx(Math.floor(elapsed / 12) % PROMPTS.length)
      }, 1000)

      // Sample audio features every 250ms
      const buf = new Float32Array(analyser.fftSize)
      frameTimerRef.current = setInterval(() => {
        analyser.getFloatTimeDomainData(buf)
        const { pitch, rms } = detectPitch(buf, audioCtx.sampleRate)
        if (pitch > 60 && pitch < 500) pitchSamplesRef.current.push(pitch)
        rmsSamplesRef.current.push(rms)
      }, 250)

    } catch {
      setSupported(false)
    }
  }

  function stopRecording() {
    const elapsed = (Date.now() - startTimeRef.current) / 1000
    stopAll()

    const pitches = pitchSamplesRef.current
    const rmsVals = rmsSamplesRef.current

    const pitchMean = pitches.length > 0
      ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 150
    const rmsMean = rmsVals.length > 0
      ? rmsVals.reduce((a, b) => a + b, 0) / rmsVals.length : 0.05
    const wordsPerMin = elapsed > 0 ? (wordCountRef.current / elapsed) * 60 : 100

    const f = {
      pitchMean: Math.round(pitchMean),
      rmsMean: Math.round(rmsMean * 1000) / 1000,
      wordsPerMin: Math.round(wordsPerMin),
    }
    setFeatures(f)
    const score = scoreVoice({ pitchMean, rmsMean, wordsPerMin })
    setVoiceStress(score)
    onScore(score)
    setPhase('done')
  }

  function reset() {
    setPhase('idle')
    setFeatures(null)
    setVoiceStress(null)
    setTranscript('')
    onScore(null)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
        Voice journaling requires Chrome or Edge with microphone permission.
      </div>
    )
  }

  if (phase === 'idle') return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-4">
        Speak for 30–60s. We extract pitch, energy, and speech rate — no audio leaves your device.
      </p>
      <button
        type="button"
        onClick={startRecording}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
      >
        🎙️ Start recording
      </button>
    </div>
  )

  if (phase === 'recording') return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-mono font-medium text-gray-800">{fmt(duration)}</span>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 mb-4">
        <p className="text-[11px] text-purple-400 uppercase tracking-wider mb-1">Speak about…</p>
        <p className="text-base font-medium text-gray-800">{PROMPTS[promptIdx]}</p>
      </div>
      {transcript && (
        <p className="text-xs text-gray-400 italic mb-4 leading-relaxed line-clamp-2">{transcript}</p>
      )}
      <button
        type="button"
        onClick={stopRecording}
        disabled={duration < 5}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
      >
        ⏹ Stop & analyze
      </button>
      {duration < 5 && <p className="text-xs text-gray-400 mt-2">Keep talking — at least 5 seconds</p>}
    </div>
  )

  // done
  const stressColor = voiceStress >= 7 ? '#f87171' : voiceStress >= 4 ? '#facc15' : '#4ade80'
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-700">Voice analysis complete ✓</p>
        <button type="button" onClick={reset} className="text-xs text-purple-500 hover:underline">Re-record</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Voice stress', value: `${voiceStress}/10`, color: stressColor },
          { label: 'Speech rate',  value: `${features.wordsPerMin} wpm`, color: '#a78bfa' },
          { label: 'Avg pitch',    value: `${features.pitchMean} Hz`,    color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-[11px] text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      {transcript && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-[11px] text-gray-400 mb-1">Transcript</p>
          <p className="text-xs text-gray-600 leading-relaxed italic">"{transcript}"</p>
        </div>
      )}
    </div>
  )
}
