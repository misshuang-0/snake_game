var sw = 20,    //一个方块的宽
    sh = 20,    //一个方块的高
    tr = 30,    //行数
    td = 30;    //列数

// var snake = null;   //蛇的实例
var snake,   //蛇的实例
    food,   //食物的实例
    game,   //游戏的实例
    n = 100;      //蛇跑的速度

//方块的构造函数，用来创建蛇头、蛇身、食物
function Square(x, y, classname) {
    //xy表示方块的坐标，classname表示给该方块的样式
    this.x = x * sw;    //传进来的参数乘以20得到该位置的坐标值
    this.y = y * sw;
    this.class = classname;

    //把小方块以div的形式创建一个dom元素
    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    //方块的父级元素
    this.parent = document.getElementById('snakeWrap');

    //创建方块dom方法,并添加到页面中
    this.creat = function () {
        this.viewContent.style.position = 'absolute';
        this.viewContent.style.width = sw + 'px';
        this.viewContent.style.height = sh + 'px';
        this.viewContent.style.left = this.x + 'px';
        this.viewContent.style.top = this.y + 'px';

        this.parent.appendChild(this.viewContent);
    }

    //删除方块dom元素的方法
    this.remove = function () {
        this.parent.removeChild(this.viewContent);
    }
}

//蛇的构造函数
function Snake() {
    // this.head = null;   //存一下蛇头的信息
    this.head;   //存一下蛇头的信息
    this.tail;   //存一下蛇尾的信息
    this.pos = [];  //将蛇身上每一个部位的位置信息存入数组

    //存储蛇走的方向
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 180  //蛇头的角度
        },
        right: {
            x: +1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    };
    //初始化
    this.init = function () {
        //创建一个蛇头
        var snakeHead = new Square(2, 0, 'snakeHead');
        //把蛇头添加到页面当中
        snakeHead.creat();
        //存储蛇头信息
        this.head = snakeHead;
        //把蛇头位置存入数组
        this.pos.push([2, 0]);

        //创建一个蛇身
        var snakeBody1 = new Square(1, 0, 'snakeBody');
        //把蛇身添加到页面当中
        snakeBody1.creat();
        //把蛇身位置存入数组
        this.pos.push([1, 0]);

        //创建一个蛇尾
        var snakeBody2 = new Square(0, 0, 'snakeBody');
        //把蛇尾添加到页面当中
        snakeBody2.creat();
        //存储蛇尾信息
        this.tail = snakeBody2;
        //把蛇尾位置存入数组
        this.pos.push([0, 0]);

        //形成链表关系
        //蛇头
        snakeHead.last = null;
        snakeHead.next = snakeBody1;
        //蛇身
        snakeBody1.last = snakeHead;
        snakeBody1.next = snakeBody2;
        //蛇尾
        snakeBody2.last = snakeBody1;
        snakeBody1.next = null;

        //给蛇添加一条属性，设置蛇默认走的方向为右
        this.direction = this.directionNum.right;
    };

    //这个方法用来获取蛇头的下一个位置的信息，根据不同的情况发生不同的事件
    this.nextPozi = function () {
        //蛇头要走的下一个位置
        var nextPozi = [
            this.head.x/sw + this.direction.x,
            this.head.y/sh + this.direction.y];

        // 判断下一个点是什么（比对坐标）
        //1.下一个点是自己，表示撞到了自己，游戏结束
        var state = false;  //设置一个状态，如果撞到自己，值为true;
        //遍历数组pos的每一位，让其值与nextPozi的值做对比
        this.pos.forEach(function (e) {
            if (nextPozi[0] == e[0] && nextPozi[1] == e[1]) {
                state = true;
            }
        })
        if (state) {
            this.strategies.die.call(this);
        }

        //2.下一个点是墙，游戏结束
        if (nextPozi[0] < 0 || nextPozi[0] > tr - 1 || nextPozi[1] < 0 || nextPozi[1] > td - 1) {
            this.strategies.die.call(this);
            return;
        }

        //3.下一个点是食物，吃
        if (food && food.pos[0] == nextPozi[0] && food.pos[1] == nextPozi[1]) {
            this.strategies.eat.call(this);
            return;
        }

        //4.都不是，继续走
        this.strategies.move.call(this);
    };

    //创建一个方法对象，处理碰撞后要做的不同的事
    this.strategies = {
        //走
        move: function (hasFood) {   //该参数用于判断是否删除蛇尾，有食物=吃，没有即删除最后一个
            //创建一个新身体，在旧蛇头的位置
            var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody');
            //创建新的链表关系
            newBody.last = null;
            newBody.next = this.head.next;  //通过head找到它的next
            newBody.next.last = newBody;
            //把旧蛇头删除
            this.head.remove();
            //创建新的身体
            newBody.creat();


            //创建一个新蛇头，位置是nextPozi的位置
            var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
            // 创建新的链表关系
            newHead.last = null;
            newHead.next = newBody;
            newBody.last = newHead;

            //调整蛇头的角度
            newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
            //创建新的蛇头
            newHead.creat();
            //更新蛇身数组的信息
            this.pos.splice(0, 0, [newHead.x / sw, newHead.y / sh]);
            this.head = newHead;   //更新this.head的信息

            //删除蛇尾
            if (!hasFood) {
                this.tail.remove();
                //更新链表管件
                this.tail = this.tail.last;
                this.tail.next = null;
                this.pos.pop();
            }
        },
        //吃
        eat: function () {
            this.strategies.move.call(this, true);
            creatFood();
            game.score++;
        },
        //游戏结束
        die: function () {
            game.over();
        }
    };
}

