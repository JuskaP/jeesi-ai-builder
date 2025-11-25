import CreateAgentForm from './CreateAgentForm';

export default function AgentBuilderHome() {
  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <h2 className='text-2xl font-semibold text-foreground'>Agent Builder V1</h2>
      <p className='mt-2 text-muted-foreground'>
        Kuvaile mitä haluat agentin tekevän — järjestelmä generoi specin ja scaffoldin.
      </p>
      <CreateAgentForm />
    </div>
  );
}
