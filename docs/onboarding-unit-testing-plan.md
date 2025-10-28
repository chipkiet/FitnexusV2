# Onboarding — Nutrition AI (Single Core Feature)

Kịch bản 3 giờ • 25+ test cases • ≥80% coverage

---

## 1/12 — Mục tiêu & Phạm vi
- Single core feature duy nhất cho luồng Onboarding của Nutrition AI.
- Feature: Thu thập hồ sơ dinh dưỡng và tạo kế hoạch gợi ý bằng AI (Profile Intake → AI Analysis → Review → Done).
- Hướng dẫn từng bước + prompt để dùng AI hỗ trợ viết test và code.

---

## 2/12 — Timeline (180 phút)
- Phân tích — 15'
- Thiết kế — 20'
- Code — 75'
- Debug — 40'
- Tối ưu — 15'
- Demo — 15'

Lưu ý: Chỉ tập trung vào 1 feature chính ở trên.

---

## 3/12 — Core Feature (15')
**Core Feature:** Nutrition Profile Intake + AI Plan Suggestion

Tại sao chọn?
- Trọng tâm của onboarding Nutrition AI, có giá trị ngay khi hoàn tất.
- Nhiều rule kiểm tra dữ liệu (tuổi, chiều cao, cân nặng, mục tiêu, dị ứng...).
- Có dependency rõ ràng để mock (NutritionAIService.analyzeProfile).

Các function cần test (API dự kiến của OnboardingManager):
- `start(userId)` — khởi tạo luồng, validate user.
- `updateProfileField(field, value)` — cập nhật field có kiểm tra phạm vi/kiểu.
- `validateProfile()` — trả về danh sách lỗi hoặc rỗng nếu hợp lệ.
- `submitProfile()` — khóa dữ liệu, chuyển sang phân tích.
- `requestAiPlan()` — gọi AI service, lưu proposal; chuyển sang review.
- `approvePlan(planId)` — xác nhận kế hoạch, kết thúc luồng.
- `getCurrentStep()` — tiện ích truy vấn bước hiện tại.

Invariants quan trọng cần đảm bảo qua test:
- Bước khởi tạo luôn là `collect_profile` với status `pending`.
- Chỉ được gọi `requestAiPlan` khi đang ở bước `ai_analysis` (sau `submitProfile`).
- Chỉ được gọi `approvePlan` khi đang ở bước `review_plan` và `planId` hợp lệ.
- Sau khi `approvePlan` thành công, bước hiện tại chuyển sang `done`.

Ví dụ skeleton (để AI phân tích và sinh test):

```js
// OnboardingManager.js — Nutrition AI Onboarding (Single Feature)
class OnboardingManager {
  constructor(userId) {
    this.userId = userId;
    this.steps = [
      { id: 'collect_profile', status: 'pending' },
      { id: 'ai_analysis', status: 'pending' },
      { id: 'review_plan', status: 'pending' },
      { id: 'done', status: 'pending' }
    ];
    this.currentIndex = 0;
    this.profile = { age: null, heightCm: null, weightKg: null, goal: null, allergies: [] };
    this.plan = null;
  }

  start() {
    if (!this.userId) throw new Error('Missing user');
    return this.getCurrentStep();
  }

  getCurrentStep() { return this.steps[this.currentIndex] || null; }

  updateProfileField(field, value) {
    const allowed = ['age','heightCm','weightKg','goal','allergies'];
    if (!allowed.includes(field)) throw new Error('Invalid field');
    if (field === 'age' && (value < 5 || value > 120)) throw new Error('Invalid age');
    if (field === 'heightCm' && (value < 80 || value > 250)) throw new Error('Invalid height');
    if (field === 'weightKg' && (value < 20 || value > 300)) throw new Error('Invalid weight');
    if (field === 'allergies' && !Array.isArray(value)) throw new Error('Invalid allergies');
    this.profile[field] = value;
    return true;
  }

  validateProfile() {
    const errors = [];
    if (!this.profile.age) errors.push('age');
    if (!this.profile.heightCm) errors.push('heightCm');
    if (!this.profile.weightKg) errors.push('weightKg');
    if (!this.profile.goal) errors.push('goal');
    return errors;
  }

  submitProfile() {
    const errors = this.validateProfile();
    if (errors.length) throw new Error('Invalid profile: ' + errors.join(','));
    this.steps[this.currentIndex].status = 'completed';
    this.currentIndex += 1; // move to ai_analysis
    return this.getCurrentStep();
  }

  async requestAiPlan(NutritionAIService) {
    if (this.getCurrentStep()?.id !== 'ai_analysis') throw new Error('Invalid step');
    const plan = await NutritionAIService.analyzeProfile(this.profile);
    if (!plan || !plan.id) throw new Error('Invalid plan');
    this.plan = plan;
    this.steps[this.currentIndex].status = 'completed';
    this.currentIndex += 1; // move to review_plan
    return plan;
  }

  approvePlan(planId) {
    if (this.getCurrentStep()?.id !== 'review_plan') throw new Error('Invalid step');
    if (!this.plan || this.plan.id !== planId) throw new Error('Plan mismatch');
    this.steps[this.currentIndex].status = 'completed';
    this.currentIndex += 1; // done
    return this.getCurrentStep(); // bước hiện tại là 'done'
  }
}

module.exports = OnboardingManager;
```

