import { prismadb } from '@/lib/prisma';

async function addHRModule() {
  try {
    // Vérifier si le module HR existe déjà
    const existingModule = await prismadb.system_Modules_Enabled.findFirst({
      where: { name: 'hr' }
    });

    if (existingModule) {
      console.log('Le module HR existe déjà, activation...');
      await prismadb.system_Modules_Enabled.update({
        where: { id: existingModule.id },
        data: { enabled: true, position: 8 }
      });
    } else {
      console.log('Création du module HR...');
      await prismadb.system_Modules_Enabled.create({
        data: {
          name: 'hr',
          enabled: true,
          position: 8
        }
      });
    }

    console.log('✅ Module HR ajouté avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du module HR:', error);
  }
}

addHRModule();
