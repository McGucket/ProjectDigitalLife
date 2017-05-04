/**
 * Created by Eli on 24.04.2017
 */

(function () {
    'use strict';
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    const step = 30;

    var point = [];
    var walls = [];
    var stones = [];
    var plants = [];
    var plantEaters = [];

    function randomInt(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }

    var directions = ['n', 'w', 'e', 's'];

    function changeDirection(object, direction) {
        switch (direction) {
            case 'n': object.y -= step; break;
            case 'w': object.x -= step; break;
            case 'e': object.x += step; break;
            case 's': object.y += step; break;
        }
        return object;
    }

    (function buildGrid() {
        for (var i = 0; i < 20; i++) {
            point.push(i * step);
        }
    })();

    function randomPoint(){
        return point[randomInt(1, point.length - 2)];
    }

    (function createWall() {
        for (var i = 0; i < 20; i++) {
            walls.push(new GameObject(point[i], point[0], step, step, '#a723f7'));
            walls.push(new GameObject(point[point.length - 1], point[i], step, step, '#a723f7'));
            walls.push(new GameObject(point[i], point[point.length - 1], step, step, '#a723f7'));
            walls.push(new GameObject(point[0], point[i], step, step, '#a723f7'));
        }
    })();

    (function createStone() {
        for (var i = 0; i < 18; i++) {
            stones.push(new GameObject(randomPoint(), randomPoint(), step, step, '#eee'));
        }
    })();

    var employedFields = walls.slice();
    stones.forEach(function (item) { employedFields.push(item); });

    function checkCollision(object) {
        var freeDirections = directions.slice();

        employedFields.forEach(function (item) {
            if (item.x === object.x && item.y === object.y - step)
                freeDirections.splice(freeDirections.indexOf('n'), 1);
            if (item.x === object.x - step && item.y === object.y)
                freeDirections.splice(freeDirections.indexOf('w'), 1);
            if (item.x === object.x + step && item.y === object.y)
                freeDirections.splice(freeDirections.indexOf('e'), 1);
            if (item.x === object.x && item.y === object.y + step)
                freeDirections.splice(freeDirections.indexOf('s'), 1);
        });

        object.direction = freeDirections[randomInt(0, freeDirections.length)];
        return object;
    }

    function canEat(object) {
        plants.forEach(function (item) {
            if (item.x === object.x && item.y === object.y) {
                object.canEat = true;
                item.eaten = true;
            } else {
                object.canEat = false;
                item.eaten = false;
            }
        });
        return object;
    }

    function GameObject(x, y, h, w, color) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.color = color;
    }

    function Plant(x, y, h, w, color, lifeTime, direction, eaten) {
        GameObject.apply(this, arguments);
        this.lifeTime = lifeTime;
        this.direction = direction;
        this.eaten = eaten;
    }

    Plant.prototype.grow = function() {
        plants.push(new Plant(this.x, this.y, step, step, '#37fa19', 0, 's', false));
        checkCollision(this);
        changeDirection(this, this.direction);
    };

    function PlantEater(x, y, h, w, color, lifeTime, direction, canEat) {
        GameObject.apply(this, arguments);
        this.lifeTime = lifeTime;
        this.direction = direction;
        this.canEat = canEat;
    }

    PlantEater.prototype.move = function() {
        checkCollision(this);
        changeDirection(this, this.direction);
        this.lifeTime -= 0.5;
    };

    PlantEater.prototype.eat = function() {
        canEat(this);
        if (this.canEat === true) this.lifeTime += 1;
    };

    function createPlant() {
        plants.push(new Plant(randomPoint(), randomPoint(), step, step, '#37fa19', 0, 's', false));
    }

    function createPlantEater() {
        plantEaters.push(new PlantEater(randomPoint(), randomPoint(), step, step, '#55a3f1', 35, 's', false));
    }

    for (var i = 0; i < 6; i++) {
        createPlant();
        createPlantEater();
    }

    function draw() {
        walls.forEach(function (item) {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.w, item.h);
        });
        stones.forEach(function (item) {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.w, item.h);
        });
        plants.forEach(function (item) {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.w, item.h);
        });
        plantEaters.forEach(function (item) {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.w, item.h);
        });
    }

    function erase(value) {
        ctx.clearRect(value.x, value.y, value.w, value.h);
    }

    function plantsCycle() {
        plants.forEach(function (item, index) {
            item.lifeTime += 1;
            if (item.lifeTime === 25) item.grow();
            if (item.eaten === true) {
                erase(item);
                plants.splice(index, 1);
            }
        });
    }

    function plantEatersCycle() {
        plantEaters.forEach(function (item, index) {
            if (item.lifeTime > 0) {
                erase(item);
                item.move();
                item.eat();
            } else {
                erase(item);
                plantEaters.splice(index, 1);
            }
        });
    }

    function World() {
        plantEatersCycle();
        plantsCycle();
        draw();
    }

    (function animateWorld() {
        var timerId = setTimeout(function tick() {
            World();
            timerId = setTimeout(tick, 300);
        });
    })();

})();