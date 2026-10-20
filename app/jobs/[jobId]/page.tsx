import {requireChatGPTUser} from '../../chatgpt-auth';
import ApplicationDetail from './workspace';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{jobId:string}>}){const {jobId}=await params;const u=await requireChatGPTUser(`/jobs/${jobId}`);return <ApplicationDetail name={u.fullName??u.email} id={jobId}/>;}
