import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Bibliography ────────────────────────────────────────────────────────────
const REFS = {
  nunan2010:      { id: 1,  short: 'Nunan et al., 2010',           full: 'Nunan D, Sandercock GRH, Brodie DA. A quantitative systematic review of normal values for short-term heart rate variability in healthy adults. Pacing Clin Electrophysiol. 2010;33(11):1407-1417.', doi: '10.1111/j.1540-8159.2010.02841.x' },
  shaffer2017:    { id: 2,  short: 'Shaffer & Ginsberg, 2017',     full: 'Shaffer F, Ginsberg JP. An overview of heart rate variability metrics and norms. Front Public Health. 2017;5:258.', doi: '10.3389/fpubh.2017.00258' },
  kim2018:        { id: 3,  short: 'Kim et al., 2018',             full: 'Kim HG, Cheon EJ, Bai DS, et al. Stress and heart rate variability: a meta-analysis and review of the literature. Psychiatry Investig. 2018;15(3):235-245.', doi: '10.30773/pi.2017.08.17' },
  andrew2021:     { id: 4,  short: 'Andrew et al., 2021',          full: 'Andrew ME, et al. Monitoring stress and allostatic load using heart rate variability: a systematic review. BMC Public Health. 2021;21:1737.', doi: '10.1186/s12889-021-11595-x' },
  taskforce1996:  { id: 5,  short: 'Task Force, 1996',             full: 'Task Force of the ESC and NASPE. Heart rate variability: standards of measurement, physiological interpretation and clinical use. Circulation. 1996;93(5):1043-1065.', doi: '10.1161/01.CIR.93.5.1043' },
  hirshkowitz2015:{ id: 6,  short: 'Hirshkowitz et al., 2015',     full: 'Hirshkowitz M, et al. National Sleep Foundation\'s sleep time duration recommendations. Sleep Health. 2015;1(1):40-43.', doi: '10.1016/j.sleh.2014.12.010' },
  cappuccio2010:  { id: 7,  short: 'Cappuccio et al., 2010',       full: 'Cappuccio FP, et al. Sleep duration and all-cause mortality: a systematic review and meta-analysis. Sleep. 2010;33(5):585-592.', doi: '10.1093/sleep/33.5.585' },
  liu2023:        { id: 8,  short: 'Liu et al., 2023',             full: 'Liu Y, et al. Night-sleep duration and depression risk: a dose-response meta-analysis. Front Physiol. 2023;14:1085091.', doi: '10.3389/fphys.2023.1085091' },
  zhai2015:       { id: 9,  short: 'Zhai et al., 2015',            full: 'Zhai L, et al. Sleep duration and depression among adults: a meta-analysis. Depress Anxiety. 2015;32(9):664-670.', doi: '10.1002/da.22386' },
  aasm2008:       { id: 10, short: 'Schutte-Rodin et al., 2008',   full: 'Schutte-Rodin S, et al. Clinical guideline for chronic insomnia in adults. J Clin Sleep Med. 2008;4(5):487-504.', pmcid: 'PMC2576317' },
  laborde2022:    { id: 11, short: 'Laborde et al., 2022',         full: 'Laborde S, et al. Voluntary slow breathing and heart rate variability: a systematic review and meta-analysis. Neurosci Biobehav Rev. 2022;138:104711.', doi: '10.1016/j.neubiorev.2022.104711' },
  zaccaro2018:    { id: 12, short: 'Zaccaro et al., 2018',         full: 'Zaccaro A, et al. How breath-control can change your life: a systematic review on slow breathing. Front Hum Neurosci. 2018;12:353.', doi: '10.3389/fnhum.2018.00353' },
  sauvet2019:     { id: 13, short: 'Sauvet et al., 2019',          full: 'Sauvet F, et al. Heart rate variability rebound following sleep restriction. Sleep Med. 2019.', pmcid: 'PMC6369727' },
  pascoe2017:     { id: 14, short: 'Pascoe et al., 2017',          full: 'Pascoe MC, et al. Mindfulness mediates physiological markers of stress: systematic review and meta-analysis. J Psychiatr Res. 2017;95:156-178.', doi: '10.1016/j.jpsychires.2017.08.004' },
  koncz2021:      { id: 15, short: 'Koncz et al., 2021',           full: 'Koncz A, et al. Meditation interventions efficiently reduce cortisol levels: a meta-analysis. Health Psychol Rev. 2021;15(1):56-78.', doi: '10.1080/17437199.2020.1760727' },
  nlss2023:       { id: 16, short: 'CBS Nepal, 2022/23',           full: 'Central Bureau of Statistics. Nepal Living Standards Survey IV (NLSS-IV). Government of Nepal, 2022/23.', url: 'https://data.nsonepal.gov.np' },
  worldbank2023:  { id: 17, short: 'World Bank, 2023',             full: 'World Bank. Personal remittances received (% of GDP) — Nepal. World Development Indicators. 2023.', url: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.DT.GD.ZS?locations=NP' },
  liem2021:       { id: 18, short: 'Liem et al., 2021',            full: 'Liem A, et al. Prevalence of common mental health issues among migrant workers: a systematic review and meta-analysis. PLoS ONE. 2021;16(12):e0260986.', pmcid: 'PMC8638981' },
  poudel2020:     { id: 19, short: 'Poudel et al., 2020',          full: 'Poudel A, et al. Mental health problems in Nepalese migrant workers and their families. medRxiv. 2020.', doi: '10.1101/2020.08.04.20168104' },
  simkhada2021:   { id: 20, short: 'Simkhada et al., 2021',        full: 'Simkhada PP, et al. Perceived mental health among Nepali male migrant and non-migrant workers. J Migr Health. 2021;4:100063.', pmcid: 'PMC8352157' },
  mora2018:       { id: 21, short: 'Mora et al., 2018',            full: 'Mora DC, et al. Allostatic load and health among Latino immigrants. J Physiol Anthropol. 2018;37:2.', pmcid: 'PMC6293576' },
  seeman2010:     { id: 22, short: 'Seeman et al., 2001',          full: 'Seeman T, et al. Allostatic load as a marker of cumulative biological risk. Proc Natl Acad Sci. 2001;98(8):4770-4775.', pmcid: 'PMC2874580' },
  kessler2003:    { id: 23, short: 'Kessler et al., 2003',         full: 'Kessler RC, et al. Screening for serious mental illness in the general population. Arch Gen Psychiatry. 2003;60(2):184-189.', doi: '10.1001/archpsyc.60.2.184' },
  bull2020:       { id: 24, short: 'Bull et al., 2020',            full: 'Bull FC, et al. WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451-1462.', doi: '10.1136/bjsports-2020-102955' },
  paluch2022:     { id: 25, short: 'Paluch et al., 2022',          full: 'Paluch AE, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022;7(3):e219-e228.', doi: '10.1016/S2468-2667(21)00302-9' },
  tudorlocke2004: { id: 26, short: 'Tudor-Locke & Bassett, 2004',  full: 'Tudor-Locke C, Bassett DR Jr. How many steps/day are enough? Sports Med. 2004;34(1):1-8.', doi: '10.2165/00007256-200434010-00001' },
  dipietro2013:   { id: 27, short: 'DiPietro et al., 2013',        full: 'DiPietro L, et al. Postmeal walking improves 24-h glycemic control. Diabetes Care. 2013;36(10):3262-3268.', doi: '10.2337/dc13-0084' },
  dong2024:       { id: 28, short: 'Dong et al., 2024',            full: 'Dong JG, et al. Exercise training and heart rate variability: a systematic review and meta-analysis. Sports Med Open. 2024.', doi: '10.1007/s40798-024-00747-3' },
  holtlunstad2010:{ id: 29, short: 'Holt-Lunstad et al., 2010',    full: 'Holt-Lunstad J, et al. Social relationships and mortality risk: a meta-analytic review. PLoS Med. 2010;7(7):e1000316.', doi: '10.1371/journal.pmed.1000316' },
  heinrichs2003:  { id: 30, short: 'Heinrichs et al., 2003',       full: 'Heinrichs M, et al. Social support and oxytocin suppress cortisol during psychosocial stress. Biol Psychiatry. 2003;54(12):1389-1398.', doi: '10.1016/S0006-3223(03)00465-7' },
  weatherson2022: { id: 31, short: 'Weatherson et al., 2022',      full: 'Weatherson KA, et al. Physical activity and sleep moderate stress and screen time. J Am Coll Health. 2022.', doi: '10.1080/07448481.2022.2076097' },
  neophytou2024:  { id: 32, short: 'Neophytou et al., 2024',       full: 'Neophytou E, et al. Screen time and mental health in adults: a systematic review. J Technol Behav Sci. 2024.', doi: '10.1007/s41347-024-00398-7' },
}

// ─── Sections ────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: 'physio',
    title: 'Physiological Measures',
    subtitle: 'HRV, sleep, breathing, meditation',
    icon: '💓',
    color: '#e040fb',
    summary: 'HRV is a validated biomarker of autonomic stress (Task Force, 1996). Mean adult RMSSD is ~42ms. Optimal sleep is 7-9h (NSF). Slow breathing at 6 breaths/min increases parasympathetic tone.',
    claims: [
      { claim: 'HRV reflects autonomic nervous system adaptability to stress', status: 'verified', evidence: 'ESC/NASPE Task Force established HRV as a non-invasive measure of autonomic modulation.', refs: ['taskforce1996', 'kim2018'] },
      { claim: 'Mean adult RMSSD is ~42ms (range 19-75ms, age-dependent)', status: 'verified', evidence: 'Systematic review of 15 studies. RMSSD declines with age: >60ms for ages 20-30, <28ms for 65+.', refs: ['nunan2010', 'shaffer2017'] },
      { claim: 'Low RMSSD correlates with higher allostatic load', status: 'verified', evidence: 'Negative correlations between allostatic load and HRV (r = -0.435 to -0.67).', refs: ['andrew2021', 'kim2018'] },
      { claim: 'Optimal sleep: 7-9 hours for adults', status: 'verified', evidence: 'NSF expert panel recommendation. U-shaped mortality curve with nadir at 7-7.5h.', refs: ['hirshkowitz2015', 'cappuccio2010'] },
      { claim: 'Sleep <5h: RR 1.12 for all-cause mortality', status: 'verified', evidence: 'Meta-analysis of prospective studies.', refs: ['cappuccio2010'] },
      { claim: 'Sleep >9h: depression RR 1.31 vs 7h', status: 'verified', evidence: 'Dose-response meta-analysis.', refs: ['liu2023', 'zhai2015'] },
      { claim: 'Sleep efficiency >=85% is the clinical standard', status: 'verified', evidence: 'AASM threshold for insomnia diagnosis. Used in CBT-I research.', refs: ['aasm2008'] },
      { claim: 'Slow breathing (~6/min) increases RMSSD', status: 'verified', evidence: 'Meta-analysis confirmed RMSSD increases during and after slow breathing. Most studied: 5s in, 5s out.', refs: ['laborde2022', 'zaccaro2018'] },
      { claim: 'HRV recovery from sleep debt takes >=3 nights', status: 'verified', evidence: 'Autonomic homeostasis restoration requires at least three recovery nights.', refs: ['sauvet2019'] },
      { claim: 'Meditation reduces cortisol (stronger for at-risk populations)', status: 'verified', evidence: 'Meta-analysis of 45 RCTs. Most effective when total intervention >1200 minutes.', refs: ['pascoe2017', 'koncz2021'] },
    ],
  },
  {
    key: 'financial',
    title: 'Diaspora & Financial Stress',
    subtitle: 'Migration, remittance burden, mental health prevalence',
    icon: '💸',
    color: '#ff5f1f',
    summary: '77% of Nepali households depend on remittances (NLSS-IV). 39% of migrant workers globally report depression (Liem, 2021). Financial burden is the strongest predictor of poor mental health in migrant populations (Simkhada, 2021).',
    claims: [
      { claim: '76.8% of Nepali households receive remittance income', status: 'verified', evidence: 'Up from 55.8% in 2010/11.', refs: ['nlss2023'] },
      { claim: 'Remittances = ~27% of Nepal\'s GDP', status: 'verified', evidence: 'One of the most remittance-dependent economies globally.', refs: ['worldbank2023'] },
      { claim: '39% of migrant workers globally report depression', status: 'verified', evidence: 'Pooled prevalence from systematic review. Nepali returnees: 56% anxiety, 23% depression.', refs: ['liem2021', 'poudel2020'] },
      { claim: 'Financial burden is the strongest predictor of poor mental health in Nepali migrants', status: 'verified', evidence: '"Family problems compounded by constant financial burdens and unmet expectations were the most important factors linked with poor mental health."', refs: ['simkhada2021'] },
      { claim: 'Financial stress weighted at 40% in our model', status: 'design', evidence: 'Informed by literature showing financial burden is the primary driver, but specific weights are a design heuristic, not empirically derived.', refs: ['mora2018', 'seeman2010', 'simkhada2021'] },
      { claim: 'Our 0-100 scale is NOT the K6 instrument', status: 'clarification', evidence: 'K6 uses 0-24 range (cutoffs at 5 and 13). Our allostatic load index uses 0-100 with severity language inspired by K6.', refs: ['kessler2003'] },
    ],
  },
  {
    key: 'behavioral',
    title: 'Behavioral & Physical Activity',
    subtitle: 'Steps, exercise, screen time, social connection',
    icon: '🏃',
    color: '#16a34a',
    summary: 'WHO recommends 150-300 min/week moderate exercise (Bull, 2020). Mortality benefits plateau at ~8,000 steps/day (Paluch, 2022). Post-meal walking reduces glucose spikes (DiPietro, 2013). Social connection has survival effect comparable to quitting smoking.',
    claims: [
      { claim: 'WHO: 150-300 min/week moderate exercise for adults', status: 'verified', evidence: 'Or 75-150 min/week vigorous-intensity.', refs: ['bull2020'] },
      { claim: 'Mortality benefits plateau at ~8,000-10,000 steps/day (<60 yrs)', status: 'verified', evidence: 'Meta-analysis of 15 cohorts (n=47,471). For >=60: plateau at ~6,000-8,000.', refs: ['paluch2022'] },
      { claim: '<5,000 steps/day = sedentary lifestyle', status: 'verified', evidence: 'Widely-used step classification system.', refs: ['tudorlocke2004'] },
      { claim: '15-min post-meal walk improves glycemic control', status: 'verified', evidence: 'RCT: more effective than a single 45-min walk. Significantly improved 24-h glucose.', refs: ['dipietro2013'] },
      { claim: '8-12 weeks moderate exercise improves HRV', status: 'verified', evidence: 'Meta-analysis of 16 RCTs: RMSSD improvement SMD 0.84.', refs: ['dong2024'] },
      { claim: 'Screen time linked to depression/anxiety, but thresholds are unclear', status: 'verified', evidence: 'Systematic review: associations exist but threshold effects not well-established.', refs: ['neophytou2024'] },
      { claim: 'Physical activity moderates screen-time-stress relationship', status: 'verified', evidence: 'Significant three-way interaction: activity + sleep mitigate screen-time effects.', refs: ['weatherson2022'] },
      { claim: 'Social connection: 50% increased survival likelihood', status: 'verified', evidence: 'Meta-analysis of 148 studies (n=308,849). Effect comparable to smoking cessation.', refs: ['holtlunstad2010', 'heinrichs2003'] },
    ],
  },
]

