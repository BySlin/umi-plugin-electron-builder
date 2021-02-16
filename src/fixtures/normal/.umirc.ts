export default {
  routes: [{ path: '/', component: '@/pages/index' }],
  plugins: [require.resolve('../../')],
  electronBuilder: {
    mainSrc: 'src/bg',
    externals: ['electron-updater'],
    builderOptions: {
      appId: 'com.test.test',
      productName: '测试',
      publish: [
        {
          provider: 'generic',
          url: 'http://localhost/test',
        },
      ],
    },
  },
};
