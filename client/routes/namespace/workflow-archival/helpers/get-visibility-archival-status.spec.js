import getVisibilityArchivalStatus from './get-visibility-archival-status';

describe('getVisibilityArchivalStatus', () => {
  describe('When namespaceSettings is not defined', () => {
    it('should return "".', () => {
      const namespaceSettings = undefined;
      const output = getVisibilityArchivalStatus(namespaceSettings);

      expect(output).toEqual('');
    });
  });

  describe('When namespaceSettings.configuration.visibilityArchivalStatus = "ENABLED"', () => {
    it('should return "ENABLED".', () => {
      const namespaceSettings = {
        configuration: {
          visibilityArchivalStatus: 'ENABLED',
        },
      };
      const output = getVisibilityArchivalStatus(namespaceSettings);

      expect(output).toEqual('ENABLED');
    });
  });
});
