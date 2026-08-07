import NewProjectPage from './page';

describe('Eito New Project Form Component', () => {
  it('should export default NewProjectPage component', () => {
    expect(NewProjectPage).toBeDefined();
    expect(typeof NewProjectPage).toBe('function');
  });
});
