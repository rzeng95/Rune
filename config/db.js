// ToDo: make these environment variables
var dbUsername = 'admin';
var dbPassword = 'reverse';

module.exports = {
    'production' : 'mongodb://'+dbUsername+':'+dbPassword+'@ds054308.mlab.com:54308/runedb1',
    'test' : 'mongodb://'+dbUsername+':'+dbPassword+'@ds036069.mlab.com:36069/runedb1_test'
};