---

## 4/12 — Prompt 1: Phân tích Code với AI
"Analyze this Nutrition AI Onboarding manager and identify all functions that need unit testing:

[PASTE YOUR CODE HERE]

For each function, identify:
1. Main functionality
2. Input parameters and types
3. Expected return values
4. Potential edge cases
5. Dependencies that need mocking (e.g., NutritionAIService)"

AI Output mong đợi: danh sách hàm, input, return, edge cases, dependencies.

---

## 5/12 — Thiết kế Test Cases (20')
Thiết kế theo Given-When-Then, chia nhóm Happy • Edge • Error • State.

- start()
  - Happy: userId hợp lệ → trả về bước `collect_profile`.
  - Error: thiếu userId → throw `Missing user`.

- getCurrentStep()
  - Happy: ban đầu là `collect_profile`, sau `submitProfile` là `ai_analysis`, sau AI là `review_plan`, sau approve là `done`.

- updateProfileField(field, value)
  - Happy: cập nhật từng field hợp lệ, trả về true; profile lưu đúng.
  - Edge: các giới hạn biên số học (age=5/120, height=80/250, weight=20/300); `allergies` là mảng rỗng hoặc nhiều phần tử.
  - Error: field không hợp lệ; `allergies` không phải mảng; giá trị ngoài phạm vi.

- validateProfile()
  - Happy: profile hợp lệ → trả về mảng rỗng.
  - State/Error: thiếu từng field → trả về danh sách khóa lỗi tương ứng.

- submitProfile()
  - Happy: profile hợp lệ → bước `collect_profile` chuyển `completed`, current → `ai_analysis`.
  - Error: profile thiếu/invalid → throw `Invalid profile: ...`.

- requestAiPlan(NutritionAIService)
  - Happy: đang ở `ai_analysis`, mock `analyzeProfile` trả về `{ id: 'p1', kcal: 2000 }` → lưu `plan`, current → `review_plan`.
  - Error: gọi sai bước → throw `Invalid step`.
  - Error: mock trả `null` hoặc thiếu `id` → throw `Invalid plan`.
  - Error: mock reject (lỗi network) → propagate reject.

- approvePlan(planId)
  - Happy: đang ở `review_plan` và `planId` khớp → current → `done`.
  - Error: sai bước → throw `Invalid step`.
  - Error: không có `plan` hoặc `planId` không khớp → throw `Plan mismatch`.

---

## 6/12 — Test Cases Matrix (ví dụ cho updateProfileField)
| Category | Test Case                      | Input                          | Expected            |
|----------|--------------------------------|--------------------------------|---------------------|
| Happy    | Set valid age                  | field='age', value=30          | return true         |
| Happy    | Set allergies array            | field='allergies', ['nuts']    | return true         |
| Edge     | Age lower bound                | field='age', value=5           | return true         |
| Edge     | Height upper bound             | field='heightCm', value=250    | return true         |
| Error    | Invalid field name             | field='email', value='x'       | throws 'Invalid field' |
| Error    | Weight out of range            | field='weightKg', value=400    | throws 'Invalid weight' |
| Error    | Allergies not array            | field='allergies', value='x'   | throws 'Invalid allergies' |

Tip: Mỗi hàm tối thiểu 3–4 case để đạt coverage tốt.

---

## 7/12 — Sinh Test Code (75')
Prompt 3: Generate Jest tests cho tất cả hàm chính

Requirements:
- Jest framework, setup/teardown rõ ràng.
- Assertions: toBe, toEqual, toThrow, resolves/rejects.
- Mock dependency: `NutritionAIService.analyzeProfile`.
- Kiểm tra chuyển bước (state machine) và dữ liệu lưu (profile/plan).

---

