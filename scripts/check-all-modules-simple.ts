import { prismadb } from '@/lib/prisma';

async function checkModules() {
  try {
    const allModules = await prismadb.system_Modules_Enabled.findMany();
    
    console.log('TOUS les modules:');
    allModules.forEach(module => {
      console.log(`- ${module.name}: ${module.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    });
    
    return allModules;
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

checkModules();
