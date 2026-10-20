import {requireChatGPTUser} from '../chatgpt-auth';
import ResumeManager from '../resume-builder/resume-manager';
export const dynamic='force-dynamic';
export default async function DocumentsPage(){const user=await requireChatGPTUser('/documents');return <ResumeManager name={user.fullName??user.email} documents/>;}
