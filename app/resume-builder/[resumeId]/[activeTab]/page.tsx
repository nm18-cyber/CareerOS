import {requireChatGPTUser} from '../../../chatgpt-auth';
import ResumeEditor from '../../editor/resume-editor';
import {notFound} from 'next/navigation';
import {tabSlugs} from '../../../../lib/resume-model';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{resumeId:string;activeTab:string}>}){const {resumeId,activeTab}=await params;if(!tabSlugs.includes(activeTab))notFound();const user=await requireChatGPTUser(`/resume-builder/${resumeId}/${activeTab}`);return <ResumeEditor name={user.fullName??user.email} resumeId={resumeId} activeTab={activeTab}/>;}
