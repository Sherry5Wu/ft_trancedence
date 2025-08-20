// for testig only
export default {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testEnvironment: 'node',
};
// jest.config.js
// export default {
//   testEnvironment: "node",
//   transform: {}, // no transform needed for plain ESM
//   extensionsToTreatAsEsm: [".js"], // treat .js files as ESM
//   testMatch: ["**/?(*.)+(test).[jt]s?(x)"], // default test file patterns
// };
