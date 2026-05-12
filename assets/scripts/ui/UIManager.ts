import { _decorator, Component, Node, Label, Button, tween, Vec3 } from 'cc';
import { GameState } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
  // ---- 顶部 UI ----
  @property(Label)
  levelLabel: Label = null!;

  @property(Label)
  taskLabel: Label = null!;

  // ---- 结果弹窗 ----
  @property(Node)
  resultPanel: Node = null!;

  @property(Label)
  resultTitle: Label = null!;

  @property(Label)
  resultSubtitle: Label = null!;

  @property(Button)
  restartButton: Button = null!;

  @property(Button)
  nextLevelButton: Button = null!;

  // ---- 道具 ----
  @property(Button)
  freshBoxButton: Button = null!;

  @property(Label)
  freshBoxCount: Label = null!;

  @property(Button)
  expandButton: Button = null!;

  @property(Label)
  expandCount: Label = null!;

  // ---- 提示 ----
  @property(Node)
  tipNode: Node = null!;

  @property(Label)
  tipLabel: Label = null!;

  // ==================== 公开 API ====================

  /** 显示关卡信息 */
  public showLevel(levelId: number): void {
    if (this.levelLabel) {
      this.levelLabel.string = `第 ${levelId} 关`;
    }
    if (this.taskLabel) {
      this.taskLabel.string = '目标：清空全部水果';
    }
    this.hideResult();
  }

  /** 显示结果弹窗 */
  public showResult(isWin: boolean, levelId: number): void {
    if (!this.resultPanel) return;

    this.resultPanel.active = true;

    if (isWin) {
      if (this.resultTitle) this.resultTitle.string = '装箱完成!';
      if (this.resultSubtitle) this.resultSubtitle.string = `第 ${levelId} 关 通过`;
      if (this.nextLevelButton) this.nextLevelButton.node.active = levelId < 10;
    } else {
      if (this.resultTitle) this.resultTitle.string = '篮筐满了';
      if (this.resultSubtitle) this.resultSubtitle.string = '重新整理一下吧';
      if (this.nextLevelButton) this.nextLevelButton.node.active = false;
    }

    // 弹入动画
    this.resultPanel.setScale(new Vec3(0, 0, 1));
    tween(this.resultPanel)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
      .start();
  }

  /** 隐藏结果弹窗 */
  public hideResult(): void {
    if (this.resultPanel) {
      this.resultPanel.active = false;
    }
  }

  /** 显示浮动提示 */
  public showTip(text: string): void {
    if (!this.tipNode || !this.tipLabel) return;

    this.tipLabel.string = text;
    this.tipNode.active = true;
    this.tipNode.setPosition(0, 200, 0);

    tween(this.tipNode)
      .to(0.5, { position: new Vec3(0, 350, 0) })
      .call(() => { this.tipNode.active = false; })
      .start();
  }

  /** 更新道具数量显示 */
  public updatePowerUpCount(type: string, count: number): void {
    switch (type) {
      case 'freshBox':
        if (this.freshBoxCount) this.freshBoxCount.string = `${count}`;
        break;
      case 'expand':
        if (this.expandCount) this.expandCount.string = `${count}`;
        break;
    }
  }

  /** 设置道具按钮可用状态 */
  public setPowerUpEnabled(type: string, enabled: boolean): void {
    const btn = type === 'freshBox' ? this.freshBoxButton : this.expandButton;
    if (btn) btn.interactable = enabled;
  }
}
