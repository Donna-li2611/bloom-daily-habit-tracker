# Bloom · Habit & Life Tracker

**A self-directed personal project, initiated and developed by Xiaozhen Li (Donna).** I carry out the project's design, research and development myself, using AI tools in the workflow.

**A product case in turning everyday habits into a coherent, lightweight recording experience.**

Bloom connects daily recording, longer-term review and meaningful text or image records. Different habits need different inputs: a weekly exercise target should not behave like a daily sleep record.

## The product decisions

| Question | Choice |
| --- | --- |
| Should a three-times-a-week goal create a failure every other day? | Accumulate progress against the weekly target. |
| Should reading always require an image or AI request? | Keep direct entry and manual saving useful on their own. |
| What belongs in the content archive? | Text and image records; numerical entries remain in statistics and history. |
| What happens when AI is unavailable? | Preserve the input and allow manual saving. |

## My contribution

I define the product problem and flows, decide interaction and scope trade-offs, translate them into requirements and acceptance criteria, and review the implemented behaviour through use and testing. Development and documentation are AI-assisted.

## Evidence and scope

- [Product case](docs/product-case.md): the PWA-to-native path and concrete decisions.
- [Architecture](docs/architecture.md): the public package and application boundaries.
- [Validation record](docs/validation.md): dated checks and outstanding release verification.
- [Roadmap](docs/roadmap.md): remaining tests and evidence to collect.

This repository contains **a product case and an executable business-rule core**, rather than the full iOS application. The public package's recorded validation on **2026-09-14** passed **39 tests in 11 files** and type checking. This is separate from the original application's own QA record.

The last documented iPhone phase was release iteration. A new TestFlight build, installation results and market traction are not established by this repository. No new release result is implied by this README refresh.

### Run the public core

Node.js 22.13+:

```bash
npm install
npm test
npm run typecheck
```

These commands test business rules, not the full App or live AI services.

[Earlier Web/PWA interaction prototype](https://github.com/Donna-li2611/bloom-pwa-test) · [Portfolio home](https://github.com/Donna-li2611)

**README reviewed: 2026-10-06.** Detailed evidence retains its original dates.

---

## 中文说明

**这是我个人独立开展的项目，构思、设计、研究、制作与已有成果均由我本人完成，过程中使用AI工具辅助。**

# Bloom · Daily Habit Tracker

**从可使用的 PWA 验证，到 iPhone 原生应用：一个本地优先的习惯与生活记录产品。**

Bloom 围绕“今天记录—回看统计—保留有意义的内容”组织体验。睡眠、运动、阅读、体重等习惯采用不同的记录方式；周目标按实际频率累计，减少不必要的失败感。

**状态（2026-09-14）：iPhone / TestFlight 发布迭代中。** 本页不表示新的 TestFlight 构建已经可用。

[产品案例](docs/product-case.md) · [架构与边界](docs/architecture.md) · [验证记录](docs/validation.md) · [后续计划](docs/roadmap.md)

## 公开内容

| 内容 | 范围 |
| --- | --- |
| 产品案例 | PWA 验证、原生化、信息架构与关键取舍 |
| 核心代码 | 从原生项目提取的习惯进度、时间、统计、记录规则 |
| 自动化测试 | 与上述模块一起公开，可在本地运行 |
| 验证记录 | 区分本仓库复核与原项目已有记录 |

本仓库是产品案例与可运行的业务核心，不是完整 iOS 发布工程。App 界面、签名、部署服务和个人记录未包含在内。

## 运行核心测试

使用 Node.js 22.13 或更高版本：

```bash
npm install
npm test
npm run typecheck
```

测试覆盖周目标累计、跨午夜时间、记录呈现和统计等规则。该命令不会运行 iOS App，也不会请求 AI 服务。

## 目录

```text
docs/             产品案例、架构、决策、验证与路线图
src/domain/       从 App 提取的核心业务规则与对应测试
src/utils/        本地日期工具与测试
src/test/         合成测试工厂
CHANGELOG.md      本公开仓库的更新记录
```

## 贡献说明

项目由我个人独立开展，使用AI工具辅助编码与迭代；需求定义、体验取舍、实现与验收过程见产品案例。

隐私边界：日常记录默认保存在设备上；用户主动请求 AI 识别或生成时，所选内容会发往 AI 服务。这里没有真实个人健康记录。
