import type { Metadata } from "next";
import { LEGAL, LegalPage, Mail } from "../../components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy · CareerOS",
  description: "What CareerOS collects, why, who processes it, and how to access or delete your data.",
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" intro={<p>This policy explains what personal data {LEGAL.operator} (“we”, “us”) collects when you use the CareerOS website and workspace, why we use it, who helps us process it, and the choices you have. We wrote it to be read, not skimmed past. If anything is unclear, email <Mail />.</p>}>
    <section>
      <h2>1. Who is responsible</h2>
      <p>{LEGAL.operator} is the data fiduciary (data controller) for the personal data described here. You can reach us at <Mail /> for any privacy question or request.</p>
    </section>

    <section>
      <h2>2. What we collect</h2>
      <h3>Account details</h3>
      <ul>
        <li><strong>Email address and name</strong> you give when you sign up.</li>
        <li><strong>Password</strong>, if you use one. It is handled by our sign-in provider, Neon Auth, and stored only as a one-way hash. We never see it.</li>
        <li><strong>Google profile basics</strong> (name, email address, profile picture) if you choose “Continue with Google”.</li>
      </ul>
      <h3>What you put in your workspace</h3>
      <ul>
        <li>Resumes, cover letters, their saved versions, and any job descriptions you paste in.</li>
        <li>Job applications, notes, follow-up dates, and the companies and contacts you track.</li>
        <li>Career goals you set (target title, target date, salary range).</li>
        <li>Conversations with the Career Assistant, and resume match scores.</li>
      </ul>
      <p>When you import a resume file (PDF, Word or text), the file is read inside your browser. Only the extracted text you choose to save is sent to us. The file itself is not uploaded.</p>
      <h3>Technical information</h3>
      <ul>
        <li>Your IP address and browser details, which our hosting provider records when you visit, for security and to keep the service running.</li>
        <li>Sign-in cookies (see section 7) and short-lived usage counters that enforce fair-use limits.</li>
      </ul>
      <p>We do not use advertising or analytics trackers.</p>
    </section>

    <section>
      <h2>3. Why we use it</h2>
      <ul>
        <li><strong>To provide CareerOS:</strong> to store your workspace, show it back to you, and keep each account’s data separate.</li>
        <li><strong>To sign you in and keep your account secure</strong>, including sending verification and password-reset codes.</li>
        <li><strong>To run AI features you ask for</strong> (see section 4).</li>
        <li><strong>To prevent abuse</strong>, such as limiting how many AI requests an account can make each hour.</li>
        <li><strong>To tell you about important changes</strong> to the service, these terms or this policy.</li>
      </ul>
      <p>We process your data on the basis of your consent when you create an account and use the features, and where needed to provide the service you asked for or to meet legal obligations. We do not sell your personal data, and we do not use your workspace content to show ads.</p>
    </section>

    <section>
      <h2>4. AI features</h2>
      <p>When you use the Career Assistant or AI writing tools, we send your prompt, recent messages in that conversation and, only if you attach one, the content of the selected resume to the AI provider configured for the service (Groq, Google Gemini or OpenAI). Dedicated contact fields on a resume (such as phone number) are left out, but free-text sections can contain personal information, so review what you attach. The provider returns a response, which we save in your conversation. These providers process the data under their own terms for business API customers.</p>
      <p>When no AI provider is configured, responses come from built-in templates and nothing is sent to an AI provider.</p>
    </section>

    <section>
      <h2>5. Who processes data for us</h2>
      <p>We use these service providers. Each receives only what it needs for its part of the service.</p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead><tr><th>Provider</th><th>What it does</th><th>Data involved</th></tr></thead>
          <tbody>
            <tr><td>Cloudflare</td><td>Hosts and delivers the website</td><td>Requests to the site, IP address, browser details</td></tr>
            <tr><td>Neon</td><td>Database and sign-in (Neon Auth), including verification emails</td><td>Account details and all workspace content</td></tr>
            <tr><td>Google</td><td>“Continue with Google” sign-in; Google Fonts for the site’s typefaces; YouTube (privacy-enhanced mode) for an embedded guide video</td><td>Sign-in details if you use Google; IP address and browser details when fonts or the video load</td></tr>
            <tr><td>Groq, Google Gemini or OpenAI</td><td>AI responses, when configured</td><td>Prompts, conversation context and any resume you attach</td></tr>
          </tbody>
        </table>
      </div>
      <p>Job listings come from Arbeitnow’s public feed. We fetch them from our server, and no information about you is sent to Arbeitnow. Clicking a listing or a search link takes you to that third-party site, which has its own privacy policy.</p>
      <p>We may also disclose data if required by law, or to protect the rights, safety or property of our users or the public.</p>
    </section>

    <section>
      <h2>6. Where your data is stored</h2>
      <p>Your account and workspace data are stored in Neon’s data centre in Singapore. Cloudflare serves the site from locations around the world, and AI providers may process requests in the United States or other countries. By using CareerOS you understand that your data may be processed outside India, in countries not restricted by the Government of India. We rely on our providers’ contractual and security commitments to protect it.</p>
    </section>

    <section>
      <h2>7. Cookies</h2>
      <p>We use only cookies that are needed for the service to work. We do not use advertising or analytics cookies.</p>
      <ul>
        <li><strong>Sign-in cookies</strong> (names starting with <code>__Secure-neon-auth</code>): keep you signed in and protect the Google sign-in flow. The main session lasts up to 7 days and is renewed while you use the site.</li>
        <li><strong><code>careeros_guest</code></strong>: set only for visitors from the earlier guest version of CareerOS, so their work can move into their new account.</li>
      </ul>
    </section>

    <section>
      <h2>8. How long we keep it</h2>
      <ul>
        <li>Workspace content stays until you delete it or your account is deleted.</li>
        <li>Resume version history keeps the 30 most recent versions of each document.</li>
        <li>Fair-use counters expire after about two hours and are then cleared.</li>
        <li>When your account is deleted, we remove your account and workspace data within 30 days. Copies in backups are overwritten in the normal backup cycle.</li>
        <li>We may keep limited information longer if the law requires it.</li>
      </ul>
    </section>

    <section>
      <h2>9. Your rights</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>give you a summary of the personal data we hold about you and how it is used, and a copy of it;</li>
        <li>correct or update inaccurate or incomplete data;</li>
        <li>delete your account and data;</li>
        <li>withdraw your consent, which means we will stop processing and delete your account (this does not affect processing that already took place);</li>
        <li>nominate another person to exercise these rights for you if you die or become unable to.</li>
      </ul>
      <p>You can edit or delete most workspace content yourself at any time. For anything else, including account deletion, email <Mail /> from the address on your account. We will respond within 30 days. Depending on where you live, you may have additional rights under local law, such as the EU or UK GDPR, and we will honour them.</p>
    </section>

    <section>
      <h2>10. Grievances</h2>
      <p>If you have a concern about how we handle your data, write to our grievance contact at <Mail />. We will acknowledge it promptly and aim to resolve it within 30 days. If you are in India and are not satisfied with our response, you may complain to the Data Protection Board of India.</p>
    </section>

    <section>
      <h2>11. Security</h2>
      <p>Connections to CareerOS are encrypted (HTTPS), passwords are stored only as hashes by our sign-in provider, and every request is checked so that one account cannot read another’s data. Administrator access is limited. No online service can be perfectly secure, so please use a strong, unique password and tell us right away at <Mail /> if you suspect a problem.</p>
    </section>

    <section>
      <h2>12. Information about other people</h2>
      <p>If you add details about other people, such as recruiters or referees in your contacts, make sure you have a right to share them and keep them to what you need for your job search.</p>
    </section>

    <section>
      <h2>13. Children</h2>
      <p>CareerOS is for people aged 18 and over. We do not knowingly collect data from anyone under 18. If you believe a child has created an account, contact us and we will delete it.</p>
    </section>

    <section>
      <h2>14. Changes to this policy</h2>
      <p>We will update this page when our practices change and revise the date at the top. If a change materially affects how we use your data, we will tell you by email or in the app before it takes effect.</p>
    </section>

    <section>
      <h2>15. Contact</h2>
      <p>{LEGAL.operator} · <Mail /></p>
    </section>
  </LegalPage>;
}
