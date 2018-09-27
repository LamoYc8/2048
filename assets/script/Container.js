
cc.Class({
    extends: cc.Component,

    properties: {
        cell: {
            default: null,
            type: cc.Prefab
        },

        grid: {
            default: [],
            type: [cc.Array]
        },

        gameOverDia: {
            default: null,
            type: cc.Prefab
        },

        canvas: {
            default: null,
            type: cc.Node
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        //构造格子显示在 browser
        this.gridSize = 16;
        this.spawnGrids(this.gridSize / 4);

        //初始化游戏逻辑
        this.initGridValue();

        //刷新所有格子显示内容
        this.updateDisplay();
        
        //初始化分数计数和显示
        this.score = 0;
        this.canvas.getComponent('2048').scoreDisplay.string = 'Score: ' + this.score.toString();

        //游戏运行开始
        this.setInputControl();
    },

    //New Game 按钮，重新开始一个新游戏
    clickNewGameButton: function () {

        this.initGridValue();
        this.score = 0;
        this.updateDisplay();
        this.canvas.getComponent('2048').scoreDisplay.string = 'Score: ' + this.score.toString();


    },

    //监听所有触摸事件，实现所有指令任务
    setInputControl: function () {

        let self = this;
        self.flipped = false;
        self.rotated = false;
        self.played = true;

        //键盘监听用户输入，用于测试游戏逻辑正确性
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            switch (event.keyCode) {
                case cc.KEY.down:
                    self.rotateGrid(self.grid);
                    self.rotated = true;
                    self.keyPressed();
                    break;

                case cc.KEY.up:
                    self.rotateGrid(self.grid);
                    self.flipGrid(self.grid);
                    self.flipped = true;
                    self.rotated = true;
                    self.keyPressed();
                    break;


                case cc.KEY.left:
                    self.flipGrid(self.grid);
                    self.flipped = true;
                    self.keyPressed();
                    break;


                case cc.KEY.right:
                    self.keyPressed();
                    break;
            }
        });

        //监听触摸起始点
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.p1 = event.getLocation();
        });

        //监听触摸结束点，执行相应逻辑
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.p2 = event.getLocation();

            //起始和终止触摸点在x轴和y轴移动的距离，坐标原点在屏幕左下角
            self.difX = Math.abs(self.p2.x - self.p1.x);
            self.difY = Math.abs(self.p2.y - self.p1.y);
            self.hypoDist = Math.sqrt(self.difX * self.difX + self.difY * self.difY);

            //大方向向右滑动
            if (self.p2.x > self.p1.x && self.difY < Math.sin(45) * self.hypoDist) {
                self.keyPressed();
                return;
            }

            //大方向向左滑动
            else if (self.p2.x < self.p1.x && self.difY < Math.sin(45) * self.hypoDist) {
                self.flipGrid(self.grid);
                self.flipped = true;
                self.keyPressed();
                return;
            }

            //大方向向上滑动
            else if (self.p2.y > self.p1.y && self.difX < Math.sin(45) * self.hypoDist) {
                self.rotateGrid(self.grid);
                self.flipGrid(self.grid);
                self.flipped = true;
                self.rotated = true;
                self.keyPressed();
                return;
            }

            //大方向向下滑动
            else if (self.p2.y < self.p1.y && self.difX < Math.sin(45) * self.hypoDist) {
                self.rotateGrid(self.grid);
                self.rotated = true;
                self.keyPressed();
                return;
            }
        });
    },

    //生成一个4*4的2维数组，每个元素的值为0，返回这个2维数组
    blankGrid: function () {
        let extra = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        return extra;
    },

    //初始化游戏时初始化16个格子的值
    initGridValue: function () {
        //初始化每个小格子的具体数值
        //this.grid 存储16个小格子的数值
        this.grid = this.blankGrid();

        //在随机两个位置上随机放置2或4
        this.addNumber();
        this.addNumber();
    },

    //构造显示在浏览器中的游戏主体16个方格
    spawnGrids: function (cellSize) {

        this.gridArray = new Array(cellSize);

        for (let i = 0; i < this.gridArray.length; i++) {
            this.gridArray[i] = new Array(cellSize);
            for (let j = 0; j < this.gridArray[i].length; j++) {
                this.gridArray[i][j] = cc.instantiate(this.cell);
                this.gridArray[i][j].parent = this.node;
                this.gridArray[i][j].width = (this.node.width - 50) / 4;
                this.gridArray[i][j].height = (this.node.height - 50) / 4;
            }
        }
    },

    //选择一个任意位置以50%概率放入2或4
    addNumber: function () {
        let options = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {

                    //objects
                    options.push({
                        x: i,
                        y: j
                    });
                }
            }
        }
        if (options.length > 0) {
            let spot = Math.floor(Math.random() * options.length);
            let r = Math.random();
            this.grid[options[spot].x][options[spot].y] = r > 0.5 ? 2 : 4;
            //添加动画效果
            let animationC = this.gridArray[options[spot].x][options[spot].y].getComponent(cc.Animation);
            animationC.play('initGrid');

        }


    },

    //游戏逻辑执行一次
    keyPressed: function () {

        //复制当前状态下的 this.grid
        let past = this.copyGrid(this.grid);
        
        //执行一维数组合并和位移逻辑
        for (let i = 0; i < 4; i++) {
            this.grid[i] = this.operate(this.grid[i]);
        }

        //复原颠倒顺序的数组
        if (this.flipped) {
            this.flipGrid(this.grid);
            this.flipped = false;
        }
        
        //复原转置的数组
        if (this.rotated) {
            this.rotateGrid(this.grid);
            this.rotated = false;
        }

        //检测数组是否发生变化
        let changed = this.compare(past, this.grid);
        if (changed) {
            this.addNumber();
        }
        
        //检测游戏结束逻辑
        let gameOver = this.isGameOver();

        if (gameOver) {
            console.log('Game Over');
            //弹出游戏结束对话框
            this.gameOver();
        }
        
        this.updateDisplay();

    },

    //颠倒2维数组中每一个子数组的内部顺序
    //参数为整个2维数组
    flipGrid: function (grid) {
        for (let i = 0; i < 4; i++) {
            grid[i].reverse();
        }
    },

    //转置2维数组
    //参数为整个2维数组
    rotateGrid: function (grid) {
        let copiedArray = this.copyGrid(grid);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                grid[i][j] = copiedArray[j][i];
            }
        }
    },

    //复制2维数组的每一元素
    //参数为整个2维数组
    //返回一个新的二维数组
    copyGrid: function (grid) {
        let extra = this.blankGrid();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                extra[i][j] = grid[i][j];
            }
        }
        return extra;
    },

    //执行一维数组合并和位移逻辑
    //参数为一维数组
    //返回一个新的一维数组
    operate: function (row) {
        row = this.slide(row);
        row = this.combine(row);
        row = this.slide(row);
        return row;
    },

    //将一维数组中所有非0元素按照原来顺序滑到数组末尾，原始位子由0填充
    //参数为一维数组
    //返回修改后的一维数组
    slide: function (row) {
        //let arr = row.filter(val => val);
        let arr = row.filter(function (value) {
            if (value !== 0)
                return value;
        });
        let missing = 4 - arr.length;
        let zeros = Array(missing).fill(0);
        arr = zeros.concat(arr);
        return arr;
    },

    //一维数组中从末尾开始，相邻的前一个数字相同合并成为一个放置到当前位置，前一个设为0
    //参数为一维数组
    //返回修改后的一维数组
    combine: function (row) {
        for (let i = 3; i >= 0; i--) {
            let a = row[i];
            let b = row[i - 1];
            if (a === b) {
                row[i] = a + b;
                //游戏分数和分数显示同步变化
                this.score += row[i];
                this.canvas.getComponent('2048').scoreDisplay.string = 'Score: ' + this.score.toString();
                row[i - 1] = 0;
            }
        }
        return row;
    },

    //比较两个二维数组的元素
    //参数为两个二维数组
    //相同返回ture,反之false
    compare: function (a, b) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (a[i][j] !== b[i][j]) {
                    return true;
                }
            }
        }
        return false;
    },

    //弹出游戏结束对话框
    gameOver: function () {
        let gameOverDiaglog = cc.instantiate(this.gameOverDia);
        gameOverDiaglog.setPosition(17, -21);
        cc.find('Canvas').addChild(gameOverDiaglog, 1, 1001);

    },

    //判断游戏是否结束
    //结束返回true,反之false
    isGameOver: function () {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] == 0) {
                    return false;
                } 
                
                if (i !== 3 && this.grid[i][j] == this.grid[i + 1][j]) {
                    return false;
                }
                if (j !== 3 && this.grid[i][j] == this.grid[i][j + 1]) {
                    return false;
                }
            }
        }
        return true;
    },

    //根据this.grid元素的变化，更新游戏显示
    updateDisplay: function () {
        var self = this;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let val = this.grid[i][j];
                if (this.grid[i][j] !== 0) {
                    //obtain the number which will be displayed on the browser  
                    this.gridArray[i][j].getComponent('Grid').numberDisplay.string = val.toString();

                    //add color feature to the grids which of the values are not equal to 0
                    this.readJSON(val, function (colorStr) {
                        self.gridArray[i][j].color = cc.hexToColor(colorStr);
                    });
                } else {
                    this.gridArray[i][j].getComponent('Grid').numberDisplay.string = '';
                    this.gridArray[i][j].color = cc.hexToColor('#FFFFFF');
                }
            }
        }

    },

    //读取存储在配置文件中的颜色信息
    //参数分别为整数，回调函数
    readJSON: function (value, callback) {
        //apply JSON to store all the color infor into another file
        cc.loader.loadRes('config.json', function (err, gridColor) {
            if (err) {
                console.log(err);
                return;
            }
            let valueString = value.toString();
            let returnColor = gridColor[valueString].color;

            if (callback) {
                callback(returnColor);
            }
        });
    },

});