## 8/12 — AI Generated Test Code (ví dụ)
```js
// OnboardingManager.test.js
const OnboardingManager = require('./OnboardingManager');

describe('Nutrition AI Onboarding — single feature', () => {
  let flow;
  beforeEach(() => { flow = new OnboardingManager('u1'); });

  describe('start & getCurrentStep', () => {
    test('starts with collect_profile', () => {
      const step = flow.start();
      expect(step.id).toBe('collect_profile');
    });

    test('throws when missing user', () => {
      const f = () => new OnboardingManager(null).start();
      expect(f).toThrow('Missing user');
    });
  });

  describe('updateProfileField', () => {
    test('sets valid age', () => {
      expect(flow.updateProfileField('age', 30)).toBe(true);
      expect(flow.profile.age).toBe(30);
    });

    test('rejects invalid field', () => {
      expect(() => flow.updateProfileField('email', 'x')).toThrow('Invalid field');
    });

    test('rejects out-of-range weight', () => {
      expect(() => flow.updateProfileField('weightKg', 400)).toThrow('Invalid weight');
    });
  });

  describe('requestAiPlan', () => {
    test('calls AI and moves to review', async () => {
      flow.updateProfileField('age', 30);
      flow.updateProfileField('heightCm', 175);
      flow.updateProfileField('weightKg', 70);
      flow.updateProfileField('goal', 'lose_weight');
      flow.submitProfile(); // move to ai_analysis

      const NutritionAIService = { analyzeProfile: jest.fn().mockResolvedValue({ id: 'plan1', kcal: 2000 }) };
      const plan = await flow.requestAiPlan(NutritionAIService);
      expect(plan.id).toBe('plan1');
      expect(flow.plan).toEqual({ id: 'plan1', kcal: 2000 });
      expect(flow.getCurrentStep().id).toBe('review_plan');
    });

    test('rejects when not in ai_analysis', async () => {
      const NutritionAIService = { analyzeProfile: jest.fn() };
      await expect(flow.requestAiPlan(NutritionAIService)).rejects.toThrow('Invalid step');
    });

    test('rejects invalid plan shape', async () => {
      flow.updateProfileField('age', 30);
      flow.updateProfileField('heightCm', 175);
      flow.updateProfileField('weightKg', 70);
      flow.updateProfileField('goal', 'lose_weight');
      flow.submitProfile();
      const NutritionAIService = { analyzeProfile: jest.fn().mockResolvedValue(null) };
      await expect(flow.requestAiPlan(NutritionAIService)).rejects.toThrow('Invalid plan');
    });
  });

  describe('submitProfile & approvePlan', () => {
    test('submit moves to ai_analysis', () => {
      flow.updateProfileField('age', 30);
      flow.updateProfileField('heightCm', 175);
      flow.updateProfileField('weightKg', 70);
      flow.updateProfileField('goal', 'lose_weight');
      const step = flow.submitProfile();
      expect(step.id).toBe('ai_analysis');
    });

    test('approve moves to done', async () => {
      flow.updateProfileField('age', 30);
      flow.updateProfileField('heightCm', 175);
      flow.updateProfileField('weightKg', 70);
      flow.updateProfileField('goal', 'lose_weight');
      flow.submitProfile();
      const NutritionAIService = { analyzeProfile: jest.fn().mockResolvedValue({ id: 'planX' }) };
      await flow.requestAiPlan(NutritionAIService);
      const step = flow.approvePlan('planX');
      expect(step.id).toBe('done');
    });

    test('approve fails on step mismatch', () => {
      expect(() => flow.approvePlan('p1')).toThrow('Invalid step');
    });
  });
});
```

---

## 9/12 — Chạy & Debug Tests (40')
Commands
```bash
npm test
npm test -- --coverage
npm test -- --watch
```

Debug thường gặp: Module not found, undefined, assertion failed, timeout.

Prompt 4: "Help me fix this failing unit test: [ERROR + TEST + SOURCE]"

---

## 10/12 — Tối ưu & Mocking (15')
Mock External Dependency (NutritionAIService)
```js
// __mocks__/NutritionAIService.js
module.exports = { analyzeProfile: jest.fn() };
```

Sử dụng trong test: `jest.mock('../services/NutritionAIService')` và set return phù hợp.

Lưu ý:
- Ưu tiên mock tường minh tại từng test (inline) để kiểm soát hành vi.
- Với test async, luôn `await` và dùng `resolves/rejects` để chắc chắn assertion thực thi.

---

## 11/12 — Documentation & Demo (15')
Cấu trúc Deliverables (đề xuất)
```
packages/frontend/src/features/onboarding/
  OnboardingManager.js
  __tests__/OnboardingManager.test.js
  __mocks__/NutritionAIService.js
docs/onboarding-unit-testing-plan.md  ← (tài liệu này)
coverage/index.html (generated)
```

Scope README (rút gọn)
```md
# Nutrition AI Onboarding — Single Feature

## Setup
```bash
npm install
npm test
```

## Scope
- 01 feature duy nhất: Profile Intake + AI Suggestion
- ≥80% coverage cho OnboardingManager
- Mock NutritionAIService.analyzeProfile
- Kiểm tra đầy đủ chuyển bước: collect_profile → ai_analysis → review_plan → done
```

---

Gợi ý: Giữ phạm vi thật gọn — chỉ 4 bước (collect_profile → ai_analysis → review_plan → done). Bất kỳ yêu cầu thêm đều coi là ngoài scope.
