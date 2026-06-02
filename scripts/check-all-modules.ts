import { prismadb } from '@/lib/prisma';

async function checkAllHRModules() {
  try {
    const allModules = await prismadb.system_Modules_Enabled.findMany({
      where: {
        name: {
          contains: 'hr'
        }
      }
    });
    
    console.log('Tous les modules contenant "hr":');
    allModules.forEach(module => {
      console.log(`- ID: ${module.id}, Name: ${module.name}, Enabled: ${module.enabled}`);
    });
    
    // Vérifier aussi les modules avec "employee"
    const employeeModules = await prismadb.system_Modules_Enabled.findMany({
      where: {
        name: {
          contains: 'employee'
        }
      }
    });
    
    console.log('\nTous les modules contenant "employee":');
    employeeModules.forEach(module => {
      console.log(`- ID: ${module.id}, Name: ${module.name}, Enabled: ${module.enabled}`);
    });
    
    return { allModules, employeeModules };
  } catch (error) {
    console.error('Erreur:', error);
    return { allModules: [], employeeModules: [] };
  }
}

checkAllHRModules();
