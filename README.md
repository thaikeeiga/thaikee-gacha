# THAI KEE MINI GACHA · What's Your Snack Personality?

无需安装依赖、无需联网。双击 index.html，或将它拖入 Chrome / Edge / Firefox / Safari。保持所有项目文件在同一文件夹，修改后按 Ctrl+F5 刷新。

## 流程

欢迎页 START TEST → 8 道题（每题 4 选 1）→ 完成后显示原有扭蛋机 → 转动旋钮 → 点击掉落的扭蛋 → 揭晓人格分析、标签及商品 → 保存卡片或查看门店 → 重新测试。

可返回上一题修改答案。顶部及结果弹窗内均有中文 / EN 切换，不会丢失当前答案。答题未完成时无法抽取。关闭结果后可再次揭晓同一结果；“重新测试”清空本轮答案。

## 固定计分

quiz-data.js 维护 9 款人格、双语分析、标签、8 道题和计分规则。9 款普通人格各有一个由 0–3 构成的参考答案签名，每题：匹配签名得 3 分；答案值加 1 后对 4 取模匹配签名得 1 分；其余得 0 分。一个选项会给多个人格贡献不同分数。最高分胜出；平分按目录固定顺序决定，不使用随机数。

九个普通签名彼此不同，按其签名作答均获得 24 分并独立胜出。纯娱乐测试，不是科学心理评估。

## 图片、图鉴与下载

九款人格均使用 quiz-data.js 指定的真实 PNG，结果、图鉴和商品介绍采用 object-fit: contain 等比例完整显示。透明图片使用页面本身的奶油白背景，没有额外的白底或黑底。Kopiko 原文件 kopiko.png.png 已修正为 kopiko.png，未删除素材。card-assets.js 内嵌九张原图，确保本地打开时也可生成分享卡片。更换图片后运行 node scripts/build-card-assets.cjs 重新生成，无需安装依赖。

SAVE MY CARD 下载 1200 × 1520 的 PNG 分享卡片，包含人格、标签、对应商品原图和当前语言的品牌提示。内部先生成含 Base64 原图的 SVG，再用浏览器 Canvas 导出真正的 image/png；使用等比例绘制，保持透明部分的合成正确。图鉴使用稳定人格 id，存储键为 thaikee-personality-collection-v1。旧版 6 款图鉴中身份相同的 AD 钙奶会迁移，其他旧角色不冒充新人格。浏览器限制本地存储时仍可完成当前试玩。

## 商品推广维护

promotion.js 的 snackProducts 维护商品映射。saleStatus 支持 unconfirmed（默认）/ confirmed / unavailable。只有 confirmed 且同时提供有效 confirmedAt（ISO 时间）、confirmedStore（haymarket）、非空 confirmationSource，才显示购买引导。7 天后自动回退为未确认文案。请在实际核实后更新；有图片不等于在售。

FIND MY SNACK 是展开商品和门店资料的探索操作。未确认时详情使用不承诺库存的文案。门店地址维护在 thaiKeeStores，来源 https://thaikeeiga.com.au/ 。无付款、真实奖品或远程答题数据收集。

## 自动化检查

运行 node tests/quiz.test.cjs（Node 内置模块，不需安装依赖）。检查全部 65,536 种答案组合的确定性和人格可达性，并模拟九种完整答题、计分、动画回调、揭晓、重测、图鉴存储、语言切换、返回改答案、下载内容及在售状态检查。另外检查九个 PNG 文件签名、映射、内嵌图片字节和 PNG 导出流程。Canvas 部分使用模拟对象，不等于实际浏览器渲染；九张原文件已使用 System.Drawing 成功解码并核查透明通道。

自动化使用 DOM 模拟，不等于真实浏览器渲染。桌面/手机视觉、真实动画观感、真实文件下载和浏览器存储兼容性尚未浏览器实测。

## 手机与 GitHub Pages 发布准备

已调整 320–430px 范围的排版、按钮点击尺寸和弹窗滚动。保存卡片后提供预览、直接下载链接及支持时的系统分享按钮，不支持下载/分享时可尝试长按预览保存。分享入口在单独的一次点击中触发；用户取消分享不显示错误。图片 URL 保留到重测或重新生成时才释放。

运行 `node tests/pages.test.cjs` 可实际检查 HTTP 仓库子目录的资源加载，结束后自动关闭临时服务。GitHub Pages 发布步骤、检查范围和 iPhone Safari / Android Chrome 真机验收清单见 [GITHUB-PAGES.md](GITHUB-PAGES.md)。目前未发布，未添加第三方运行依赖。

当前目录为 9 款人格。未来新增人格时，在 quiz-data.js 的 personalities 中追加稳定 id、双语文案、标签和 8 项参考答案 signature；计分、商品映射和图鉴总数均从目录自动生成，无需硬编码第 10 项。旧收藏中不在当前目录的 id 会被忽略，不计入当前图鉴。
