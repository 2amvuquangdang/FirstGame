import {_decorator, CCInteger, Component, instantiate, Label, math, Node, Prefab, Vec3} from 'cc';
import {PlayerController} from "./PlayerController";

const {ccclass, property} = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {
    // property: Khai báo để hiện ra màn hình editor giống Serierlafield bên Unity
    @property({type: Prefab})
    public cubePrefabs: Prefab;

    @property({type: Number})
    public roadLength: Number = 100;

    @property({type: Label})
    public stepsLabel: Label;

    private _road: number[] = [];

    private _curState: GameState = GameState.GS_INIT;

    @property({type: PlayerController})
    public playerCtrl: PlayerController = null;

    @property({type: Node})
    public startMenu: Node = null;

    start() {
        this.generateRoad();
        this._curState = GameState.GS_INIT;
        // ....
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);

    }
    //Khởi tạo game
    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
        }

        //Reset game
        this.playerCtrl.reset();
    }

    //Các chế độ chơi
    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                //  Đặt lại số bước thành 0
                this.stepsLabel.string = '0';
            }
                // Đặt hoạt động trực tiếp để bắt đầu nghe click
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
        this._curState = value;
    }

    private generateRoad(): void {
        // ....
        this.node.removeAllChildren();
        this._road = [];
        // startPos
        this._road.push(BlockType.BT_STONE);
        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                // Random() trả về từ 0<=x<1, Floor là làm tròn
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }

    // Spawn ra đường
    private spawnBlockByType(type: BlockType): Node {
        if (!this.cubePrefabs) {
            return null;
        }

        let block: Node;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrefabs);
                break;
        }
        return block;
    }

    //Khi click vào button Play
    public onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }


    //Kiểm tra
    checkResult(moveIndex: number) {
        if (moveIndex <= this.roadLength) {
            // Chuyển đến ô trống
            if (this._road[moveIndex] === BlockType.BT_NONE) {
                this.curState = GameState.GS_INIT;
            }
        } else {
            this.curState = GameState.GS_INIT;
        }
    }

    //Nhảy xog thì kiểm tra và cộng điểm
    onPlayerJumpEnd(moveIndex: number) {
        this.stepsLabel.string = '' + moveIndex;
        this.checkResult(moveIndex);
    }

    update(deltaTime: number) {

    }
}

