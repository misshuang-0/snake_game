var gameBox = document.getElementsByClassName('gameBox')[0],            //游戏盒子，主要游戏场所，蛇和食物都在此内生成
    startBox = document.getElementsByClassName('startBox')[0],  //游戏开始盒子，包含了开始游戏等按钮菜单
    startBtn = startBox.getElementsByClassName('startBtn')[0],  //开始游戏按钮
    primary = startBox.getElementsByClassName('primary')[0],    //初级按钮
    middle = startBox.getElementsByClassName('middle')[0],      //中级按钮
    high = startBox.getElementsByClassName('high')[0],          //高级按钮
    pauseBox = document.getElementsByClassName('pauseBox')[0],  //暂停盒子，包含了暂停按钮和重新开始按钮
    getBack = pauseBox.getElementsByClassName('getBack')[0],    //重新开始按钮
    pauseBtn = pauseBox.getElementsByClassName('pauseBtn')[0];  //暂停按钮

        var sw = 20,    //一个方块的宽
            sh = 20,    //一个方块的高
            tr = 30,    //游戏行数
            td = 30;    //游戏列数

        //方块的构造函数，用来创建蛇头、蛇身、食物
        function Square(x, y, classname) {
            //x，y表示方块的坐标，classname表示给该方块的样式
            //传进来的参数乘以20得到该位置的坐标值
            this.x = x * sw;
            this.y = y * sh;
            this.classname = classname;

            //把小方块以div的形式创建一个dom元素
            this.squareDom = document.createElement('div');
            // 把传进来的样式赋值给该方块
            this.squareDom.className = this.classname;
            //方块的父级元素--gameBox
            this.parent = gameBox;
        }

        //创建方块dom方法,并添加到页面中
        Square.prototype.create = function () {
            this.squareDom.style.position = 'absolute';     // 给该元素一个绝对定位，方便控制方位
            this.squareDom.style.left = this.x + 'px';      //设置left
            this.squareDom.style.top = this.y + 'px';       //设置top
            this.squareDom.style.width = sw + 'px';         //该元素的宽
            this.squareDom.style.height = sh + 'px';        //该元素的高
            this.parent.appendChild(this.squareDom);        //添加到父元素当中去
        }
        //删除方块dom元素的方法
        Square.prototype.remove = function () {
            this.parent.removeChild(this.squareDom);        //父删子
        }
        //蛇
        function Snake() {
            this.head = null;      //存一下蛇头的信息
            this.tail = null;      //存一下蛇尾的信息
            this.pos = [];         //将蛇身上每一个部位的位置信息存入该数组

            //存储蛇走的方向
            this.directionNum = {
                left: {
                    x: -1,
                    y: 0,
                    rotate: 180     //蛇头的角度
                },
                right: {
                    x: 1,
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
            }
        }
        //初始化蛇
        Snake.prototype.init = function () {
            //创建一个蛇头,初始位置2,0
            var snakeHead = new Square(2, 0, 'snakeHead');
            this.head = snakeHead;  //存储蛇头信息
            this.pos.push([2, 0]);  //把蛇头位置存入数组
            snakeHead.create();     //把蛇头添加到页面当中

            //创建一个蛇身,初始位置1,0
            var snakeBody1 = new Square(1, 0, 'snakeBody');
            this.pos.push([1, 0]);  //把蛇身位置存入数组
            snakeBody1.create();    //把蛇身添加到页面当中

            //创建一个蛇尾,初始位置0,0
            var snakeBody2 = new Square(0, 0, 'snakeBody');
            this.tail = snakeBody2;     //存储蛇尾信息
            this.pos.push([0, 0]);      //把蛇尾位置存入数组
            snakeBody2.create();        //把蛇尾添加到页面当中

            //形成链表关系
            //蛇头
            snakeHead.last = null;
            snakeHead.next = snakeBody1;
            //蛇身
            snakeBody1.last = snakeHead;
            snakeBody1.next = snakeBody2;
            //蛇尾
            snakeBody2.last = snakeBody1;
            snakeBody2.next = null;

            //设置蛇默认走的方向为右
            this.direction = this.directionNum.right;
        }

        //获取蛇头的下一个位置的信息，根据不同的情况发生不同的事件
        Snake.prototype.getNextPoz = function () {
            //蛇头要走的下一个位置
            var nextPoz = [
                //蛇头在原有位置上 + 行走方向的x,y
                this.head.x / sw + this.direction.x,
                this.head.y / sh + this.direction.y,
            ];

            // 判断下一个点是什么（比对坐标）
            //1.下一个点是自己，表示撞到了自己，游戏结束
            var state = false;      //设置一个状态，如果撞到自己，值为true;
            //遍历数组pos的每一位，让其值与nextPozi的值做对比
            this.pos.forEach(function (e) {
                // 如果与pos某个点完全重合，证明撞到自己
                if (nextPoz[0] == e[0] && nextPoz[1] == e[1]) {
                    state = true;       //状态为true
                }
            })
            // 如果撞到自己，执行游戏结束函数
            if (state) {
                // console.log('撞到自己');
                this.methods.die.call(this);    //.call方法将this指向括号内的this。即蛇的实例对象this
                return;
            }

            //2.下一个点是墙，游戏结束
            if (nextPoz[0] < 0 || nextPoz[0] > td - 1 || nextPoz[1] < 0 || nextPoz[1] > tr - 1) {
                // console.log('撞到墙');
                this.methods.die.call(this);
                return;
            }

            //下个点是食物，吃并走
            if(nextPoz[0] == food.x/sw && nextPoz[1] == food.y/sh){
                this.methods.eat.call(this);
                return;
            }

            //以上都不是  走
            this.methods.move.call(this);
        }

        //创建一个方法对象，处理碰撞后要做的不同的事，包含：走、吃、死
        Snake.prototype.methods = {
            // 走
            move: function (hasFood) {  //该参数用于判断是否删除蛇尾，有食物=吃，没有即删除蛇尾
                //创建一个新身体，在旧蛇头的位置
                var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
                //创建新的链表关系
                newBody.next = this.head.next;  //通过旧蛇头的next找到它的next
                newBody.next.last = newBody;
                this.head.remove();     //把旧蛇头删除
                newBody.create();       //创建新的身体

                //创建一个新蛇头，位置是nextPozi的位置
                var newHead = new Square(this.head.x / sw + this.direction.x,
                                         this.head.y / sh + this.direction.y, 'snakeHead');
                // 创建新的链表关系
                newHead.last = null;
                newHead.next = newBody;
                newBody.last = newHead;
                // 调整蛇头的角度
                newHead.squareDom.style.transform = 'rotate('+this.direction.rotate+'deg)'
                //创建新的蛇头
                newHead.create();
                // 更新蛇头信息
                this.head = newHead;
                //更新蛇身数组的信息
                this.pos.splice(0, 0, [newHead.x / sw, newHead.y / sh]);

                // 如果下一步不是食物，删除蛇尾
                if (!hasFood) {
                    this.tail.remove();
                    this.tail = this.tail.last; //更新蛇尾信息
                    this.pos.pop();     //删除蛇身数组最后一位
                }
            },
            // 吃
            eat: function () {
                // 调用走的方法，并传参true，代表存在食物，不用删除蛇尾
                this.methods.move.call(this, true);
                createFood();   //创建食物
                game.score ++;  //得分加1
            },
            // 死
            die: function () {
                // 游戏结束
                game.over();
            }
        }
        // 创建蛇的实例对象
        var snake = new Snake();
        

        // 创建一个变量food，用于存放食物的实例对象
        var food;

        //食物创建方法
        function createFood() {
            // 食物的随机坐标
            var x, y;

            //循环跳出的条件，true表示食物的坐标在蛇身上，继续循环，反之停止循环。
            var include = true;
            while (include) {
                x = Math.round(Math.random() * (td - 1));
                y = Math.round(Math.random() * (tr - 1));
                // 遍历蛇身每一个位置，与随机生成的坐标进行对比
                snake.pos.forEach(function (item) {
                    // 如果没有重合的部分
                    if (item[0] != x || item[1] != y) {
                        include = false;    //状态改为false，跳出循环
                    }
                })
            }
            // 创建食物实例
            food = new Square(x,y,'food');
            // 通过获取页面食物dom元素，来判断页面是否已经存在食物了
            var foodDom = document.getElementsByClassName('food')[0];
            // 如果已经存在
            if(foodDom){
                // 改变食物的坐标即可
                foodDom.style.left = x*sw + 'px';
                foodDom.style.top = y*sh + 'px';
            }else{
                // 反之，生成一个食物
                food.create();
            }
        }

        // 游戏逻辑
        function Game(){
            this.time;          //定时器，控制蛇的行走
            this.score = 0;     //得分
            this.n;             //蛇的行走速度
        }
        // 游戏初始化
        Game.prototype.init = function(n){
            snake.init();   //初始化蛇
            createFood();   //创建食物

            // 键盘控制蛇头方向
            document.onkeydown = function(e){
                // e.which = 37  朝左  此时蛇头不能是往右的
                if(e.which == 37 && snake.direction != snake.directionNum.right){
                    snake.direction = snake.directionNum.left;
                // e.which = 38  朝上  此时蛇头不能是往下的
                }else if(e.which == 38 && snake.direction != snake.directionNum.down){
                    snake.direction = snake.directionNum.up;
                // e.which = 39  朝右  此时蛇头不能是往左的
                }else if(e.which == 39 && snake.direction != snake.directionNum.left){
                    snake.direction = snake.directionNum.right;
                // e.which = 40  朝下  此时蛇头不能是往上的
                }else if(e.which == 40 && snake.direction != snake.directionNum.up){
                    snake.direction = snake.directionNum.down;
                }
            }
            // 游戏开始
            this.start();
        
        }
        // 开始游戏函数
        Game.prototype.start = function(){
            // 设置定时器，每隔 n 毫秒执行一次
            this.time = setInterval(()=>{
                // 蛇身前进
                snake.getNextPoz();
            },this.n)   // 默认是初始速度
        }
        // 游戏结束函数
        Game.prototype.over = function(){
            // 清楚定时器
            clearInterval(this.time);
            // 弹出得分
            alert('你的得分是：'+ this.score);

            // 清空 gameBox 内的dom结构
            gameBox.innerHTML = '';
            // 获取一个新的蛇实例对象
            snake = new Snake();
            // 获取一个新的游戏实例对象
            game = new Game();
            // 开始游戏盒子显示出来
            startBox.style.display = 'block';
        }
        
        // 游戏实例对象
        var game = new Game();

        // 让游戏跑起来，并隐藏开始盒子
        function runGame(n){
            game.n = n;     // 设置游戏速度
            game.init();    //游戏初始化
            startBox.style.display = 'none';    //开始游戏盒子隐藏
        }
        
        //开始按钮，开始游戏
        startBtn.onclick = function(){
            runGame(200);   //游戏初始速度  同中级速度
        };
        //初级
        primary.onclick = function(){
            runGame(500);   //初级速度
        }
        //中级
        middle.onclick = function(){
            runGame(200);   //中级速度   
        }
        //高级
        high.onclick = function(){
            runGame(70);   //高级速度
        }

        //暂停游戏
        gameBox.onclick = function(){
            // 清楚定时器
            clearInterval(game.time);
            // 暂停盒子显示
            pauseBox.style.display = 'block';
        };
        //继续开始
        pauseBtn.onclick = function (){
            // 游戏开始
            game.start();
            // 暂停盒子隐藏
            pauseBox.style.display = 'none';
        }
        //重新开始
        getBack.onclick = function(){
            // 清空 gameBox 内部 dom 结构
            gameBox.innerHTML = '';
            // 初始化蛇
            snake = new Snake();
            // 初始化游戏
            game = new Game();
            // 暂停盒子隐藏
            pauseBox.style.display = 'none';
            // 开始游戏盒子显示
            startBox.style.display = 'block';
        }
