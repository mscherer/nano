var vows   = require('vows')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

function db_name(i) { return "doc_ch" + i; }
function db(i) { return nano.use(db_name(i)); }

/*****************************************************************************
 * changes_db                                                                  *
 *****************************************************************************/
function changes_db(callback) {
  nano.db.create(db_name("a"), function () {
    async.parallel(
      [ function(cb) { db("a").insert({"foo": "bar"}, "foobar", cb); }
      , function(cb) { db("a").insert({"bar": "foo"}, "barfoo", cb); }
      , function(cb) { db("a").insert({"foo": "baz"}, "foobaz", cb); }
      ],
      function(err, results){
        db("a").changes({since:2}, callback);
      });
  });
}

function changes_db_ok(e,h,b) {
  nano.db.destroy(db_name("a"));
  assert.isNull(e);
  assert.equal(b.results.length,1);
  assert.equal(b.last_seq,3);
}

vows.describe('nano.db.changes').addBatch({
  "changes_db": {
    topic: function () { changes_db(this.callback); }
  , "=": changes_db_ok
  }
}).exportTo(module);