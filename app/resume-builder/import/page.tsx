import {requireChatGPTUser} from '../../chatgpt-auth';
import ImportResume from './importer';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/resume-builder/import');return <ImportResume name={u.fullName??u.email}/>;}