//new一个蛇的身体出来
snake = new Snake();

function creatFood() {
    //食物的随机坐标
    var x,
        y,
        include = true;   //循环跳出的条件，true表示食物的坐标在蛇身上，继续循环，反之停止循环。

        
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.pos.forEach(function (e) {
            //判断蛇身的数组里的每一位是否有值和食物的坐标值相同的
            if (x != e[0] && y != e[1]) {
                include = false;
            }
        })
    }

    //生成食物
    food = new Square(x, y, 'food');
    //存储食物的坐标，用于跟蛇头的下一个坐标做对比
    food.pos = [x, y];

    //判断是否有食物，如果有，改变它的坐标值，没有就新建一个
    var foodDom = document.getElementsByClassName('food')[0];
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.creat();
    }
    console.log(snake.pos);
    console.log(foodDom)
}

//创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;

    //初始方法
    this.init = function () {
        snake.init();
        creatFood();
        document.onkeydown = function (e) {
            //当用户按下左键，并且当时蛇没有朝右走的时候
            if (e.which == 37 && snake.direction != snake.directionNum.right) {
                snake.direction = snake.directionNum.left;
            }
            else if (e.which == 38 && snake.direction != snake.directionNum.down) {
                snake.direction = snake.directionNum.up;
            }
            else if (e.which == 39 && snake.direction != snake.directionNum.left) {
                snake.direction = snake.directionNum.right;
            }
            else if (e.which == 40 && snake.direction != snake.directionNum.up) {
                snake.direction = snake.directionNum.down;
            };
        };
        this.start();
    };

    //开始游戏
    this.start = function () {
        this.timer = setInterval(function () {
            snake.nextPozi();
        }, n);
    }

    //游戏结束
    this.over = function () {
        clearInterval(this.timer);
        alert('你的得分为：' + this.score);

        //游戏回到初始状态
        var snakeWrap = document.getElementById('snakeWrap');
        snakeWrap.innerHTML = '';   //清空snakeWrap的html结构
        snake = new Snake();        //把snake（蛇）还到初始状态
        game = new Game();          //把game（游戏）还到初始状态
        startBtn.parentNode.style.display = 'block';  //显示开始游戏界面
    }
}

//开启游戏
game = new Game();
var startBtn = document.getElementsByClassName('startBtn')[0].getElementsByTagName('button')[0];
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
}

//暂停
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.getElementsByClassName('pauseBtn')[0].getElementsByTagName('button')[0];

//点击容器暂停
snakeWrap.onclick = function () {
        pauseBtn.parentNode.style.display = 'block';
        clearInterval(game.timer);
}
//点击暂停按钮界面开始
pauseBtn.parentNode.onclick = function() {
    pauseBtn.parentNode.style.display = 'none';
    game.start();
}