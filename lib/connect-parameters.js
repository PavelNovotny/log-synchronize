/**
 * 
 * Created by pavelnovotny on 15.12.16.
 */

module.exports.connectionParameters = connectionParameters;

function connectionParameters(server) {
    return {
        host: server.server,
        port: 22,
        username: server.username,
        passphrase: server.passphrase,
        privateKey: server.privateKey
    }
}
