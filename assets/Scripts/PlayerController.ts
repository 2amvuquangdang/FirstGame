import {
    _decorator,
    Component,
    Vec3,
    input,
    Input,
    EventMouse,
    Animation, SkeletalAnimation,
} from "cc";

const {ccclass, property} = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
    private _startJump: boolean = false;
    private _jumpStep: number = 0;
    private _curJumpTime: number = 0;
    private _jumpTime: number = 0.1;
    private _curJumpSpeed: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();
    private _isMoving = false;

// Add logic End game
    private _curMoveIndex = 0;

    @property({type: Animation})
    public BodyAnim: Animation | null = null;

    @property({type: SkeletalAnimation})
    public CocosAnim: SkeletalAnimation;


    start() {
        //Gán 1 biến loại hàm (Callback function) vào một input.event_type
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onMouseUp(event: EventMouse): void {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._isMoving) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        this._isMoving = true;

        if (this.CocosAnim) {
            //Hoạt ảnh nhảy mất nhiều thời gian, đây là phát lại được tăng tốc
            this.CocosAnim.getState('cocos_anim_jump').speed = 5;
            // Phát animation nhảy
            this.CocosAnim.play('cocos_anim_jump');
        }

        if (this.BodyAnim) {
            if (step === 1) {
                //this.BodyAnim.play("oneStep");
            } else if (step == 2) {
                this.BodyAnim.play("twoStep");
            }
        }

        //Add end game logic
        this._curMoveIndex += step;
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    onOnceJumpEnd() {
        this._isMoving = false;
        if (this.CocosAnim) {
            this.CocosAnim.play('cocos_anim_idle');
        }
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    reset() {
        this._curMoveIndex = 0;
    }

    update(deltaTime: number): void {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // end
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                // tween
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }
}
