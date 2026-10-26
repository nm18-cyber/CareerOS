import {requireUser} from '../../lib/access';
import NetworkTracker from '../../components/network-tracker';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireUser();return <NetworkTracker name={u.fullName??u.email} kind="companies"/>;}
