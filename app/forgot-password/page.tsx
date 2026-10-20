import Link from "next/link";
import { chatGPTSignInPath } from "../chatgpt-auth";

export default function ForgotPasswordPage() {
  return <main className="auth-page"><div className="auth-shell"><Link href="/" className="brand"><span className="brand-mark">✳</span><span>career<span className="brand-os">os</span></span></Link><div className="auth-card"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Let’s get you<br/><em>back in.</em></h1><p className="auth-intro">CareerOS uses managed sign-in, so password recovery happens with the identity provider you used to sign in.</p><a className="button button-yellow auth-primary" href={chatGPTSignInPath("/home")} target="_top">Continue to secure sign-in <span>→</span></a><p className="auth-note">If you use a ChatGPT account, recover your password through your account’s sign-in page.</p></div><p className="auth-footer"><Link href="/login">← Return to sign in</Link></p></div></main>;
}
