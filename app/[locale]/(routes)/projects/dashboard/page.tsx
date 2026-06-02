import React from 'react';
import Container from '../../components/ui/Container';
import ProjectDashboardCockpit from './components/ProjectDasboard';
import StatusKanban from './components/StatusKanban';
import { getProjectsDashboard } from '@/actions/projects/get-projects-dashboard';
import { getKanbanTasks } from '@/actions/projects/get-kanban-tasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, KanbanSquare } from 'lucide-react';

const ProjectDashboard = async () => {
  const [data, kanbanTasks] = await Promise.all([
    getProjectsDashboard(),
    getKanbanTasks(),
  ]);

  if (!data) {
    return <div>Données non disponibles</div>;
  }

  return (
    <Container
      title="Tableau de bord — Projets"
      description="Vue d'ensemble de vos projets, tâches et échéances."
    >
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <KanbanSquare className="h-4 w-4" />
            Kanban statuts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectDashboardCockpit data={data} />
        </TabsContent>

        <TabsContent value="kanban">
          <StatusKanban initialTasks={kanbanTasks} />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default ProjectDashboard;
