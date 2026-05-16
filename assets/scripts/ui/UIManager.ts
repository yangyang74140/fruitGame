import { _decorator, Component, Node, Label, Button, tween, Vec3, Color, find } from 'cc';
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

  @property(Label)
  freshBoxCountLabel: Label = null!;

  @property(Label)
  expandCountLabel: Label = null!;

  @property(Label)
  basketStatusLabel: Label = null!;

  // ---- 提示 ----
  @property(Node)
  tipNode: Node = null!;

  @property(Label)
  tipLabel: Label = null!;

  onLoad() {
    this.autoBind();
    this.hideResult();
    if (this.tipNode) this.tipNode.active = false;
  }

  private autoBind(): void {
    // ---- 顶部 UI ----
    if (!this.levelLabel) this.levelLabel = this.findLabel('Canvas/UIManager/TopBar/levelLabel');
    if (!this.taskLabel) this.taskLabel = this.findLabel('Canvas/UIManager/TopBar/taskLabel');
    if (!this.basketStatusLabel) this.basketStatusLabel = this.findLabel('Canvas/UIManager/TopBar/basketStatusLabel');

    // ---- 结果弹窗 ----
    if (!this.resultPanel) this.resultPanel = find('Canvas/UIManager/resultPanel');
    if (!this.resultTitle) this.resultTitle = this.findLabel('Canvas/UIManager/resultPanel/resultTitle');
    if (!this.resultSubtitle) this.resultSubtitle = this.findLabel('Canvas/UIManager/resultPanel/resultSubtitle');
    if (!this.restartButton) this.restartButton = this.findButton('Canvas/UIManager/resultPanel/restartButton');
    if (!this.nextLevelButton) this.nextLevelButton = this.findButton('Canvas/UIManager/resultPanel/nextLevelButton');

    // ---- 道具按钮 ----
    if (!this.freshBoxButton) this.freshBoxButton = this.findButton('Canvas/PowerUpPanel/freshBoxButton');
    if (!this.expandButton) this.expandButton = this.findButton('Canvas/PowerUpPanel/expandButton');
    if (!this.freshBoxCountLabel) this.freshBoxCountLabel = this.findLabel('Canvas/PowerUpPanel/freshBoxButton/freshBoxCountLabel');
    if (!this.expandCountLabel) this.expandCountLabel = this.findLabel('Canvas/PowerUpPanel/expandButton/expandCountLabel');

    // ---- 提示 ----
    if (!this.tipNode) this.tipNode = find('Canvas/UIManager/tipNode');
    if (!this.tipLabel) this.tipLabel = this.findLabel('Canvas/UIManager/tipNode');

    // ---- 按钮点击事件（代码绑定，不需要在编辑器里绑） ----
    this.bindButtonEvent(this.freshBoxButton, 'onFreshBoxClick');
    this.bindButtonEvent(this.expandButton, 'onExpandClick');
    this.bindButtonEvent(this.restartButton, 'onRestartClick');
    this.bindButtonEvent(this.nextLevelButton, 'onNextLevelClick');
  }

  private findLabel(path: string): Label | null {
    const node = find(path);
    if (!node || !node.isValid) return null;
    return node.getComponent(Label);
  }

  private findButton(path: string): Button | null {
    const node = find(path);
    if (!node || !node.isValid) return null;
    return node.getComponent(Button);
  }

  private bindButtonEvent(btn: Button | null, handlerName: string): void {
    if (!btn) return;
    (btn.node as any).off('click'); // 避免重复绑定
    btn.node.on('click', (this as any)[handlerName], this);
  }

  // ==================== 公开 API ====================

  public showLevel(levelId: number): void {
    if (this.levelLabel) {
      this.levelLabel.string = `第 ${levelId} 关`;
    }
    if (this.taskLabel) {
      this.taskLabel.string = '目标：清空全部水果';
    }
    if (this.basketStatusLabel) {
      this.basketStatusLabel.string = '篮筐容量：6 格';
    }
    this.hideResult();
  }

  public showResult(isWin: boolean, levelId: number): void {
    if (!this.resultPanel || !this.resultPanel.isValid) return;

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
    if (!this.tipNode || !this.tipNode.isValid || !this.tipLabel) return;

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
        if (this.tipNode && this.tipNode.isValid) {
          this.tipNode.active = false;
        }
      })
      .start();
  }

  public updatePowerUpState(freshBoxCount: number, expandCount: number, basketCapacity: number): void {
    if (this.freshBoxCountLabel) {
      this.freshBoxCountLabel.string = `保鲜盒 x${freshBoxCount}`;
    }
    if (this.expandCountLabel) {
      this.expandCountLabel.string = `扩容 x${expandCount}`;
    }
    if (this.basketStatusLabel) {
      this.basketStatusLabel.string = `篮筐容量：${basketCapacity} 格`;
    }
    if (this.freshBoxButton) {
      this.freshBoxButton.interactable = freshBoxCount > 0;
    }
    if (this.expandButton) {
      this.expandButton.interactable = expandCount > 0;
    }
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
