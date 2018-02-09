'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {

    if (vector instanceof Vector) {
      return new Vector(vector.x + this.x, vector.y + this.y);
    }
    // если if заканчивается на return, то else можно не писать
    else {
      // лучше проверить аргументы в начале и выбросить ошибку, ытобы дальше шёл основной код
      throw Error('Можно прибавлять к вектору только вектор типа Vector');
    }
  }

  // можно добавить значение по-умолчанию = 1
  times(number) {
    return new Vector(this.x * number, this.y * number);
  }
}

class Actor {
  // можно добавить значения по-умолчанию для аргументов
  constructor(position, size, speed) {
    // проверка (position) и остальные такие же лишние, т.к. undefined instanceof Vector === false
    if (((position) && (!(position instanceof Vector))) || ((size) && (!(size instanceof Vector))) || ((speed) && (!(speed instanceof Vector)))) {
      throw Error('В качестве аргумента передан не вектор типа Vector');
    }
    // лишняя проверка
    if (position instanceof Vector) {
      this.pos = position;
    }
    // лучше ука0зать значение по-умолчанию
    if (position === undefined) {
      this.pos = new Vector(0, 0);
    }

    // ниже аналогично

    if (size instanceof Vector) {
      this.size = size;
    }
    if (size === undefined) {
      this.size = new Vector(1, 1);
    }
    if (speed instanceof Vector) {
      this.speed = speed;
    }
    if (speed === undefined) {
      this.speed = new Vector(0, 0);
    }

  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  act() {

  }

  isIntersect(actor) {
    if (actor === this) {
      return false;
    }
    // else лишний, вторая часть проверки лишняя
    else if ((actor instanceof Actor) && (actor !== this)) {
      return ((this.left < actor.right) && (this.right > actor.left) && (this.top < actor.bottom) && (this.bottom > actor.top));
    }
    else {
      // проверять переданные аргументы лучше в начале функции
      throw Error('Ошибка при передаче аргумента');
    }
  }
}

class Level {
  constructor(playgroundGrid = [], actorArray = []) {
    // лучше создать копии массивов, чтобы нельзя было изменить поля объекта извне
    this.grid = playgroundGrid;
    this.actors = actorArray;
    this.player = this.actors.find(el => el.type === 'player');
    // лишняя проверка
    this.height = (this.grid === undefined) ? 0 : this.grid.length;
    // лучше использоват стрелочную функцию
    // вместо .apply можно использовать оператор "..." для передачи массива в качестве параметров
    this.width = this.height > 0 ? Math.max.apply(Math, this.grid.map(function (el) {
      return el.length;
    })) : 0;
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    // можно убрать if и написать просто return ...
    if ((this.status !== null) && (this.finishDelay < 0)) {
      return true;
    }
    return false;
  }

  actorAt(actor) {
    // вторая часть проверки лишняя, да и первую я бы тоже опутил
    if (!(actor instanceof Actor) || (!actor)) {
      throw Error('Ошибка при передаче аргумента');
    }
    return this.actors.find(el => el.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector) && !(size instanceof Vector)) {
      throw Error('Ошибка при передаче аргумента');
    }


    let left = Math.floor(position.x);
    let right = Math.ceil(position.x + size.x);
    let top = Math.floor(position.y);
    let bottom = Math.ceil(position.y + size.y);


    if (right > this.width || left < 0 || top < 0) {
      return 'wall';
    }
    else if (bottom > this.height) {
      return 'lava';
    }

    for (let i = top; i < bottom; i++) {
      for (let k = left; k < right; k++) {
        // this.grid[i][k] лучше сохранить в переменную
        if (this.grid[i][k]) {
          return this.grid[i][k];
        }
      }
    }

  }

  removeActor(actor) {
    // лучше использовать стрелочную функцию
    const index = this.actors.findIndex(function (el) {
      return el === actor;
    });
    // а если не нашли?
    this.actors.splice(index, 1);
  }

