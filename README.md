# Transit Compass HK / 香港出行地圖

A Hong Kong travel comparison prototype that helps people evaluate route choices, transfer burden, monthly-pass value, and live ETA risk before committing to a trip.

This project is designed for Hong Kong commuters who want to compare transit options across buses, MTR, and other route types while keeping the decision process transparent and explainable.

## 1) What the web does / 網站做咩

### English

The web app does four main things:

- Maps the trip in Hong Kong by comparing route alternatives between origin and destination.
- Ranks routes using a weighted score that mixes journey time, waiting time, transfer count, walking burden, and operator preference.
- Highlights whether a monthly pass is a worthwhile purchase by comparing route costs against pass value.
- Shows map, place search, traffic notices, and route updates so the user can see conditions before travel.

In practice, the home page presents a route shortlist, explains the best option, and surfaces practical details like fare, transfer count, service interval, and ETA context.

### 中文（香港）

網站主要做四件事：

- 以香港地圖／地點搜尋方式，比較起點和終點之間的多個路線選擇。
- 用加權評分方法，結合行車時間、等車時間、轉車次數、步行負擔和車公司偏好，排出路線優先級。
- 透過月票收益分析，判斷某些出行是否值得買月票。
- 顯示地圖、地點搜尋、交通通告和路線更新，讓使用者在出發前知道路況與事件。

實際上，首頁會列出多個候選路線，標示最佳選擇，並展示車費、轉車次數、班次頻率和到站預估等關鍵資訊。

## 2) New score weighting method / 新評分權重方法

### English

The route score is a cost-like heuristic where lower is better. Each leg contributes a score based on the time cost and operator penalty, and the whole route adds transfer and walking penalties.

Formula overview:

- Leg score = journey time + ETA component + operator penalty
- ETA component = fresh live ETA if valid, otherwise scheduled ETA proxy
- operating penalty is tuned by operator preference
- route score = leg subtotal + walking transfer time + long-distance transfer surcharge + transfer penalty

The current weighting logic is defined in `src/engine/UpgradedScoringEngine.ts`.

Key rules:

- Segment multiplier depends on time-of-day:
  - Late night (23:00-05:50): 1.8
  - Peak (07:00-09:30 and 17:00-19:30): 1.0
  - Off-peak: 1.3
- Scheduled ETA component is calculated as `scheduledIntervalMinutes * 0.5 * segmentMultiplier`
- Live ETA is used only if it is fresh enough; stale ETA is ignored to avoid scoring with outdated data
- Operator penalties:
  - KMB: -1
  - LWB: -0.46
  - MTR: 0.5
  - CTB: 1
- Transfer penalty: `transferCount * 8` minutes
- Walk transfer penalty: `walkTransferTimeMinutes`
- Longer transfers may add a surcharge for long-distance or Central/Hong Kong station transitions

At route level:

```text
finalScore = legSubtotal + walkTransferTimeMinutes + longDistanceTransferSurcharge + transferCount * 8
```

This means the web is not using a pure fastest-route rule. It combines time, wait, transfer friction, and operator preference to produce a more practical commuter ranking.

### 中文（香港）

路線評分採用「越低越好」的代價型模型。每段行程會先計算時間成本與車公司懲罰值，最後再把轉車和步行負擔加入整體分數。

總覽公式：

- 每段分數 = 行車時間 + 到站預估分量 + 車公司懲罰
- 到站預估分量 = 若即時數據新鮮，使用即時 ETA；否則採用班次頻率估算值
- 全程分數 = 各段小計 + 步行轉乘時間 + 長距離轉乘附加費 + 轉車懲罰

目前的評分邏輯位於 `src/engine/UpgradedScoringEngine.ts`。

關鍵規則：

- 時段乘數會依照出行時間調整：
  - 深夜（23:00-05:50）：1.8
  - 繁忙時間（07:00-09:30 及 17:00-19:30）：1.0
  - 非繁忙時間：1.3
- 排班 ETA 分量為：`scheduledIntervalMinutes * 0.5 * segmentMultiplier`
- 即時 ETA 只在足夠新鮮時才使用，過期數據會被忽略，避免用失效資料誤判
- 車公司懲罰：
  - 九巴：-1
  - 新巴/龍運：-0.46
  - 港鐵：0.5
  - 城巴：1
- 轉車懲罰：`transferCount * 8` 分鐘
- 步行轉乘懲罰：`walkTransferTimeMinutes`
- 若轉乘為長距離轉乘，或出現中環／香港站等關鍵轉乘場景，會額外加長距離轉乘附加費

路線總分可概括為：

```text
finalScore = legSubtotal + walkTransferTimeMinutes + longDistanceTransferSurcharge + transferCount * 8
```

這代表網站不是單純按最快路線選擇，而是把行車時間、候車時間、轉車負擔、步行負擔和車公司偏好一併納入，較貼近實際通勤決策。

## 3) Project status / 項目狀態

### English

This is still a prototype and demo route results are intentionally separate from production transport feeds. The project exposes transit APIs and includes source attribution, but live routing should only be described as live after provider contracts and data quality checks are complete.

### 中文（香港）

目前仍屬原型階段，示範路線結果會與正式交通資料來源分開處理。項目已提供交通 API 和來源標註，但只有在供應商合約與資料品質檢查完成後，才應將路線稱為真正的即時交通資料。

## 4) API and data source notes / API 及資料來源備註

### English

The app includes route and ETA API endpoints for route discovery, ETA proxying, live transit feed access, updates, and traffic events. You can find the relevant handlers under `src/app/api/*`.

The implementation intentionally uses strict allowlists and does not silently turn an upstream outage into fake real-time data.

### 中文（香港）

應用程式提供路線、到站預估、交通更新和交通事件相關 API，相關實作位於 `src/app/api/*`。實作採用了嚴格白名單，避免把上游故障誤翻譯成假即時數據。

## 5) Local development / 本地開發

```bash
npm install
npm run dev
```

Then open the local app in the browser.

## 6) Deployment / 部署

This project is built for a Cloudflare/OpenNext environment.

```bash
npm run build
npm run cf:build
npx wrangler deploy
```

## 7) Summary / 總結

Transit Compass HK is a commuter-focused Hong Kong route scoring tool. It compares trip options using a practical commuter model rather than a single pure-speed ranking, and it keeps the score logic transparent and explainable.

香港出行地圖是一個以通勤者為中心的香港路線評分工具。它不是單純按最快路線做決策，而是透過實際通勤考量，將時間、轉車、步行、車費和路況一併納入評分，讓選路更符合日常使用情境。