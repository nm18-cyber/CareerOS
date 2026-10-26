import {requireUser} from '../../../../lib/access';
import VersionHistory from './versions';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{resumeId:string}>}){const {resumeId}=await params;const u=await requireUser();return <VersionHistory name={u.fullName??u.email} id={resumeId}/>;}