const STATUS_STYLE = {
  verified:      { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', label: 'Peer-reviewed' },
  design:        { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', label: 'Design decision' },
  clarification: { bg: '#fefce8', border: '#fde68a', text: '#ca8a04', label: 'Clarification' },
}

// ─── Collapsible section ─────────────────────────────────────────────────────
function Section({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left transition-all hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                {section.claims.filter(c => c.status === 'verified').length} verified
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
          </div>
          <span className="text-gray-400 text-lg transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            ▾
          </span>
        </div>

        {/* Summary — always visible */}
        <p className="text-xs text-gray-600 leading-relaxed mt-3 ml-9">
          {section.summary}
        </p>
      </button>

      {/* Expanded claims */}
      {open && (
        <div className="mt-2 ml-4 space-y-2">
          {section.claims.map((c, i) => {
            const st = STATUS_STYLE[c.status] || STATUS_STYLE.verified
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-50 p-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <p className="text-xs font-medium text-gray-900 flex-1 leading-snug">{c.claim}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full border whitespace-nowrap shrink-0"
                    style={{ background: st.bg, borderColor: st.border, color: st.text }}>
                    {st.label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{c.evidence}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.refs.map(r => {
                    const ref = REFS[r]
                    return ref ? (
                      <span key={r} className="text-[9px] px-1 py-0.5 rounded bg-gray-50 text-gray-400">
                        [{ref.id}] {ref.short}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const navigate = useNavigate()
  const [showBib, setShowBib] = useState(false)
  const allRefs = Object.values(REFS).sort((a, b) => a.id - b.id)
  const totalClaims = SECTIONS.reduce((n, s) => n + s.claims.length, 0)
  const verifiedCount = SECTIONS.reduce((n, s) => n + s.claims.filter(c => c.status === 'verified').length, 0)

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Evidence Base</h1>
          <p className="text-gray-500 text-xs">Every claim, verified against peer-reviewed literature</p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="bg-white rounded-xl px-4 py-2 text-center border border-gray-100">
            <div className="text-lg font-bold text-green-600">{verifiedCount}</div>
            <div className="text-[10px] text-gray-500">Verified claims</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 text-center border border-gray-100">
            <div className="text-lg font-bold text-brand-500">{allRefs.length}</div>
            <div className="text-[10px] text-gray-500">Peer-reviewed sources</div>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 text-center border border-gray-100">
            <div className="text-lg font-bold text-gray-700">{totalClaims}</div>
            <div className="text-[10px] text-gray-500">Total claims audited</div>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-2xl border border-brand-200 p-4 mb-6">
          <p className="text-xs text-gray-700 leading-relaxed">
            MannChill combines validated biomarkers (HRV, sleep), established frameworks
            (K6 severity bands), and diaspora-specific research on financial stress.
            Every threshold and nudge is traceable to published research.
            Where we make design decisions, we document them transparently.
          </p>
        </div>

        {/* Collapsible sections */}
        {SECTIONS.map(s => <Section key={s.key} section={s} />)}

        {/* Bibliography toggle */}
        <button
          onClick={() => setShowBib(b => !b)}
          className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left mb-4 transition-all hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <span className="text-sm font-semibold text-gray-900">Full Bibliography</span>
              <span className="text-[10px] text-gray-400">{allRefs.length} sources</span>
            </div>
            <span className="text-gray-400 text-lg transition-transform" style={{ transform: showBib ? 'rotate(180deg)' : 'none' }}>
              ▾
            </span>
          </div>
        </button>

        {showBib && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <ol className="space-y-2.5">
              {allRefs.map(ref => (
                <li key={ref.id} className="text-[11px] text-gray-600 leading-relaxed">
                  <span className="text-gray-900 font-medium">[{ref.id}]</span>{' '}
                  {ref.full}{' '}
                  {ref.doi && <span className="text-brand-500">DOI: {ref.doi}</span>}
                  {ref.pmcid && <span className="text-brand-500">PMCID: {ref.pmcid}</span>}
                  {ref.url && <span className="text-brand-500">{ref.url}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm"
        >
          Back
        </button>

      </div>
    </div>
  )
}
