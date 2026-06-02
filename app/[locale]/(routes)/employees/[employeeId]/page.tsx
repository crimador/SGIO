import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { getEmployeesData } from '@/actions/employees/get-employees';
import EmployeeProfile from './components/EmployeeProfile';

interface Props {
  params: { employeeId: string };
}

const EmployeeViewPage = async ({ params }: Props) => {
  const result = await getEmployeesData(params.employeeId);

  if (!result) return <div>Employé introuvable</div>;

  return (
    <Container
      title={`${result.employee.firstName} ${result.employee.lastName}`}
      description={result.employee.position ?? 'Employé'}
    >
      <EmployeeProfile
        employee={result.employee as any}
        payslips={result.payslips}
        requests={result.requests}
        timekeeping={result.timekeeping as any}
      />
    </Container>
  );
};

export default EmployeeViewPage;