  noMoreActors(type) {
    // здесь пишется в одну строчку с помощью метода some
    const element = this.actors.find(function (el) {
      return el.type === type;
    });

    if (element) {
      return false;
    } else {
      return true;
    }
  }

  playerTouched(obstacle, actor) {
    if (this.status !== null) {
      return;
    }
    if ((obstacle === 'lava') || (obstacle === 'fireball')) {
      this.status = 'lost';
    }
    else if ((obstacle === 'coin') && (actor.type === 'coin')) {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }

  }

}

class LevelParser {
  constructor(dictionary = {}) {
    // лучше создать копию объекта
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    else if (symbol === '!') {
      return 'lava';
    }
    else {
      // лишний код
      return undefined;
    }
  }


  createGrid(plan) {
    let grid = [];
    // можно написать проще с помощь map
    for (let i = 0; i < plan.length; i++) {
      let elem = plan[i];
      let gridLine = [];
      for (let k = 0; k < elem.length; k++) {
        gridLine.push(this.obstacleFromSymbol(elem[k]));
      }
      grid.push(gridLine);
    }
    return grid;
  }


  createActors(plan) {
    let objects = [];
    // можно написать с помощью reduce
    for (let i = 0; i < plan.length; i++) {
      let elem = plan[i];
      for (let k = 0; k < elem.length; k++) {
        let Constr = this.actorFromSymbol(elem[k]);
        if ((Constr !== undefined) && (typeof Constr === 'function')) {
          let obj = new Constr(new Vector(k, i));
          if (obj instanceof Actor) {
            objects.push(obj);
          }
        }
      }
    }
    return objects;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }

}

class Fireball extends Actor {
  constructor(position = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.speed = speed;
    this.size = new Vector(1, 1);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    // странный код, что будет если придёт 0?
    let Speed;
    if (time) {
      Speed = this.speed.times(time);
    }
    return this.pos.plus(Speed);
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPos = this.getNextPosition(time);
    const obstacle = level.obstacleAt(nextPos, this.size);
    if (obstacle === undefined) {
      this.pos = nextPos;
    } else {
      this.handleObstacle();
    }
  }

}

class HorizontalFireball extends Fireball {
  // можно добавить значение аргумента по-умолчанию
  constructor(position) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.speed = new Vector(2, 0);
    // должно задаваться через конструктор базового класса
    this.size = new Vector(1, 1);
  }
}

class VerticalFireball extends Fireball {
  // можно добавить значение аргумента по-умолчанию
  constructor(position) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.speed = new Vector(0, 2);
    // должно задаваться через конструктор базового класса
    this.size = new Vector(1, 1);
  }
}

class FireRain extends Fireball {
  // можно добавить значение аргумента по-умолчанию
  constructor(position) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.speed = new Vector(0, 3);
    // должно задаваться через конструктор базового класса
    this.size = new Vector(1, 1);
    this.initialpos = position;
  }

  handleObstacle() {
    this.pos = this.initialpos;
  }
}

class Coin extends Actor {
  // можно добавить значение аргумента по-умолчанию
  constructor(position) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.size = new Vector(0.6, 0.6);
    // должно задаваться через конструктор базового класса
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
    this.initialpos = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (2 * Math.PI);
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.initialpos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  // можно добавить значение аргумента по-умолчаню
  constructor(position) {
    super(position);
    // должно задаваться через конструктор базового класса
    this.pos = this.pos.plus(new Vector(0, -0.5));
    // должно задаваться через конструктор базового класса
    this.size = new Vector(0.8, 1.5);
    // должно задаваться через конструктор базового класса
    this.speed = new Vector(0, 0);
  }

  get type() {
    return 'player';
  }
}


const schemas = loadLevels();

const actorDict = {
  '@': Player,
  '=': HorizontalFireball,
  'x': 'wall',  // этого не должно быть
  '!': 'lava',  // тут
  'o': Coin,
  '|': VerticalFireball,
  'v': FireRain
};

let parser = new LevelParser(actorDict);
schemas.then(result => {
  runGame(JSON.parse(result), parser, DOMDisplay)
}).then(() => console.log('Вы выиграли приз!'));