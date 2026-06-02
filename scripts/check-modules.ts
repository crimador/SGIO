import { prismadb } from '@/lib/prisma';

async function checkModuleStatus() {
  try {
    const modules = await prismadb.system_Modules_Enabled.findMany({
      where: {
        name: {
          in: ['employee', 'hr']
        }
      }
    });
    
    console.log('Statut des modules RH:');
    modules.forEach(module => {
      console.log(`- ${module.name}: ${module.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    });
    
    return modules;
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

checkModuleStatus();
