module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '/gamemap/' : '/',
  pwa: {
    name: 'Game Map',
    themeColor: '#9E9E9E'
  },
  productionSourceMap: false
}