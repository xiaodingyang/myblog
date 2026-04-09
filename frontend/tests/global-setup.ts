import testConfig from './config';

export default function globalSetup() {
  console.log('\n========================================');
  console.log('Playwright Test Configuration');
  console.log('========================================');
  console.log(`Target: ${testConfig.target}`);
  console.log(`Base URL: ${testConfig.baseURL}`);
  console.log(`API URL: ${testConfig.apiUrl}`);
  console.log(`Mock API: ${testConfig.useMockApi ? 'Enabled' : 'Disabled'}`);
  console.log('========================================\n');
}
