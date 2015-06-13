var assert = require('assert');
var WriteBuffer = require('../');

describe('WriteBuffer', function() {
  var w;
  beforeEach(function() {
    w = new WriteBuffer();
  });

  function join(arr) {
    return arr.map(function(buf) {
      return buf.toString('hex');
    }).join('');
  }

  describe('.writeUInt8', function() {
    it('should write bytes', function() {
      w.writeUInt8(1);
      w.writeUInt8(2);
      w.writeUInt8(3);
      w.writeUInt8(4);
      assert.equal(join(w.render()), '01020304');
    });

    it('should correctly handle overflow', function() {
      w.reserve(3);
      w.writeUInt8(1);
      w.writeUInt8(2);
      w.writeUInt8(3);
      w.writeUInt8(4);
      assert.equal(join(w.render()), '01020304');
    });
  });

  describe('.writeUInt16BE', function() {
    it('should write bytes', function() {
      w.writeUInt16BE(0x0102);
      w.writeUInt16BE(0x0304);
      assert.equal(join(w.render()), '01020304');
    });

    it('should correctly handle overflow', function() {
      w.reserve(2);
      w.reserve(3);
      w.writeUInt16BE(0x0102);
      w.writeUInt16BE(0x0304);
      w.writeUInt16BE(0x0506);
      assert.equal(join(w.render()), '010203040506');
    });
  });

  describe('.writeUInt24BE', function() {
    it('should write bytes', function() {
      w.writeUInt24BE(0x010203);
      w.writeUInt24BE(0x040506);
      assert.equal(join(w.render()), '010203040506');
    });
  });

  describe('.writeUInt32BE', function() {
    it('should write bytes', function() {
      w.writeUInt32BE(0x01020304);
      w.writeUInt32BE(0x05060708);
      assert.equal(join(w.render()), '0102030405060708');
    });
  });

  describe('.skip', function() {
    it('should skip bytes', function() {
      w.skip(4);
      w.writeUInt32BE(0xdeadbeef);
      assert(/^.{8}deadbeef$/.test(join(w.render())));
    });
  });

  describe('.copyFrom', function() {
    it('should copy bytes', function() {
      var tmp = new Buffer(128);
      for (var i = 0; i < tmp.length; i++)
        tmp[i] = i;
      w.writeUInt32BE(0xdeadbeef);
      w.copyFrom(tmp);
      w.writeUInt32BE(0xabbadead);

      assert.equal(
        join(w.render()),
        'deadbeef000102030405060708090a0b0c0d0e0f101112131415161718191a1b' +
        '1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b' +
        '3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b' +
        '5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b' +
        '7c7d7e7fabbadead');
    });

    it('should copy bytes using offset', function() {
      var tmp = new Buffer(128);
      for (var i = 0; i < tmp.length; i++)
        tmp[i] = i;
      w.writeUInt32BE(0xdeadbeef);
      w.copyFrom(tmp, 10, 12);
      w.writeUInt32BE(0xabbadead);

      assert.equal(
        join(w.render()),
        'deadbeef0a0babbadead');
    });
  });

  describe('.skip', function() {
    it('should copy bytes', function() {
      w.reserve(5);
      var h = w.skip(4);
      w.writeUInt32BE(0xabbadead);
      h.writeUInt32BE(0xdeadbeef);

      assert.equal(
        join(w.render()),
        'deadbeefabbadead');
    });
  });
});
