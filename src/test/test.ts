import axios from 'axios';

export const testApiCall = async () => {
  const testUrl = process.env.TEST_API_URL as string;
  console.log(testUrl);
  const result = await axios(testUrl);
  const test: TestType = { testAttr: result.data };
  return test;
};

export type TestType = { testAttr: string };
