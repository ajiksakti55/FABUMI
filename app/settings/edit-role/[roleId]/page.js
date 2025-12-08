import { use } from "react";
import EditRoleForm from "./EditRoleForm";

export default function Page(props) {
  const params = use(props.params);
  return <EditRoleForm params={params} />;
}
