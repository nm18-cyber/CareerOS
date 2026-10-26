import {requireUser} from '../../../lib/access';
import ImportResume from './importer';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireUser();return <ImportResume name={u.fullName??u.email}/>;}
