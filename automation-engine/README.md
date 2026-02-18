# ONES 自动化规则引擎插件（可扩展版本）

## 架构说明

Scheduler
  ↓
RuleEngine
  ↓
Rules[]
  ↓
ActionExecutor

- Scheduler: 定时触发扫描
- RuleEngine: 遍历任务并评估规则
- Rules[]: 独立规则模块，包含 condition/action
- ActionExecutor: 执行动作并统一日志

## 内置规则

- overdueReminder
  - 任务状态 = TARGET_STATUS
  - updated_at < 当前时间 - OVERDUE_DAYS
  - 未提醒过
  - 触发后自动评论并记录提醒

## 如何新增规则

1. 在 `src/rules/` 新建规则文件，导出 `{ name, description, condition, action }`
2. 在 `src/index.js` 引入并加入 rules 数组

## 如何修改规则

- 直接修改规则文件内的 condition/action 逻辑
- 不需要修改 RuleEngine 或 Scheduler

## 启动方式

### 本地

1. 复制 `.env.example` 为 `.env` 并填写参数
2. 安装依赖并启动

```bash
npm install
npm start
```

### Docker

```bash
docker build -t automation-engine .
docker run --env-file .env automation-engine
```

## 环境变量

- ONES_BASE_URL
- ONES_TOKEN
- PROJECT_ID
- OVERDUE_DAYS
- TARGET_STATUS
- CRON_SCHEDULE (可选，默认 `*/5 * * * *`)

## 示例日志

```
[engine] starting ONES automation rule engine
[engine] loaded rules: overdueReminder
[scheduler] scheduling with cron: */5 * * * *
[scheduler] started
[scheduler] scan tick
[engine] running scan
[engine] fetched issues: 120
[action] executing rule: overdueReminder on issue 12345
[engine] rule triggered: overdueReminder = 3
```
