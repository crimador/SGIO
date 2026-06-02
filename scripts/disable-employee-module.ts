import { prismadb } from '@/lib/prisma';

async function disableOldEmployeeModule() {
  try {
    const existingModule = await prismadb.system_Modules_Enabled.findFirst({
      where: { name: 'employee' }
    });

    if (existingModule) {
      console.log('Désactivation de l\'ancien module employee...');
      await prismadb.system_Modules_Enabled.update({
        where: { id: existingModule.id },
        data: { enabled: false }
      });
      console.log('✅ Ancien module employee désactivé !');
    } else {
      console.log('ℹ️ Module employee non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation du module employee:', error);
  }
}

disableOldEmployeeModule();
