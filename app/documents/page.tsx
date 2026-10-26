import {requireUser} from '../../lib/access';
import ResumeManager from '../resume-builder/resume-manager';
export const dynamic='force-dynamic';
export default async function DocumentsPage(){const user=await requireUser();return <ResumeManager name={user.fullName??user.email} documents/>;}
