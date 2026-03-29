export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 29, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-semibold text-base mb-2">What MannChill Does</h2>
          <p>
            MannChill is a stress-awareness tool built for the Nepali diaspora. It combines data from
            wearables, self-reports, and financial inputs to estimate allostatic load and provide
            culturally-adapted wellness nudges. It is not a clinical diagnostic tool.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">Data We Access</h2>
          <p>When you connect a WHOOP account, we request access to:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Recovery data (HRV, resting heart rate, SpO2)</li>
            <li>Sleep data (duration, efficiency, stages)</li>
            <li>Cycle data (daily strain)</li>
          </ul>
          <p className="mt-2">
            We also collect self-reported mood and stress ratings, and optional financial data you
            enter manually. Voice journal recordings are processed for stress analysis and are not
            stored permanently.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">How We Use Your Data</h2>
          <p>
            Your data is used solely to calculate your stress score and generate personalized nudges.
            We do not sell, share, or transfer your data to third parties for advertising or marketing
            purposes.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">Data Storage</h2>
          <p>
            MannChill is a demo application. Data is processed in-session and is not persisted in a
            database. Connected wearable tokens are stored only for the duration of your session.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">Third-Party Services</h2>
          <p>
            We integrate with WHOOP (wearable data) and Google Gemini (voice journal analysis).
            These services have their own privacy policies. We send only the minimum data required
            for each integration.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">Your Rights</h2>
          <p>
            You can disconnect your WHOOP account at any time, which revokes our access to your
            wearable data. You can also contact us at duwadisudan@gmail.com to request data deletion.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">Contact</h2>
          <p>
            Questions about this policy? Reach us at{' '}
            <a href="mailto:duwadisudan@gmail.com" className="text-indigo-600 underline">
              duwadisudan@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
