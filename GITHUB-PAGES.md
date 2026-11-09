# 发布准备与手机验收

这是无需构建的静态网站，当前尚未发布。

## 免费发布到 GitHub Pages

1. 新建一个公开 GitHub 仓库，例如 `thaikee-gacha`。
2. 将项目文件放在仓库根目录，尤其保留 `index.html`、`style.css`、所有运行用 JS、9 张 PNG 和 `.nojekyll`。不要再套一层同名文件夹。请保持文件名大小写一致。
3. 在仓库 Settings → Pages 中选择 Deploy from a branch，再选择实际默认分支（通常是 main）和 `/(root)`，保存。
4. 等待 GitHub 提供站点链接，通常为 `https://你的用户名.github.io/thaikee-gacha/`。

本项目的图片、脚本和样式均使用相对路径，可部署在仓库子目录。不需要 npm、构建服务、第三方字体或前端库。更换 PNG 后运行 `node scripts/build-card-assets.cjs` 并一并上传更新后的 `card-assets.js`，确保下载卡片与页面商品一致。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 已做的代码与自动化检查

- 为 320–430px 范围调整标题、机器阴影、图鉴、弹窗和导航的宽度，保留浏览器缩放；触屏按钮至少 44px，主要按钮至少 48px。
- 旋钮使用原生 button 的 click 事件，手机轻点会触发 click；不依赖 hover、拖拽或鼠标专属事件。保留防重复点击与动画中重测保护。
- PNG 卡片生成后保留图片预览、直接下载链接；如浏览器支持文件分享，会显示系统分享按钮。系统分享在第二次点击时直接调用，以保留用户激活状态。取消分享不会报错；不支持分享时仍可长按预览图保存。
- 卡片 URL 保持有效，直到重新生成或重测时才释放，避免手机尚未打开图片时过早失效。生成中切换到新测试不会显示过期卡片。
- `node tests/quiz.test.cjs`：全部 65,536 种答题组合、九款人格完整流程、双语切换、图鉴与保存备用入口；Canvas 为模拟测试。
- `node tests/pages.test.cjs`：通过临时本地 HTTP 服务，实际请求仓库子路径下的首页、脚本、样式和九张 PNG，核对状态码、大小写、PNG 签名和无远程运行依赖。测试后自动关闭服务。

## 必须在真实设备上验收

当前未做真实 iPhone Safari / Android Chrome 测试，也未做 320–430px 浏览器渲染测量；CSS 检查和 DOM 模拟不能替代这些检查。

发布 HTTPS 页面后，用两种手机分别检查：

- 320、360、375、390、414、430px 宽度，竖屏与横屏、地址栏展开和收起；每页无横向滚动，安全区和底部按钮不被遮挡。
- 两种语言完成 8 题；长文本能换行；返回修改、点选答案、旋钮轻点、掉蛋及开蛋均正常；动画期间重复点按不会重复揭晓。
- 结果、图鉴和 FIND MY SNACK 的九张图片加载、比例与透明背景正常，结果弹窗可上下滚动，关闭及系统返回行为合理。
- 下载的 PNG 是否正确生成且可读；iPhone 长按预览保存图片、系统分享中保存到“照片”或“文件”的可用选项；Android 下载、长按保存和分享。选项由系统与浏览器决定，不承诺所有设备都有“存储图像”。
- 隐私浏览、拒绝本地存储、低内存、慢速首次加载，以及系统“减少动态效果”。

保存兼容依据：https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API 和 https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a 。
