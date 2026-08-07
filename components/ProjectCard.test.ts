import ProjectCard from './ProjectCard';

describe('ProjectCard Component', () => {
  it('should export ProjectCard react component', () => {
    expect(ProjectCard).toBeDefined();
    expect(typeof ProjectCard).toBe('function');
  });
});
