import type { Metadata } from "next";
import { LEGAL, LegalPage, Mail } from "../../components/legal-page";

export const metadata: Metadata = {
  title: "Terms of use · CareerOS",
  description: "The rules for using CareerOS: your account, your content, AI features, plans and payments, and our responsibilities.",
};

export default function TermsPage() {
  return <LegalPage title="Terms of use" intro={<p>These terms are an agreement between you and {LEGAL.operator} (“we”, “us”) for using the CareerOS website and workspace (the “service”). By creating an account or using the service, you agree to them. Please also read our <a href="/privacy">privacy policy</a>, which explains how we handle your data.</p>}>
    <section>
      <h2>1. Who can use CareerOS</h2>
      <p>You must be at least 18 years old and able to enter into a binding contract. If you use CareerOS for an organisation, you confirm that you are allowed to accept these terms for it.</p>
    </section>

    <section>
      <h2>2. The service</h2>
      <p>CareerOS helps you build and tailor resumes and cover letters, track job applications, companies and contacts, browse job listings, and get AI-assisted suggestions. We are improving the service continually, so features may be added, changed or removed. We will give reasonable notice before removing a major feature you rely on, where we can.</p>
    </section>

    <section>
      <h2>3. Plans and payments</h2>
      <p>CareerOS is currently free. We plan to introduce paid plans. When we do:</p>
      <ul>
        <li>prices, what each plan includes, the billing period and the refund terms will be shown clearly before you buy;</li>
        <li>you will only be charged if you choose a paid plan;</li>
        <li>if we change the price of a plan you are on, we will tell you in advance, and you can cancel before the new price applies;</li>
        <li>taxes such as GST will be added where required.</li>
      </ul>
      <p>Features that are free today may become part of a paid plan in future. If that happens, we will give you notice and you will keep access to the content you created.</p>
    </section>

    <section>
      <h2>4. Your account</h2>
      <ul>
        <li>Give accurate information and keep your email address up to date, because we use it for sign-in codes and important notices.</li>
        <li>Keep your password secure and do not share your account. You are responsible for activity under your account.</li>
        <li>Tell us right away at <Mail /> if you think someone else has accessed it.</li>
      </ul>
    </section>

    <section>
      <h2>5. Your content</h2>
      <p>You own the resumes, cover letters, notes and other content you create or upload (“your content”). You give us permission to store, process, copy and display your content only as needed to run the service for you, including sending it to an AI provider when you use an AI feature (see the privacy policy). This permission ends when your content is deleted, apart from copies in backups until they are overwritten.</p>
      <p>You are responsible for your content. Make sure it is accurate, that you have the right to use it, and that it does not include other people’s personal data unless you are allowed to share it.</p>
    </section>

    <section>
      <h2>6. AI suggestions</h2>
      <p>AI-generated text can be wrong, incomplete or out of date, and may not suit your situation. Review and edit everything before you use it. Do not present skills, results or experience you do not have: you are responsible for the accuracy of anything you send to an employer. AI output is not professional, legal, financial or immigration advice.</p>
    </section>

    <section>
      <h2>7. Job listings and other websites</h2>
      <p>Job listings come from third-party sources such as Arbeitnow, and search links may take you to sites like Google. We do not create, check or endorse these listings or sites and are not responsible for their content, accuracy or availability. Be careful with any listing that asks you for payment or sensitive personal details.</p>
    </section>

    <section>
      <h2>8. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>break any law, or use CareerOS to deceive, harass or harm anyone;</li>
        <li>upload malware, or try to access another person’s account or data;</li>
        <li>scrape, overload or disrupt the service, or get around usage limits or security measures;</li>
        <li>resell, rent or provide CareerOS to others as your own service;</li>
        <li>use CareerOS to create fake credentials or misleading applications.</li>
      </ul>
    </section>

    <section>
      <h2>9. Our property</h2>
      <p>The CareerOS software, design, name, logo, templates and guides belong to us or our licensors. You may use the templates and guides to create documents for your own job search, but not copy or redistribute them as a product of your own.</p>
    </section>

    <section>
      <h2>10. Suspension and closing your account</h2>
      <p>You can stop using CareerOS at any time and ask us to delete your account by emailing <Mail />. We may suspend or close an account that breaks these terms or puts the service or other users at risk. Where reasonable, we will tell you first and give you a chance to fix the problem or download your content.</p>
    </section>

    <section>
      <h2>11. No guarantees</h2>
      <p>We work hard to keep CareerOS reliable and secure, but it is provided “as is” and “as available”. To the extent the law allows, we do not promise that it will be uninterrupted or error-free, or that using it will get you an interview or a job. Keep your own copies of anything important.</p>
    </section>

    <section>
      <h2>12. Limits on our liability</h2>
      <p>To the extent the law allows, we are not liable for indirect or consequential losses, such as lost opportunities, earnings or data, arising from your use of CareerOS. Our total liability for any claim relating to the service is limited to the amount you paid us in the 12 months before the claim, or ₹1,000 if you have not paid us anything. Nothing in these terms limits liability that cannot legally be limited, or your rights as a consumer under applicable law.</p>
    </section>

    <section>
      <h2>13. Responsibility for misuse</h2>
      <p>If you break these terms or the law while using CareerOS, and that leads to a claim against us, you agree to cover the reasonable costs and losses that result, to the extent the law allows.</p>
    </section>

    <section>
      <h2>14. Changes to these terms</h2>
      <p>We may update these terms as the service changes. We will change the date at the top and, for material changes, tell you by email or in the app before they take effect. If you keep using CareerOS after that, the new terms apply. If you do not agree, you can stop using the service and ask us to delete your account.</p>
    </section>

    <section>
      <h2>15. Law and disputes</h2>
      <p>These terms are governed by the laws of India. Please contact us first so we can try to resolve any issue informally. If we cannot, disputes will be handled by the courts of India, without affecting any right you have to bring a claim in the courts where you live.</p>
    </section>

    <section>
      <h2>16. Contact</h2>
      <p>{LEGAL.operator} · <Mail /></p>
    </section>
  </LegalPage>;
}
