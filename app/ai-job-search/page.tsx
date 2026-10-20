import {requireChatGPTUser} from '../chatgpt-auth';
import {CareerShell} from '../../components/career-shell';
import ChatWorkspace from './workspace';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/ai-job-search');return <CareerShell name={u.fullName??u.email} active="/ai-job-search" title="Let's Discuss Your Next Career Move" description="Explore your options, work on your story, and plan your next step."><ChatWorkspace/></CareerShell>}
