import { _decorator, Component, Button } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * 结果弹窗 —— 挂载在 resultPanel 节点上
 * 按钮事件在 Cocos Creator 编辑器中绑定
 */
@ccclass('ResultPopup')
export class ResultPopup extends Component {
  @property(Button)
  restartBtn: Button = null!;

  @property(Button)
  nextBtn: Button = null!;

  onLoad() {
    if (this.restartBtn) {
      this.restartBtn.node.on(Button.EventType.CLICK, () => {
        GameManager.instance.restartLevel();
      }, this);
    }
    if (this.nextBtn) {
      this.nextBtn.node.on(Button.EventType.CLICK, () => {
        GameManager.instance.nextLevel();
      }, this);
    }
  }

  onDestroy() {
    if (this.restartBtn) {
      this.restartBtn.node.off(Button.EventType.CLICK, undefined, this);
    }
    if (this.nextBtn) {
      this.nextBtn.node.off(Button.EventType.CLICK, undefined, this);
    }
  }
}
