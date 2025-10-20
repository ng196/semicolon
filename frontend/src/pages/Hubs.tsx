import { useSearchParams } from "react-router-dom";
import HubsPage from "./hubs/HubsPage";
import ProjectPage from "./hubs/ProjectPage";

export default function Hubs() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const projectId = searchParams.get('id');

  // If view=project and id exists, show project page
  if (view === 'project' && projectId) {
    return <ProjectPage projectId={projectId} />;
  }

  // Otherwise show the main hubs page
  return <HubsPage />;
}