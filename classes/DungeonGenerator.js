// DungeonGenerator embedded directly
class DungeonGenerator {
  constructor(width, height, { minRoom = 6, maxSplits = 4 } = {}) {
    this.width = width;
    this.height = height;
    this.minRoom = minRoom;
    this.maxSplits = maxSplits;
    this.map = Array.from({ length: height }, () => Array(width).fill(0));
    this.rooms = [];
    this._split({ x: 1, y: 1, w: width - 2, h: height - 2 }, this.maxSplits);
  }

  getMap() {
    return this.map;
  }

  _split(node, depth) {
    if (depth <= 0 || node.w < this.minRoom * 2 || node.h < this.minRoom * 2) {
      return this._createRoom(node);
    }
    const splitHoriz = node.w < node.h;
    const max = (splitHoriz ? node.h : node.w) - this.minRoom * 2;
    const cut = Phaser.Math.Between(this.minRoom, max);
    let a, b;
    if (splitHoriz) {
      a = { x: node.x, y: node.y, w: node.w, h: cut };
      b = { x: node.x, y: node.y + cut, w: node.w, h: node.h - cut };
    } else {
      a = { x: node.x, y: node.y, w: cut, h: node.h };
      b = { x: node.x + cut, y: node.y, w: node.w - cut, h: node.h };
    }
    this._split(a, depth - 1);
    this._split(b, depth - 1);
    this._connect(a, b);
  }

  _createRoom(node) {
    const w = Phaser.Math.Between(this.minRoom, node.w - 1);
    const h = Phaser.Math.Between(this.minRoom, node.h - 1);
    const x = node.x + Phaser.Math.Between(0, node.w - w);
    const y = node.y + Phaser.Math.Between(0, node.h - h);
    const room = { x, y, w, h };
    this.rooms.push(room);
    for (let i = y; i < y + h; i++) {
      for (let j = x; j < x + w; j++) {
        this.map[i][j] = 1;
      }
    }
    return room;
  }

  _connect(a, b) {
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);
    if (Math.random() < 0.5) {
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        this.map[ay][x] = 1;
      }
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        this.map[y][bx] = 1;
      }
    } else {
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        this.map[y][ax] = 1;
      }
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        this.map[by][x] = 1;
      }
    }
  }
}

export default DungeonGenerator;
