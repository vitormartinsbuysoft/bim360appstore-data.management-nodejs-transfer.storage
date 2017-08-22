/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// token handling in session
var Credentials = require('./../credentials');
// forge config information, such as client ID and secret
var config = require('./../config');

var mongodb = require('./mongodb');


module.exports = {
  onNewForgeToken: function (userId, refreshToken, expiresAt) {
    if (!config.stats.mongo) return;
    if (!mongodb) return;
    if (!mongodb.db) return;
    var users = mongodb.db.collection('users');
    if (!users) return;

    users.count({
      autodeskId: userId
    }, function (err, count) {
      console.log(count);
      users.update({
          autodeskId: userId
        }, {
          $set: {
            "refreshToken.forge": {
              token: refreshToken,
              refreshAfter: expiresAt
            }
          }
        },
        function (err, result) {
          if (err) console.log(err);
        });
    });
  },

  onNewStorageToken: function (userId, storageName, refreshToken, expiresAt) {
    if (userId === undefined) return;

    if (!config.stats.mongo) return;
    if (!mongodb) return;
    if (!mongodb.db) return;
    var users = mongodb.db.collection('users');
    if (!users) return;

    users.update({
        autodeskId: userId
      }, {
        $set: JSON.parse(
          '{"refreshToken.' + storageName + '":' + JSON.stringify({
            token: refreshToken,
            refreshAfter: expiresAt
          })
          + "}")
      },
      function (err, result) {
        if (err) console.log(err);
      }
    );
  }
};