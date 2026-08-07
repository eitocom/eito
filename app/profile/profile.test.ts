import ProfilePage from './page';

describe('Eito User Profile Component', () => {
  it('should export default ProfilePage component', () => {
    expect(ProfilePage).toBeDefined();
    expect(typeof ProfilePage).toBe('function');
  });
});
