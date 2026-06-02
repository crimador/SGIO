import { getUser } from '@/actions/get-user';

import Container from '../components/ui/Container';
import { NotionForm } from './components/NotionForm';
import { ProfileForm } from './components/ProfileForm';
import { PasswordChangeForm } from './components/PasswordChange';
import { ProfilePhotoForm } from './components/ProfilePhotoForm';

import H4Title from '@/components/typography/h4';

const ProfilePage = async () => {
  const data = await getUser();

  if (!data) {
    return <div>No user data.</div>;
  }

  return (
    <Container
      title="Mon profil"
      description="Modifiez vos informations personnelles et votre mot de passe."
    >
      <div>
        <H4Title>Photo de profil</H4Title>
        <ProfilePhotoForm data={data} />

        <H4Title>Informations personnelles</H4Title>
        <ProfileForm data={data} />

        <H4Title>Changer le mot de passe</H4Title>
        <PasswordChangeForm userId={data.id} />

        <H4Title>Intégration Notion</H4Title>
        <NotionForm userId={data.id} />
      </div>
    </Container>
  );
};

export default ProfilePage;
