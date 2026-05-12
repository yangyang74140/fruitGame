import { _decorator, Component, Node, Label, Button, tween, Vec3, Color } from 'cc';
import { GameManager } from '../core/GameManager';

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

  // ---- 道具按钮 ----
  @property(Button)
  freshBoxButton: Button = null!;

  @property(Button)
  expandButton: Button = null!;

  // ---- 提示 ----
  @property(Node)
  tipNode: Node = null!;

  @property(Label)
  tipLabel: Label = null!;

  onLoad() {
    this.hideResult();
    if (this.tipNode) this.tipNode.active = false;
  }

  // ==================== 公开 API ====================

  public showLevel(levelId: number): void {
    if (this.levelLabel) {
      this.levelLabel.string = `第 ${levelId} 关`;
    }
    if (this.taskLabel) {
      this.taskLabel.string = '目标：清空全部水果';
    }
    this.hideResult();
  }

  public showResult(isWin: boolean, levelId: number): void {
    if (!this.resultPanel) return;

    this.resultPanel.active = true;
    this.resultPanel.setScale(new Vec3(0.5, 0.5, 1));

    if (isWin) {
      if (this.resultTitle) this.resultTitle.string = '装箱完成!';
      if (this.resultSubtitle) {
        if (levelId >= 10) {
          this.resultSubtitle.string = '恭喜通关!';
        } else {
          this.resultSubtitle.string = `第 ${levelId} 关 通过`;
        }
      }
      if (this.nextLevelButton) this.nextLevelButton.node.active = levelId < 10;
      if (this.restartButton) this.restartButton.node.active = true;
    } else {
      if (this.resultTitle) this.resultTitle.string = '篮筐满了';
      if (this.resultSubtitle) this.resultSubtitle.string = '重新整理一下吧';
      if (this.nextLevelButton) this.nextLevelButton.node.active = false;
      if (this.restartButton) this.restartButton.node.active = true;
    }

    tween(this.resultPanel)
      .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
      .start();
  }

  public hideResult(): void {
    if (this.resultPanel) {
      this.resultPanel.active = false;
    }
  }

  public showTip(text: string): void {
    if (!this.tipNode || !this.tipLabel) return;

    // 停止之前的动画
    tween(this.tipNode).stop();

    this.tipLabel.string = text;
    this.tipNode.active = true;
    this.tipNode.setPosition(0, 250, 0);
    this.tipNode.setScale(0.8, 0.8, 1);

    tween(this.tipNode)
      .to(0.15, { scale: new Vec3(1, 1, 1) })
      .to(1.0, { position: new Vec3(0, 400, 0) })
      .to(0.2, { scale: new Vec3(0.5, 0.5, 1) })
      .call(() => {
        this.tipNode.active = false;
      })
      .start();
  }

  // ---- 道具按钮 ----

  public onFreshBoxClick(): void {
    GameManager.instance.usePowerUp('freshBox' as any);
  }

  public onExpandClick(): void {
    GameManager.instance.usePowerUp('expand' as any);
  }

  public onRestartClick(): void {
    GameManager.instance.restartLevel();
  }

  public onNextLevelClick(): void {
    GameManager.instance.nextLevel();
  }
}
