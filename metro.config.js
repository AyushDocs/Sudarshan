const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to use the pre-compiled version ('main') instead of the source ('react-native')
// This fixes resolution issues in libraries like react-native-svg
config.resolver.resolverMainFields = ['main', 'module', 'browser'];

module.exports = config;
