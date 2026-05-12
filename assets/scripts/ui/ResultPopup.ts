import { _decorator, Component, Button } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/** 结果弹窗组件 —— 挂载在结果面板预制体上 */
@ccclass('ResultPopup')
export class ResultPopup extends Component {
  @property(Button)
  restartBtn: Button = null!;

  @property(Button)
  nextBtn: Button = null!;

  onLoad() {
    if (this.restartBtn) {
      this.restartBtn.node.on(Button.EventType.CLICK, this.onRestart, this);
    }
    if (this.nextBtn) {
      this.nextBtn.node.on(Button.EventType.CLICK, this.onNext, this);
    }
  }

  private onRestart(): void {
    GameManager.instance.restartLevel();
  }

  private onNext(): void {
    GameManager.instance.nextLevel();
  }
}
