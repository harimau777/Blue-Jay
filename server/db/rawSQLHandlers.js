var sql = require('./sqlConnectionHelper.js');

module.exports = {
  //must have googleId, createdAt, avatarUrl
  addUser: (req, res) => {
    var keys = [];
    var values = [];

    for (var key in req.body) {
      keys.push(key);
      values.push(req.body[key]);
    }

    sql([

      'INSERT INTO users (' + keys.join(', ') + ')',
      'VALUES ("' + values.join('", "') + '")'

    ].join(' '), function (error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    });
  },

  getUsers: (req, res) => {
    sql('SELECT * FROM users', (error, rows, fields) => {
      if(error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    })
  },
  //return owned streams aswell
  getUser: (req, res) => {
    var query1 = 'SELECT u.id, u.username, sub.phoneNotifications, sub.emailNotifications, s.title, s.subscriberCount, s.description FROM users u ' + 
      'LEFT JOIN (subscriptions sub, streams s) ' + 
      'ON (u.username="' + req.username + '" AND u.id = sub.userId AND s.id = sub.streamId) WHERE u.username="' + req.username + '";\n'
      query2 = 'SELECT * FROM streams WHERE creatorId=(SELECT id FROM users WHERE username="' + req.username +'");\n'
    sql(query1,
    function (error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        sql(query2, function(error2, rows2, fields2) {
          if (error2) {
            res.sendStatus(404);
          } else {
            if(rows[0] !== undefined) {
              rows[0].subscriptions = [];
              rows[0].ownedStreams = rows2;
              for (var i = 0; i < rows.length; i++) {
                if (rows[i].creatorId !== null) {
                  rows[0].subscriptions.push({
                    phoneNotifications: rows[i].phoneNotifications,
                    emailNotifications: rows[i].emailNotifications,
                    title: rows[i].title,
                    online: rows[i].online,
                    descriptions: rows[i].description
                  });
                }
              }
            } else {
              if (rows.title !== undefined) {
                rows.subscriptions = [];
                rows.ownedStreams = rows2;
                rows.subscriptions.push({
                    phoneNotifications: rows.phoneNotifications,
                    emailNotifications: rows.emailNotifications,
                    title: rows.title,
                    online: rows.online,
                    descriptions: rows.description
                  });
                res.send(rows);
              } else {
                rows.ownedStreams = rows2;
                rows.subscriptions = [];
                res.send(rows);
              }
            }
            res.send(rows[0]); 
          }
        })
      }
    });
  },

  //must take obj with username key
  deleteUser: (req, res) => {
    sql('DELETE FROM users WHERE username="' + req.username + '"', 
    function (error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    });    
  },

  updateUser: (req, res) => {
    var changes = '';
    for (key in req.body) {
      if (key !== 'id') {
        changes = changes + key + ' = "' + req.body[key] + '", '
      }
    }
    if (changes.length > 2) {
      changes = changes.slice(0, -2);
    }
    sql('UPDATE users SET ' + changes + ' WHERE id="' + req.body.id + '";', 
      function(error, rows, fields) {
        if (error) {
          res.sendStatus(404);
        } else {
          res.send(rows)
        }
      })
  },

  //must have classname, access T/F, keywords, 
  //schedule info
  addStream: (req, res) => { 
    var keys = [];
    var values = [];
    req.body.online = false;
    req.body.categories = req.body.categories || [];
    req.body.keywords = req.body.keywords || [];
    for (var key in req.body) {
      if (key !== 'id' && key !== 'categories' && key !== 'keywords' && key !== 'subscriberCount') {
        keys.push(key);
        values.push(req.body[key]);
      } 
    }
    var query = 'INSERT INTO streams (' + keys.join(', ') + ', subscriberCount, creatorId) ' + 
      'VALUES ("' + values.join('", "') + '", '  + 0 + ', ' + req.userId + ');\n' + 
      'SET @newStream = LAST_INSERT_ID();\n';
    if (req.body.categories !== undefined) {
      for (var i = 0; i < req.body.categories.length; i++) {
        query = query + ('INSERT IGNORE INTO categories (text) VALUES ("' + req.body.categories[i] + '");\n' +  
                'SET @newCategory = (SELECT id FROM categories WHERE text="' + req.body.categories[i] +  '");\n' + 
                'INSERT INTO streams_categories (streamId, categoryId) VALUES (@newStream, @newCategory);\n')
      }
    }
    if (req.body.keywords !== undefined) {
      for (var i = 0; i < req.body.keywords.length; i++) {
        query = query + ('INSERT IGNORE INTO keywords (text) VALUES ("' + req.body.keywords[i] + '");\n' +  
          'SET @newKeyword = (SELECT id FROM keywords WHERE text="' + req.body.keywords[i] +  '");\n' + 
          'INSERT INTO streams_keywords (streamId, keywordId) VALUES (@newStream, @newKeyword);\n');
      }
    }
    queries = query.split('\n');
    executeQueries(queries, res);
  },

  searchStreams: (req, res) => {
    var categories = req.body.categories;
    var keywords = req.body.keywords;
    var req = 'SELECT streams.* FROM streams \
        INNER JOIN streams_categories ON (streams.id=streamId) \
        INNER JOIN categories ON (categories.id=categoryId) \
        WHERE'
    if (categories === undefined && keywords === undefined) {
      sql('SELECT * FROM streams', function(error, rows, fields) {
        if(error) {
          res.sendStatus(404);
        } else {
          res.send(rows);
        }
      })

    } else if (keywords === undefined){
      sql('SELECT * FROM streams \
        INNER JOIN streams_categories ON (streams.id=streamId) \
        INNER JOIN categories ON (categories.id=categoryId) \
        WHERE categories.text=' + categories, function(error, rows, fields) {

          if (error) {
            res.sendStatus(404);
          } else {
            res.send(rows);
          }
        })
    }
  },

  updateStream: (req, res) => {
    var changes = '';
    for (key in req.body) {
      if (key === 'subscriberCount') {
        changes = changes + key + ' = ' + req.body[key] + ', '
      } else if (key !== 'categories' && key !== 'keywords' && key !== 'id') {
        changes = changes + key + ' = "' + req.body[key] + '", '
      }
    }
    if (changes.length > 2) {
      changes = changes.slice(0, -2);
    }
    var query = 'UPDATE streams SET ' + changes + ' WHERE title="' + req.title + '";\n' +
      'SET @stream = (SELECT id FROM streams WHERE title="' + req.title + '");\n' +
      'DELETE FROM streams_categories WHERE streamID=@stream; \n' +
      'DELETE FROM streams_keywords WHERE streamID=@stream; \n';
    if (req.body.categories !== undefined) {
      for (var i = 0; i < req.body.categories.length; i++) {
        query = query + ('INSERT IGNORE INTO categories (text) VALUES ("' + req.body.categores[i] + '");\n' +  
        'SET @newCategory = (SELECT id FROM categories WHERE text="' + req.body.categories[i] +  '");\n' + 
        'INSERT INTO streams_categories (streamId, categoryId) VALUES (@stream, @newCategory);\n') 
      }
    }
    if (req.body.keywords !== undefined) {
      for (var i = 0; i < req.body.keywords.length; i++) {
        query = query + ('INSERT IGNORE INTO keywords (text) VALUES ("' + req.body.keywords[i] + '");\n' +  
        'SET @newKeyword = (SELECT id FROM keywords WHERE text="' + req.body.keywords[i] +  '");\n' + 
        'INSERT INTO streams_keywords(streamId, keywordId) VALUES (@stream, @newKeyword);\n') 
      }
    }
    queries = query.split('\n');
    executeQueries(queries, res);
  },

  getStream: (req, res) => {
    var query = 'SELECT * FROM streams WHERE title="' + req.title + '";\n' + 
      'SELECT c.* FROM streams s LEFT JOIN (streams_categories sc, categories c) ' + 
      'ON (s.title="' + req.title + '" AND s.id = sc.streamId AND c.id = sc.categoryId) ' + 
      'WHERE s.title = "' + req.title + '";\n' +
      'SELECT k.* FROM streams s LEFT JOIN (streams_keywords sk, keywords k) ' + 
      'ON (s.title="' + req.title + '" AND s.id = sk.streamId AND k.id = sk.keywordId) ' + 
      'WHERE s.title = "' + req.title + '";\n';
    queries = query.split('\n');
    returnQueries(queries, res, function(toRet) {
      toRet[0].categories = [];
      toRet[0].keywords = [];
      if (toRet[1].length === undefined) {
        toRet[1] = toRet[1] || []
        
      }
      if (toRet[2].length === undefined) {
        toRet[2] = toRet[2] || []
        
      }
      for (var i = 0; i < toRet[1].length; i++) {
        toRet[0].categories.push(toRet[1][i].text);
      }
      for (var i = 0; i < toRet[2].length; i++) {
        toRet[0].keywords.push(toRet[2][i].text);
      }
      res.send(toRet[0]);
    });
  },

  //must take obj with classname key
  deleteStream: (req, res) => {
    sql('DELETE FROM streams WHERE title="' + req.title + '"', 
    function (error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    });    

  },

  addSubscription: (req, res) => {
    var query  = 'INSERT INTO subscriptions (streamId, userId, phoneNotifications, emailNotifications) VALUES (' + 
    '(SELECT id FROM streams WHERE title="' + req.title + '"), ' + req.userId + ', "false", "false");\n';
    sql(query, function(error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    })
  },

  updateSubscription: (req, res) => {
    var query  = 'DELETE FROM subscriptions WHERE (userId=' + req.userId + 
    ' AND streamId=(SELECT id FROM streams WHERE title="' + req.title + '));\n';
    sql(query, function(error, rows, fields) {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(rows);
      }
    })
  },

//   getSchedule: (req, res) => {
//     User.getClasses().then((classes) => {
//       classes.getSchedules().then((schedules) => {
//         res.send({data: JSON.stringify(schedules)});
//       })
//     })
//   },
};

var executeQueries = function (queries, res, currIndex) {
  var currIndex = currIndex || 0;
  sql(queries[currIndex], function(error, rows, fields) {
    if (error) {
      console.log('repeater error: ', error)
      res.sendStatus(404);
    } else {
      currIndex++;
      if (currIndex >= queries.length - 1) {
        res.send(rows);
      } else {
        executeQueries(queries, res, currIndex);
      }
    }
  })
};

var returnQueries = function (queries, res, callback, currIndex, toRet) {
  var toRet = toRet || [];
  var currIndex = currIndex || 0;
  sql(queries[currIndex], function(error, rows, fields) {
    if (error) {
      console.log('repeater error: ', error)
      res.sendStatus(404);
    } else {
      currIndex++;
      toRet.push(rows);
      if (currIndex >= queries.length - 1) {
        callback(toRet);
      } else {
         returnQueries(queries, res, callback, currIndex, toRet);
      }
    }
  })
};

